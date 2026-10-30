<?php

session_start();

include "../db.php";

// Check login
if (!isset($_SESSION["user_id"])) {
    header("Location: ../login.php");
    exit();
}

// Only vendor can access
if (
    !isset($_SESSION["user_role"]) ||
    $_SESSION["user_role"] !== "vendor"
) {
    header("Location: ../login.php");
    exit();
}

$name = $_SESSION["user_name"] ?? "Vendor";
$email = $_SESSION["user_email"] ?? "";

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Smart Vendor - Dashboard</title>

    <style>

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }

        body {
            background: #f4f8f4;
            min-height: 100vh;
        }

        /* ================= NAVBAR ================= */

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

        .logout {
            background: white;
            color: #2e7d32;
            padding: 9px 18px;
            border-radius: 7px;
            text-decoration: none;
            font-weight: bold;
        }

        .logout:hover {
            background: #e8f5e9;
        }

        /* ================= CONTAINER ================= */

        .container {
            max-width: 1100px;
            margin: 40px auto;
            padding: 20px;
        }

        /* ================= WELCOME ================= */

        .welcome {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            margin-bottom: 30px;
        }

        .welcome h1 {
            color: #2e7d32;
            margin-bottom: 12px;
        }

        .welcome p {
            color: #666;
            margin-top: 7px;
        }

        /* ================= QUICK ACTIONS ================= */

        .quick-actions {
            display: flex;
            gap: 12px;
            margin-top: 22px;
            flex-wrap: wrap;
        }

        .quick-btn {
            display: inline-block;
            background: #43a047;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            cursor: pointer;
        }

        .quick-btn:hover {
            background: #2e7d32;
        }

        /* ADD VEGETABLE BUTTON */

        .quick-btn.add {
            background: #43a047;
            color: white;
        }

        .quick-btn.add:hover {
            background: #2e7d32;
        }

        /* ================= CARDS ================= */

        .cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }

        .card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }

        .icon {
            font-size: 45px;
            margin-bottom: 15px;
        }

        .card h3 {
            color: #333;
            margin-bottom: 10px;
        }

        .card p {
            color: #777;
            margin-bottom: 22px;
            min-height: 40px;
            line-height: 1.5;
        }

        /* ================= BUTTONS ================= */

        .btn {
            display: inline-block;
            background: #43a047;
            color: white;
            padding: 11px 20px;
            border-radius: 7px;
            text-decoration: none;
            font-weight: bold;
            cursor: pointer;
        }

        .btn:hover {
            background: #2e7d32;
        }

        .btn.secondary {
            background: #e8f5e9;
            color: #2e7d32;
            margin-left: 5px;
        }

        .btn.secondary:hover {
            background: #c8e6c9;
        }

        /* ================= MOBILE ================= */

        @media (max-width: 768px) {

            .navbar {
                padding: 15px 20px;
            }

            .navbar h2 {
                font-size: 20px;
            }

            .logout {
                padding: 8px 12px;
                font-size: 13px;
            }

            .container {
                margin: 20px auto;
                padding: 12px;
            }

            .welcome {
                padding: 22px;
            }

            .cards {
                grid-template-columns: 1fr;
            }

            .quick-actions {
                flex-direction: column;
            }

            .quick-btn {
                text-align: center;
                width: 100%;
            }

            .card {
                padding: 25px 20px;
            }

            .btn {
                padding: 10px 15px;
            }

        }

    </style>

</head>


<body>


<!-- ================= NAVBAR ================= -->

<nav class="navbar">

    <h2>
        🥬 Smart Vendor
    </h2>

    <a
        href="../logout.php"
        class="logout"
    >
        Logout
    </a>

</nav>


<!-- ================= MAIN ================= -->

<div class="container">


    <!-- ================= WELCOME ================= -->

    <div class="welcome">

        <h1>
            Welcome,
            <?php echo htmlspecialchars($name); ?>
            👋
        </h1>

        <p>
            You are logged in as a Vegetable Vendor.
        </p>

        <p>
            Email:
            <?php echo htmlspecialchars($email); ?>
        </p>


        <!-- QUICK ACTIONS -->

        <div class="quick-actions">

            <!-- MANAGE VEGETABLES -->

            <a
                href="/smart_vendor/vendor/vegetables.php"
                class="quick-btn"
            >
                🥬 Manage Vegetables
            </a>


            <!-- ADD VEGETABLE -->

            <a
                href="/smart_vendor/vendor/add_vegetable.php"
                class="quick-btn add"
            >
                ➕ Add Vegetable
            </a>

        </div>

    </div>


    <!-- ================= CARDS ================= -->

    <div class="cards">


        <!-- MANAGE VEGETABLES -->

        <div class="card">

            <div class="icon">
                🥬
            </div>

            <h3>
                Manage Vegetables
            </h3>

            <p>
                Add, edit, delete and manage
                your vegetables.
            </p>


            <a
                href="/smart_vendor/vendor/vegetables.php"
                class="btn"
            >
                Manage
            </a>


            <a
                href="/smart_vendor/vendor/add_vegetable.php"
                class="btn secondary"
            >
                + Add
            </a>

        </div>


        <!-- CUSTOMER BOOKINGS -->

        <div class="card">

            <div class="icon">
                🛒
            </div>

            <h3>
                Customer Bookings
            </h3>

            <p>
                View customer vegetable
                bookings.
            </p>

            <a href="bookings.php" class="btn">
                📦 Customer Bookings
            </a>

        </div>


        <!-- VENDOR PROFILE -->

        <div class="card">

            <div class="icon">
                👤
            </div>

            <h3>
                Vendor Profile
            </h3>

            <p>
                Manage your vendor
                information.
            </p>

            <a href="profile.php" class="btn">
                My Profile
            </a>

        </div>


    </div>

</div>


</body>

</html>