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

// Get all vegetables with vendor details
$stmt = $conn->prepare("
    SELECT
        v.id,
        v.name,
        v.price,
        v.unit,
        v.available_quantity,
        v.description,
        v.image,
        u.name AS vendor_name,
        u.email AS vendor_email
    FROM vegetables v
    INNER JOIN users u
        ON v.vendor_id = u.id
    ORDER BY v.id DESC
");

$stmt->execute();

$result = $stmt->get_result();

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Smart Vendor - Manage Vegetables</title>

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
            min-width: 1100px;
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
            vertical-align: middle;
        }

        tr:hover {
            background: #f8fff8;
        }

        .vegetable-image {
            width: 75px;
            height: 75px;
            object-fit: cover;
            border-radius: 10px;
            border: 1px solid #ddd;
        }

        .no-image {
            width: 75px;
            height: 75px;
            background: #f1f1f1;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #888;
            font-size: 12px;
            text-align: center;
        }

        .vegetable-name {
            font-weight: bold;
            color: #2e7d32;
            font-size: 16px;
        }

        .vendor-info {
            line-height: 1.5;
        }

        .vendor-email {
            color: #777;
            font-size: 13px;
        }

        .price {
            font-weight: bold;
            color: #2e7d32;
        }

        .quantity {
            font-weight: bold;
        }

        .description {
            max-width: 220px;
            color: #666;
            line-height: 1.4;
        }

        .unit {
            color: #555;
            font-size: 14px;
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

        <h1>🥬 Manage Vegetables</h1>

        <p>
            View all vegetables added by registered vendors.
        </p>

    </div>


    <div class="table-box">

        <?php if ($result->num_rows > 0) { ?>

            <table>

                <thead>

                    <tr>

                        <th>Image</th>

                        <th>Vegetable</th>

                        <th>Vendor</th>

                        <th>Price</th>

                        <th>Unit</th>

                        <th>Available Quantity</th>

                        <th>Description</th>

                    </tr>

                </thead>

                <tbody>

                <?php while ($vegetable = $result->fetch_assoc()) { ?>

                    <tr>

                        <td>

                            <?php if (!empty($vegetable["image"])) { ?>

                                <img
                                    src="../uploads/<?php echo htmlspecialchars($vegetable["image"]); ?>"
                                    alt="<?php echo htmlspecialchars($vegetable["name"]); ?>"
                                    class="vegetable-image"
                                >

                            <?php } else { ?>

                                <div class="no-image">
                                    No Image
                                </div>

                            <?php } ?>

                        </td>


                        <td>

                            <span class="vegetable-name">
                                <?php echo htmlspecialchars($vegetable["name"]); ?>
                            </span>

                        </td>


                        <td>

                            <div class="vendor-info">

                                <strong>
                                    <?php echo htmlspecialchars($vegetable["vendor_name"]); ?>
                                </strong>

                                <br>

                                <span class="vendor-email">
                                    <?php echo htmlspecialchars($vegetable["vendor_email"]); ?>
                                </span>

                            </div>

                        </td>


                        <td>

                            <span class="price">

                                ₹<?php echo number_format(
                                    (float)$vegetable["price"],
                                    2
                                ); ?>

                            </span>

                        </td>


                        <td>

                            <span class="unit">

                                <?php echo htmlspecialchars($vegetable["unit"]); ?>

                            </span>

                        </td>


                        <td>

                            <span class="quantity">

                                <?php echo htmlspecialchars(
                                    $vegetable["available_quantity"]
                                ); ?>

                            </span>

                        </td>


                        <td>

                            <div class="description">

                                <?php

                                if (!empty($vegetable["description"])) {

                                    echo htmlspecialchars(
                                        $vegetable["description"]
                                    );

                                } else {

                                    echo "No description";

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

                🥬 No vegetables found.

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