<?php

session_start();

include "../db.php";

// Check login
if (!isset($_SESSION["user_id"])) {
    header("Location: ../login.php");
    exit();
}

// Only vendor
if ($_SESSION["user_role"] != "vendor") {
    header("Location: ../login.php");
    exit();
}

$vendor_id = $_SESSION["user_id"];


// ==========================================
// UPDATE BOOKING STATUS
// ==========================================

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if (
        isset($_POST["booking_id"]) &&
        isset($_POST["status"]) &&
        is_numeric($_POST["booking_id"])
    ) {

        $booking_id = (int) $_POST["booking_id"];
        $status = strtolower(trim($_POST["status"]));

        // Allowed statuses
        if (
            $status == "accepted" ||
            $status == "rejected" ||
            $status == "completed"
        ) {

            // Check booking belongs to this vendor
            $check = $conn->prepare("
                SELECT id, status
                FROM bookings
                WHERE id = ? AND vendor_id = ?
            ");

            $check->bind_param(
                "ii",
                $booking_id,
                $vendor_id
            );

            $check->execute();

            $check_result = $check->get_result();

            if ($check_result->num_rows > 0) {

                $booking_data = $check_result->fetch_assoc();

                $current_status = strtolower($booking_data["status"]);

                // Accepted booking can be marked as completed
                // Pending booking can be accepted or rejected
                $allowed = false;

                if (
                    $current_status == "pending" &&
                    ($status == "accepted" || $status == "rejected")
                ) {
                    $allowed = true;
                }

                if (
                    $current_status == "accepted" &&
                    $status == "completed"
                ) {
                    $allowed = true;
                }

                if ($allowed) {

                    // Update status
                    $update = $conn->prepare("
                        UPDATE bookings
                        SET status = ?
                        WHERE id = ?
                        AND vendor_id = ?
                    ");

                    $update->bind_param(
                        "sii",
                        $status,
                        $booking_id,
                        $vendor_id
                    );

                    $update->execute();

                    $update->close();
                }
            }

            $check->close();
        }

        // Refresh page
        header("Location: bookings.php");
        exit();
    }
}


// ==========================================
// GET VENDOR BOOKINGS
// ==========================================

$stmt = $conn->prepare("
    SELECT 
        b.id AS booking_id,
        b.total_amount,
        b.status,
        b.created_at,
        bi.quantity,
        bi.price,
        bi.subtotal,
        v.name AS vegetable_name,
        v.unit,
        u.name AS customer_name,
        u.email AS customer_email
    FROM bookings b
    INNER JOIN booking_items bi
        ON b.id = bi.booking_id
    INNER JOIN vegetables v
        ON bi.vegetable_id = v.id
    INNER JOIN users u
        ON b.customer_id = u.id
    WHERE b.vendor_id = ?
    ORDER BY b.created_at DESC
");

$stmt->bind_param("i", $vendor_id);
$stmt->execute();

$result = $stmt->get_result();

?>

<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Smart Vendor - Customer Bookings</title>

<style>

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
}

body {
    background: #f4f8f4;
}

/* NAVBAR */

.navbar {
    background: #2e7d32;
    color: white;
    padding: 18px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.navbar h2 {
    font-size: 25px;
}

.nav-buttons {
    display: flex;
    gap: 10px;
}

.nav-btn {
    background: white;
    color: #2e7d32;
    padding: 9px 16px;
    border-radius: 7px;
    text-decoration: none;
    font-weight: bold;
}

.nav-btn:hover {
    background: #e8f5e9;
}

/* CONTAINER */

.container {
    max-width: 1100px;
    margin: 40px auto;
    padding: 20px;
}

.header {
    margin-bottom: 25px;
}

.header h1 {
    color: #2e7d32;
    margin-bottom: 8px;
}

.header p {
    color: #666;
}

/* BOOKING CARD */

.booking {
    background: white;
    padding: 25px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

.booking-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
}

.booking-id {
    color: #2e7d32;
    font-size: 20px;
    font-weight: bold;
}

/* STATUS */

.status {
    padding: 7px 14px;
    border-radius: 20px;
    font-weight: bold;
    text-transform: capitalize;
}

.status.pending {
    background: #fff3cd;
    color: #856404;
}

.status.accepted {
    background: #e8f5e9;
    color: #2e7d32;
}

.status.rejected {
    background: #ffebee;
    color: #c62828;
}

.status.completed {
    background: #e3f2fd;
    color: #1565c0;
}

/* INFO */

.info {
    margin: 9px 0;
    color: #555;
}

.info strong {
    color: #333;
}

/* TOTAL */

.total {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #ddd;
    font-size: 20px;
    font-weight: bold;
    color: #2e7d32;
}

/* BUTTONS */

.booking-actions {
    margin-top: 20px;
    display: flex;
    gap: 12px;
}

/* FORM */

.booking-actions form {
    margin: 0;
}

.confirm-btn,
.reject-btn {
    display: inline-block;
    padding: 11px 22px;
    border-radius: 7px;
    text-decoration: none;
    color: white;
    font-weight: bold;
    text-align: center;
    border: none;
    cursor: pointer;
    font-size: 15px;
}

.confirm-btn {
    background: #43a047;
}

.confirm-btn:hover {
    background: #2e7d32;
}

.reject-btn {
    background: #e53935;
}

.reject-btn:hover {
    background: #c62828;
}

/* PROCESSED */

.processed {
    margin-top: 20px;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 7px;
    color: #555;
    font-weight: bold;
}

/* EMPTY */

.empty {
    background: white;
    padding: 60px 20px;
    border-radius: 12px;
    text-align: center;
    color: #777;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

.empty-icon {
    font-size: 60px;
    margin-bottom: 15px;
}

/* MOBILE */

@media (max-width: 600px) {

    .navbar {
        padding: 15px 20px;
    }

    .container {
        margin: 20px auto;
    }

    .booking-top {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .booking-actions {
        flex-direction: column;
    }

    .booking-actions form {
        width: 100%;
    }

    .confirm-btn,
    .reject-btn {
        width: 100%;
    }

}

</style>

</head>

<body>


<!-- NAVBAR -->

<nav class="navbar">

    <h2>🥬 Smart Vendor</h2>

    <div class="nav-buttons">

        <a href="dashboard.php" class="nav-btn">
            Dashboard
        </a>

        <a href="../logout.php" class="nav-btn">
            Logout
        </a>

    </div>

</nav>


<!-- MAIN -->

<div class="container">

    <div class="header">

        <h1>📦 Customer Bookings</h1>

        <p>
            Here you can see vegetables booked by your customers.
        </p>

    </div>


    <?php if ($result->num_rows > 0) { ?>

        <?php while ($booking = $result->fetch_assoc()) { ?>

            <div class="booking">


                <!-- BOOKING TOP -->

                <div class="booking-top">

                    <div class="booking-id">

                        Booking #

                        <?php
                        echo $booking["booking_id"];
                        ?>

                    </div>


                    <div class="status <?php

                        $display_status = strtolower($booking["status"]);

                        echo htmlspecialchars($display_status);

                    ?>">

                        <?php

                        if ($display_status == "completed") {

                            echo "Delivered";

                        } else {

                            echo htmlspecialchars($booking["status"]);

                        }

                        ?>

                    </div>

                </div>


                <!-- CUSTOMER -->

                <div class="info">

                    👤 <strong>Customer:</strong>

                    <?php
                    echo htmlspecialchars($booking["customer_name"]);
                    ?>

                </div>


                <!-- EMAIL -->

                <div class="info">

                    📧 <strong>Email:</strong>

                    <?php
                    echo htmlspecialchars($booking["customer_email"]);
                    ?>

                </div>


                <!-- VEGETABLE -->

                <div class="info">

                    🥬 <strong>Vegetable:</strong>

                    <?php
                    echo htmlspecialchars($booking["vegetable_name"]);
                    ?>

                </div>


                <!-- QUANTITY -->

                <div class="info">

                    📦 <strong>Quantity:</strong>

                    <?php
                    echo htmlspecialchars($booking["quantity"]);
                    ?>

                    <?php
                    echo htmlspecialchars($booking["unit"]);
                    ?>

                </div>


                <!-- PRICE -->

                <div class="info">

                    💰 <strong>Price:</strong>

                    ₹<?php
                    echo number_format($booking["price"], 2);
                    ?>

                    /

                    <?php
                    echo htmlspecialchars($booking["unit"]);
                    ?>

                </div>


                <!-- DATE -->

                <div class="info">

                    📅 <strong>Booking Date:</strong>

                    <?php
                    echo htmlspecialchars($booking["created_at"]);
                    ?>

                </div>


                <!-- TOTAL -->

                <div class="total">

                    Total Amount:

                    ₹<?php
                    echo number_format($booking["total_amount"], 2);
                    ?>

                </div>


                <!-- ================================= -->
                <!-- PENDING BOOKING -->
                <!-- ================================= -->

                <?php if (strtolower($booking["status"]) == "pending") { ?>


                    <div class="booking-actions">


                        <!-- ACCEPT -->

                        <form method="POST">

                            <input
                                type="hidden"
                                name="booking_id"
                                value="<?php
                                echo $booking["booking_id"];
                                ?>"
                            >

                            <input
                                type="hidden"
                                name="status"
                                value="accepted"
                            >

                            <button
                                type="submit"
                                class="confirm-btn"
                                onclick="return confirm('Confirm this booking?');"
                            >
                                ✅ Confirm Booking
                            </button>

                        </form>


                        <!-- REJECT -->

                        <form method="POST">

                            <input
                                type="hidden"
                                name="booking_id"
                                value="<?php
                                echo $booking["booking_id"];
                                ?>"
                            >

                            <input
                                type="hidden"
                                name="status"
                                value="rejected"
                            >

                            <button
                                type="submit"
                                class="reject-btn"
                                onclick="return confirm('Reject this booking?');"
                            >
                                ❌ Reject Booking
                            </button>

                        </form>


                    </div>


                <!-- ================================= -->
                <!-- ACCEPTED BOOKING -->
                <!-- ================================= -->

                <?php } elseif (strtolower($booking["status"]) == "accepted") { ?>


                    <div class="booking-actions">

                        <form method="POST">

                            <input
                                type="hidden"
                                name="booking_id"
                                value="<?php
                                echo $booking["booking_id"];
                                ?>"
                            >

                            <input
                                type="hidden"
                                name="status"
                                value="completed"
                            >

                            <button
                                type="submit"
                                class="confirm-btn"
                                onclick="return confirm('Mark this booking as delivered?');"
                            >
                                🚚 Mark as Delivered
                            </button>

                        </form>

                    </div>


                <?php } else { ?>


                    <!-- ALREADY PROCESSED -->

                    <div class="processed">

                        <?php

                        if (strtolower($booking["status"]) == "completed") {

                            echo "🚚 Order Delivered";

                        } else {

                            echo "Booking Status: ";

                            echo htmlspecialchars($booking["status"]);

                        }

                        ?>

                    </div>


                <?php } ?>


            </div>


        <?php } ?>


    <?php } else { ?>


        <div class="empty">

            <div class="empty-icon">
                📭
            </div>

            <h2>No Customer Bookings</h2>

            <p>
                No customer has booked your vegetables yet.
            </p>

        </div>


    <?php } ?>


</div>

</body>

</html>