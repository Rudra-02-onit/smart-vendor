<?php

session_start();

include "../db.php";

// Check login
if (!isset($_SESSION["user_id"])) {
    header("Location: ../login.php");
    exit();
}

// Only vendor allowed
if ($_SESSION["user_role"] !== "vendor") {
    header("Location: ../login.php");
    exit();
}

$vendor_id = (int)$_SESSION["user_id"];

// Check booking ID
if (!isset($_GET["id"]) || !is_numeric($_GET["id"])) {
    die("Invalid booking ID.");
}

$booking_id = (int)$_GET["id"];

// Check status
if (!isset($_GET["status"])) {
    die("Booking status missing.");
}

$status = strtolower(trim($_GET["status"]));

// Only accepted or rejected
if ($status !== "accepted" && $status !== "rejected") {
    die("Invalid booking status: " . htmlspecialchars($status));
}


// ==========================================
// GET BOOKING DETAILS
// ==========================================

$stmt = $conn->prepare("
    SELECT id, status
    FROM bookings
    WHERE id = ? AND vendor_id = ?
");

if (!$stmt) {
    die("Prepare Error: " . $conn->error);
}

$stmt->bind_param("ii", $booking_id, $vendor_id);

if (!$stmt->execute()) {
    die("Execute Error: " . $stmt->error);
}

$result = $stmt->get_result();

if ($result->num_rows == 0) {
    die("Booking not found or this booking does not belong to you.");
}

$booking = $result->fetch_assoc();

$stmt->close();


// ==========================================
// ONLY PENDING BOOKING CAN BE UPDATED
// ==========================================

if ($booking["status"] !== "pending") {
    die("This booking has already been processed.");
}


// ==========================================
// START TRANSACTION
// ==========================================

$conn->begin_transaction();

try {

    // ==========================================
    // IF REJECTED → RETURN VEGETABLE STOCK
    // ==========================================

    if ($status === "rejected") {

        // Get booked vegetable quantity
        $item_stmt = $conn->prepare("
            SELECT vegetable_id, quantity
            FROM booking_items
            WHERE booking_id = ?
        ");

        if (!$item_stmt) {
            throw new Exception("Could not get booking item.");
        }

        $item_stmt->bind_param("i", $booking_id);

        if (!$item_stmt->execute()) {
            throw new Exception("Could not fetch booking item.");
        }

        $item_result = $item_stmt->get_result();

        if ($item_result->num_rows == 0) {
            throw new Exception("Booking item not found.");
        }

        while ($item = $item_result->fetch_assoc()) {

            $vegetable_id = (int)$item["vegetable_id"];
            $quantity = (float)$item["quantity"];

            // Return quantity to vegetable stock
            $stock_stmt = $conn->prepare("
                UPDATE vegetables
                SET available_quantity = available_quantity + ?
                WHERE id = ?
            ");

            if (!$stock_stmt) {
                throw new Exception("Stock update failed.");
            }

            $stock_stmt->bind_param(
                "di",
                $quantity,
                $vegetable_id
            );

            if (!$stock_stmt->execute()) {
                throw new Exception("Vegetable stock could not be restored.");
            }

            $stock_stmt->close();
        }

        $item_stmt->close();
    }


    // ==========================================
    // UPDATE BOOKING STATUS
    // ==========================================

    $update_stmt = $conn->prepare("
        UPDATE bookings
        SET status = ?
        WHERE id = ?
        AND vendor_id = ?
        AND status = 'pending'
    ");

    if (!$update_stmt) {
        throw new Exception("Status update failed.");
    }

    $update_stmt->bind_param(
        "sii",
        $status,
        $booking_id,
        $vendor_id
    );

    if (!$update_stmt->execute()) {
        throw new Exception("Error updating booking.");
    }

    if ($update_stmt->affected_rows == 0) {
        throw new Exception("Booking status was not updated.");
    }

    $update_stmt->close();


    // ==========================================
    // COMMIT
    // ==========================================

    $conn->commit();

    // Back to bookings page
    header("Location: bookings.php");
    exit();


} catch (Exception $e) {

    // Rollback if anything fails
    $conn->rollback();

    die(
        "Booking update failed: " .
        htmlspecialchars($e->getMessage())
    );
}

?>