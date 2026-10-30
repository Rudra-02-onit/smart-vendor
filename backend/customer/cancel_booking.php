<?php

session_start();

include "../db.php";

// Check login
if (!isset($_SESSION["user_id"])) {
    header("Location: ../login.php");
    exit();
}

// Only customer allowed
if ($_SESSION["user_role"] !== "customer") {
    header("Location: ../login.php");
    exit();
}

$customer_id = (int)$_SESSION["user_id"];

// Check booking ID
if (!isset($_GET["id"]) || !is_numeric($_GET["id"])) {
    die("Invalid booking ID.");
}

$booking_id = (int)$_GET["id"];

// Get booking
$stmt = $conn->prepare("
    SELECT id, status
    FROM bookings
    WHERE id = ? AND customer_id = ?
");

$stmt->bind_param("ii", $booking_id, $customer_id);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows == 0) {
    die("Booking not found.");
}

$booking = $result->fetch_assoc();
$stmt->close();

// Only pending booking can be cancelled
if (strtolower($booking["status"]) !== "pending") {
    die("Only pending bookings can be cancelled.");
}

// Start transaction
$conn->begin_transaction();

try {

    // Get booking items
    $item_stmt = $conn->prepare("
        SELECT vegetable_id, quantity
        FROM booking_items
        WHERE booking_id = ?
    ");

    $item_stmt->bind_param("i", $booking_id);
    $item_stmt->execute();

    $items = $item_stmt->get_result();

    if ($items->num_rows == 0) {
        throw new Exception("Booking items not found.");
    }

    // Restore vegetable stock
    while ($item = $items->fetch_assoc()) {

        $vegetable_id = (int)$item["vegetable_id"];
        $quantity = (float)$item["quantity"];

        $stock_stmt = $conn->prepare("
            UPDATE vegetables
            SET available_quantity = available_quantity + ?
            WHERE id = ?
        ");

        $stock_stmt->bind_param(
            "di",
            $quantity,
            $vegetable_id
        );

        if (!$stock_stmt->execute()) {
            throw new Exception("Stock restoration failed.");
        }

        $stock_stmt->close();
    }

    $item_stmt->close();

    // Update booking status
    $update_stmt = $conn->prepare("
        UPDATE bookings
        SET status = 'cancelled'
        WHERE id = ?
        AND customer_id = ?
        AND status = 'pending'
    ");

    $update_stmt->bind_param(
        "ii",
        $booking_id,
        $customer_id
    );

    if (!$update_stmt->execute()) {
        throw new Exception("Booking cancellation failed.");
    }

    if ($update_stmt->affected_rows == 0) {
        throw new Exception("Booking could not be cancelled.");
    }

    $update_stmt->close();

    // Commit
    $conn->commit();

    header("Location: my_bookings.php");
    exit();

} catch (Exception $e) {

    $conn->rollback();

    die(
        "Cancellation failed: " .
        htmlspecialchars($e->getMessage())
    );
}

?>