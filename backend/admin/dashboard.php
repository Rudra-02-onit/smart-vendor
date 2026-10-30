<?php

session_start();

include "../db.php";

// Login check
if (!isset($_SESSION["user_id"])) {
    header("Location: ../login.php");
    exit();
}

// Admin check
if ($_SESSION["user_role"] !== "admin") {
    header("Location: ../login.php");
    exit();
}


// ===============================
// BASIC COUNTS
// ===============================

// Customers
$result = $conn->query("
    SELECT COUNT(*) AS total
    FROM users
    WHERE role = 'customer'
");

$customers = $result->fetch_assoc()["total"];


// Vendors
$result = $conn->query("
    SELECT COUNT(*) AS total
    FROM users
    WHERE role = 'vendor'
");

$vendors = $result->fetch_assoc()["total"];


// Vegetables
$result = $conn->query("
    SELECT COUNT(*) AS total
    FROM vegetables
");

$vegetables = $result->fetch_assoc()["total"];


// Total Bookings
$result = $conn->query("
    SELECT COUNT(*) AS total
    FROM bookings
");

$total_bookings = $result->fetch_assoc()["total"];


// ===============================
// BOOKING STATUS COUNTS
// ===============================

// Pending
$result = $conn->query("
    SELECT COUNT(*) AS total
    FROM bookings
    WHERE status = 'pending'
");

$pending_bookings = $result->fetch_assoc()["total"];


// Accepted
$result = $conn->query("
    SELECT COUNT(*) AS total
    FROM bookings
    WHERE status = 'accepted'
");

$accepted_bookings = $result->fetch_assoc()["total"];


// Delivered
$result = $conn->query("
    SELECT COUNT(*) AS total
    FROM bookings
    WHERE status = 'completed'
");

$delivered_bookings = $result->fetch_assoc()["total"];


// Rejected
$result = $conn->query("
    SELECT COUNT(*) AS total
    FROM bookings
    WHERE status = 'rejected'
");

$rejected_bookings = $result->fetch_assoc()["total"];

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Admin Dashboard - Smart Vendor</title>

    <style>

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: Arial, sans-serif;
            background: #f4f7f6;
            color: #333;
        }

        /* Navbar */

        .navbar {
            background: #198754;
            color: white;
            padding: 16px 40px;

            display: flex;
            justify-content: space-between;
            align-items: center;

            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .navbar h2 {
            font-size: 24px;
        }

        .navbar-right {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .welcome {
            font-size: 15px;
        }

        .logout {
            background: white;
            color: #198754;

            text-decoration: none;

            padding: 9px 16px;

            border-radius: 6px;

            font-weight: bold;
        }

        .logout:hover {
            background: #e9f7ef;
        }


        /* Main */

        .container {
            width: 92%;
            max-width: 1200px;

            margin: 35px auto;
        }

        .title {
            margin-bottom: 25px;
        }

        .title h1 {
            font-size: 30px;
            margin-bottom: 8px;
        }

        .title p {
            color: #666;
        }


        /* Cards */

        .cards {
            display: grid;

            grid-template-columns:
                repeat(4, 1fr);

            gap: 20px;

            margin-bottom: 35px;
        }

        .card {
            background: white;

            padding: 25px;

            border-radius: 12px;

            box-shadow:
                0 3px 12px rgba(0,0,0,0.08);

            text-align: center;

            border-top: 4px solid #198754;
        }

        .card h3 {
            color: #666;

            font-size: 16px;

            margin-bottom: 12px;
        }

        .card .number {
            font-size: 32px;

            font-weight: bold;

            color: #198754;
        }


        /* Booking Status */

        .section-title {
            font-size: 22px;

            margin-bottom: 18px;
        }

        .status-cards {
            display: grid;

            grid-template-columns:
                repeat(4, 1fr);

            gap: 20px;

            margin-bottom: 35px;
        }

        .status-card {
            background: white;

            padding: 22px;

            border-radius: 12px;

            text-align: center;

            box-shadow:
                0 3px 12px rgba(0,0,0,0.08);
        }

        .status-card h3 {
            font-size: 16px;

            margin-bottom: 10px;
        }

        .status-card .number {
            font-size: 30px;

            font-weight: bold;
        }

        .pending {
            border-top: 4px solid #ffc107;
        }

        .pending .number {
            color: #d39e00;
        }

        .accepted {
            border-top: 4px solid #0d6efd;
        }

        .accepted .number {
            color: #0d6efd;
        }

        .delivered {
            border-top: 4px solid #198754;
        }

        .delivered .number {
            color: #198754;
        }

        .rejected {
            border-top: 4px solid #dc3545;
        }

        .rejected .number {
            color: #dc3545;
        }


        /* Action Cards */

        .actions {
            display: grid;

            grid-template-columns:
                repeat(3, 1fr);

            gap: 20px;
        }

        .action-card {
            background: white;

            padding: 25px;

            border-radius: 12px;

            box-shadow:
                0 3px 12px rgba(0,0,0,0.08);

            text-align: center;
        }

        .action-card h3 {
            margin-bottom: 10px;
        }

        .action-card p {
            color: #666;

            margin-bottom: 18px;

            font-size: 14px;
        }

        .btn {
            display: inline-block;

            background: #198754;

            color: white;

            text-decoration: none;

            padding: 10px 18px;

            border-radius: 6px;

            font-weight: bold;
        }

        .btn:hover {
            background: #146c43;
        }


        /* Responsive */

        @media (max-width: 900px) {

            .cards,
            .status-cards {
                grid-template-columns:
                    repeat(2, 1fr);
            }

            .actions {
                grid-template-columns:
                    repeat(2, 1fr);
            }

        }

        @media (max-width: 600px) {

            .navbar {
                padding: 15px 20px;

                flex-direction: column;

                gap: 12px;
            }

            .cards,
            .status-cards,
            .actions {
                grid-template-columns: 1fr;
            }

            .container {
                width: 94%;
            }

        }

    </style>

</head>


<body>


<!-- ================= NAVBAR ================= -->

<div class="navbar">

    <h2>Smart Vendor</h2>

    <div class="navbar-right">

        <span class="welcome">
            Welcome, <?php echo htmlspecialchars($_SESSION["user_name"]); ?>
        </span>

        <a href="../logout.php" class="logout">
            Logout
        </a>

    </div>

</div>



<!-- ================= MAIN ================= -->

<div class="container">


    <div class="title">

        <h1>Admin Dashboard</h1>

        <p>
            Manage and monitor Smart Vendor system
        </p>

    </div>



    <!-- ================= BASIC STATISTICS ================= -->

    <div class="cards">


        <div class="card">

            <h3>Total Customers</h3>

            <div class="number">
                <?php echo $customers; ?>
            </div>

        </div>



        <div class="card">

            <h3>Total Vendors</h3>

            <div class="number">
                <?php echo $vendors; ?>
            </div>

        </div>



        <div class="card">

            <h3>Total Vegetables</h3>

            <div class="number">
                <?php echo $vegetables; ?>
            </div>

        </div>



        <div class="card">

            <h3>Total Bookings</h3>

            <div class="number">
                <?php echo $total_bookings; ?>
            </div>

        </div>

    </div>



    <!-- ================= BOOKING STATUS ================= -->

    <h2 class="section-title">
        Booking Status
    </h2>


    <div class="status-cards">


        <div class="status-card pending">

            <h3>Pending</h3>

            <div class="number">
                <?php echo $pending_bookings; ?>
            </div>

        </div>



        <div class="status-card accepted">

            <h3>Accepted</h3>

            <div class="number">
                <?php echo $accepted_bookings; ?>
            </div>

        </div>



        <div class="status-card delivered">

            <h3>Delivered</h3>

            <div class="number">
                <?php echo $delivered_bookings; ?>
            </div>

        </div>



        <div class="status-card rejected">

            <h3>Rejected</h3>

            <div class="number">
                <?php echo $rejected_bookings; ?>
            </div>

        </div>

    </div>



    <!-- ================= ADMIN ACTIONS ================= -->

    <h2 class="section-title">
        Admin Management
    </h2>


    <div class="actions">


        <div class="action-card">

            <h3>Manage Users</h3>

            <p>
                View customers and vendors
                and manage their account status.
            </p>

            <a href="users.php" class="btn">
                Manage Users
            </a>

        </div>



        <div class="action-card">

            <h3>View Bookings</h3>

            <p>
                Monitor all customer bookings,
                vendors and booking status.
            </p>

            <a href="bookings.php" class="btn">
                View Bookings
            </a>

        </div>



        <div class="action-card">

            <h3>View Vegetables</h3>

            <p>
                Monitor vegetables added
                by all vendors.
            </p>

            <a href="vegetables.php" class="btn">
                View Vegetables
            </a>

        </div>


    </div>


</div>


</body>

</html>