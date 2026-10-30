<?php

session_start();

include "../db.php";

// Admin login check
if (!isset($_SESSION["user_id"])) {
    header("Location: ../login.php");
    exit();
}

// Only admin allowed
if ($_SESSION["user_role"] != "admin") {
    header("Location: ../login.php");
    exit();
}

// Get all bookings
$stmt = $conn->prepare("
    SELECT
        b.id AS booking_id,
        b.total_amount,
        b.status,
        b.created_at,
        b.customer_note,

        bi.quantity,
        bi.price,
        bi.subtotal,

        v.name AS vegetable_name,
        v.unit,

        c.name AS customer_name,
        c.email AS customer_email,

        ven.name AS vendor_name,
        ven.email AS vendor_email

    FROM bookings b

    INNER JOIN booking_items bi
        ON b.id = bi.booking_id

    INNER JOIN vegetables v
        ON bi.vegetable_id = v.id

    INNER JOIN users c
        ON b.customer_id = c.id

    INNER JOIN users ven
        ON b.vendor_id = ven.id

    ORDER BY b.created_at DESC
");

$stmt->execute();

$result = $stmt->get_result();

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Smart Vendor - Manage Bookings</title>

    <style>

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }

        body {
            background: #f4f7f5;
            min-height: 100vh;
        }

        .navbar {
            background: #2e7d32;
            color: white;
            padding: 16px 35px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .navbar h2 {
            font-size: 24px;
        }

        .nav-links {
            display: flex;
            gap: 12px;
        }

        .nav-btn {
            background: white;
            color: #2e7d32;
            padding: 9px 15px;
            border-radius: 7px;
            text-decoration: none;
            font-weight: bold;
        }

        .nav-btn:hover {
            background: #e8f5e9;
        }

        .container {
            width: 95%;
            max-width: 1400px;
            margin: 35px auto;
        }

        .header {
            background: white;
            padding: 25px;
            border-radius: 14px;
            box-shadow: 0 5px 18px rgba(0,0,0,0.08);
            margin-bottom: 25px;
        }

        .header h1 {
            color: #2e7d32;
            margin-bottom: 7px;
        }

        .header p {
            color: #666;
        }

        .table-box {
            background: white;
            padding: 20px;
            border-radius: 14px;
            box-shadow: 0 5px 18px rgba(0,0,0,0.08);
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            min-width: 1200px;
        }

        th {
            background: #2e7d32;
            color: white;
            padding: 13px;
            text-align: left;
            white-space: nowrap;
        }

        td {
            padding: 13px;
            border-bottom: 1px solid #eee;
            color: #444;
            vertical-align: top;
        }

        tr:hover {
            background: #f8fff8;
        }

        .customer-info,
        .vendor-info {
            line-height: 1.5;
        }

        .customer-info strong,
        .vendor-info strong {
            color: #333;
        }

        .email {
            color: #777;
            font-size: 13px;
        }

        .status {
            display: inline-block;
            padding: 6px 11px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: bold;
        }

        .pending {
            background: #fff3e0;
            color: #ef6c00;
        }

        .accepted {
            background: #e3f2fd;
            color: #1565c0;
        }

        .rejected {
            background: #ffebee;
            color: #c62828;
        }

        .completed {
            background: #e8f5e9;
            color: #2e7d32;
        }

        .cancelled {
            background: #f5f5f5;
            color: #616161;
        }

        .amount {
            font-weight: bold;
            color: #2e7d32;
        }

        .note {
            max-width: 180px;
            color: #666;
            font-size: 13px;
        }

        .empty {
            text-align: center;
            padding: 40px;
            color: #777;
            font-size: 16px;
        }

        footer {
            text-align: center;
            padding: 25px;
            margin-top: 40px;
            color: #777;
        }

        @media (max-width: 700px) {

            .navbar {
                flex-direction: column;
                gap: 12px;
                padding: 15px;
            }

            .container {
                width: 95%;
            }

        }

    </style>

</head>

<body>

<div class="navbar">

    <h2>🥬 Smart Vendor Admin</h2>

    <div class="nav-links">

        <a href="dashboard.php" class="nav-btn">
            Dashboard
        </a>

        <a href="../logout.php" class="nav-btn">
            Logout
        </a>

    </div>

</div>


<div class="container">

    <div class="header">

        <h1>📦 Manage Bookings</h1>

        <p>
            View and monitor all customer bookings in the system.
        </p>

    </div>


    <div class="table-box">

        <?php if ($result->num_rows > 0) { ?>

            <table>

                <thead>

                    <tr>

                        <th>Booking ID</th>

                        <th>Customer</th>

                        <th>Vendor</th>

                        <th>Vegetable</th>

                        <th>Quantity</th>

                        <th>Price</th>

                        <th>Subtotal</th>

                        <th>Total Amount</th>

                        <th>Status</th>

                        <th>Date</th>

                        <th>Customer Note</th>

                    </tr>

                </thead>

                <tbody>

                <?php while ($booking = $result->fetch_assoc()) { ?>

                    <?php

                    $status = strtolower(trim($booking["status"]));

                    // Display completed as Delivered
                    $display_status = ($status == "completed")
                        ? "Delivered"
                        : ucfirst($status);

                    ?>

                    <tr>

                        <td>
                            #<?php echo $booking["booking_id"]; ?>
                        </td>


                        <td>

                            <div class="customer-info">

                                <strong>
                                    <?php echo htmlspecialchars($booking["customer_name"]); ?>
                                </strong>

                                <br>

                                <span class="email">
                                    <?php echo htmlspecialchars($booking["customer_email"]); ?>
                                </span>

                            </div>

                        </td>


                        <td>

                            <div class="vendor-info">

                                <strong>
                                    <?php echo htmlspecialchars($booking["vendor_name"]); ?>
                                </strong>

                                <br>

                                <span class="email">
                                    <?php echo htmlspecialchars($booking["vendor_email"]); ?>
                                </span>

                            </div>

                        </td>


                        <td>

                            <strong>
                                <?php echo htmlspecialchars($booking["vegetable_name"]); ?>
                            </strong>

                            <br>

                            <span class="email">
                                Per <?php echo htmlspecialchars($booking["unit"]); ?>
                            </span>

                        </td>


                        <td>
                            <?php echo htmlspecialchars($booking["quantity"]); ?>
                        </td>


                        <td>
                            ₹<?php echo number_format((float)$booking["price"], 2); ?>
                        </td>


                        <td>
                            ₹<?php echo number_format((float)$booking["subtotal"], 2); ?>
                        </td>


                        <td class="amount">
                            ₹<?php echo number_format((float)$booking["total_amount"], 2); ?>
                        </td>


                        <td>

                            <span class="status <?php echo htmlspecialchars($status); ?>">

                                <?php echo htmlspecialchars($display_status); ?>

                            </span>

                        </td>


                        <td>
                            <?php echo date("d M Y, h:i A", strtotime($booking["created_at"])); ?>
                        </td>


                        <td>

                            <div class="note">

                                <?php

                                if (!empty($booking["customer_note"])) {
                                    echo htmlspecialchars($booking["customer_note"]);
                                } else {
                                    echo "No note";
                                }

                                ?>

                            </div>

                        </td>

                    </tr>

                <?php } ?>

                </tbody>

            </table>

        <?php } else { ?>

            <div class="empty">

                📦 No bookings found.

            </div>

        <?php } ?>

    </div>

</div>


<footer>

    © 2026 Smart Vendor | Admin Panel

</footer>

</body>

</html>

<?php

$stmt->close();
$conn->close();

?>