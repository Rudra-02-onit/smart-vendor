<?php

session_start();

include "../db.php";

// Check login
if (!isset($_SESSION["user_id"])) {
    header("Location: ../login.php");
    exit();
}

// Only customer can access
if ($_SESSION["user_role"] != "customer") {
    header("Location: ../login.php");
    exit();
}

$name = $_SESSION["user_name"];
$email = $_SESSION["user_email"];

?>

<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Smart Vendor - Customer Dashboard</title>

<style>

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
}

body {
    background: #f4f8f4;
    color: #333;
}

/* NAVBAR */

.navbar {
    background: #2e7d32;
    color: white;
    padding: 18px 50px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    box-shadow: 0 3px 10px rgba(0,0,0,0.15);
}

.logo {
    font-size: 26px;
    font-weight: bold;
}

.nav-right {
    display: flex;
    align-items: center;
    gap: 15px;
}

.user-name {
    font-size: 15px;
}

.logout {
    background: white;
    color: #2e7d32;

    padding: 10px 18px;

    border-radius: 7px;

    text-decoration: none;
    font-weight: bold;
}

.logout:hover {
    background: #e8f5e9;
}

/* MAIN CONTAINER */

.container {
    max-width: 1150px;
    margin: 40px auto;
    padding: 20px;
}

/* WELCOME */

.welcome {
    background: white;

    padding: 35px;

    border-radius: 15px;

    box-shadow: 0 4px 15px rgba(0,0,0,0.08);

    margin-bottom: 35px;
}

.welcome h1 {
    color: #2e7d32;

    font-size: 32px;

    margin-bottom: 12px;
}

.welcome p {
    color: #666;

    margin: 7px 0;

    font-size: 16px;
}

.email {
    color: #777;
}

/* QUICK ACTION TITLE */

.section-title {
    text-align: center;

    margin-bottom: 25px;
}

.section-title h2 {
    color: #2e7d32;

    font-size: 28px;

    margin-bottom: 8px;
}

.section-title p {
    color: #777;
}

/* CARDS */

.cards {
    display: grid;

    grid-template-columns: repeat(3, 1fr);

    gap: 25px;
}

/* CARD */

.card {
    background: white;

    padding: 35px 25px;

    border-radius: 15px;

    text-align: center;

    box-shadow: 0 4px 15px rgba(0,0,0,0.08);

    transition: 0.3s;
}

.card:hover {
    transform: translateY(-6px);

    box-shadow: 0 8px 20px rgba(0,0,0,0.14);
}

.icon {
    font-size: 55px;

    margin-bottom: 18px;
}

.card h3 {
    color: #333;

    font-size: 21px;

    margin-bottom: 10px;
}

.card p {
    color: #777;

    line-height: 1.5;

    min-height: 45px;

    margin-bottom: 22px;
}

/* BUTTON */

.btn {
    display: inline-block;

    background: #43a047;

    color: white;

    padding: 11px 20px;

    border-radius: 8px;

    text-decoration: none;

    font-weight: bold;

    transition: 0.3s;
}

.btn:hover {
    background: #2e7d32;
}

/* INFO SECTION */

.info-section {
    margin-top: 40px;

    background: white;

    padding: 30px;

    border-radius: 15px;

    box-shadow: 0 4px 15px rgba(0,0,0,0.08);

    text-align: center;
}

.info-section h2 {
    color: #2e7d32;

    margin-bottom: 12px;
}

.info-section p {
    color: #666;

    line-height: 1.6;
}

/* FOOTER */

.footer {
    margin-top: 50px;

    background: #2e7d32;

    color: white;

    text-align: center;

    padding: 20px;
}

/* MOBILE */

@media (max-width: 768px) {

    .navbar {
        padding: 15px 20px;
    }

    .logo {
        font-size: 21px;
    }

    .user-name {
        display: none;
    }

    .container {
        margin: 20px auto;
    }

    .welcome h1 {
        font-size: 25px;
    }

    .cards {
        grid-template-columns: 1fr;
    }

}

</style>

</head>

<body>


<!-- ========================= -->
<!-- NAVBAR -->
<!-- ========================= -->

<nav class="navbar">

    <div class="logo">
        🥬 Smart Vendor
    </div>

    <div class="nav-right">

        <span class="user-name">
            👤 <?php echo htmlspecialchars($name); ?>
        </span>

        <a href="../logout.php" class="logout">
            Logout
        </a>

    </div>

</nav>


<!-- ========================= -->
<!-- MAIN -->
<!-- ========================= -->

<div class="container">


    <!-- WELCOME -->

    <div class="welcome">

        <h1>
            Welcome, <?php echo htmlspecialchars($name); ?> 👋
        </h1>

        <p>
            Welcome to your Smart Vendor customer dashboard.
        </p>

        <p class="email">
            📧 <?php echo htmlspecialchars($email); ?>
        </p>

    </div>


    <!-- SECTION TITLE -->

    <div class="section-title">

        <h2>What would you like to do?</h2>

        <p>
            Manage your vegetable shopping easily from one place.
        </p>

    </div>


    <!-- ========================= -->
    <!-- CARDS -->
    <!-- ========================= -->

    <div class="cards">


        <!-- FIND VEGETABLES -->

        <div class="card">

            <div class="icon">
                🥬
            </div>

            <h3>
                Find Vegetables
            </h3>

            <p>
                View fresh vegetables, prices,
                quantities and local vendors.
            </p>

            <a href="vegetables.php" class="btn">
                🛒 Start Shopping
            </a>

        </div>


        <!-- MY BOOKINGS -->

        <div class="card">

            <div class="icon">
                📦
            </div>

            <h3>
                My Bookings
            </h3>

            <p>
                Check your bookings and
                track their current status.
            </p>

            <a href="my_bookings.php" class="btn">
                📦 View Bookings
            </a>

        </div>


        <!-- PROFILE -->

        <div class="card">

            <div class="icon">
                👤
            </div>

            <h3>
                My Profile
            </h3>

            <p>
                View your customer account
                information.
            </p>

            <a href="profile.php" class="btn">
                👤 View Profile
            </a>

        </div>


    </div>


    <!-- ========================= -->
    <!-- ABOUT SMART VENDOR -->
    <!-- ========================= -->

    <div class="info-section">

        <h2>
            🥕 About Smart Vendor
        </h2>

        <p>
            Smart Vendor is a local vegetable booking system
            that allows customers to view vegetables from
            trusted local vendors, select quantities and place
            bookings online. The vendor receives the booking,
            prepares the order and handles delivery directly.
        </p>

    </div>


</div>


<!-- ========================= -->
<!-- FOOTER -->
<!-- ========================= -->

<footer class="footer">

    <p>
        © 2026 Smart Vendor | Local Vegetable Booking System
    </p>

</footer>


</body>

</html>