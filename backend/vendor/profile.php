<?php

session_start();

include "../db.php";

// Login check
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

// Get vendor details
$stmt = $conn->prepare("
    SELECT id, name, email
    FROM users
    WHERE id = ? AND role = 'vendor'
");

$stmt->bind_param("i", $vendor_id);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows == 0) {
    die("Vendor not found.");
}

$vendor = $result->fetch_assoc();

?>

<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Vendor Profile - Smart Vendor</title>

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

.navbar {
    background: #2e7d32;
    color: white;
    padding: 18px 40px;

    display: flex;
    justify-content: space-between;
    align-items: center;
}

.navbar a {
    background: white;
    color: #2e7d32;

    padding: 9px 16px;

    border-radius: 7px;

    text-decoration: none;

    font-weight: bold;
}

.container {
    max-width: 650px;

    margin: 50px auto;

    padding: 20px;
}

.card {
    background: white;

    padding: 35px;

    border-radius: 15px;

    box-shadow: 0 4px 15px rgba(0,0,0,0.08);

    text-align: center;
}

.profile-icon {
    font-size: 80px;

    margin-bottom: 15px;
}

h1 {
    color: #2e7d32;

    margin-bottom: 25px;
}

.info {
    text-align: left;

    background: #f4f8f4;

    padding: 15px;

    border-radius: 8px;

    margin-bottom: 12px;

    color: #555;
}

.info strong {
    color: #222;
}

.btn {
    display: inline-block;

    background: #43a047;

    color: white;

    padding: 12px 20px;

    border-radius: 7px;

    text-decoration: none;

    font-weight: bold;

    margin-top: 20px;
}

.btn:hover {
    background: #2e7d32;
}

</style>

</head>

<body>

<nav class="navbar">

    <h2>🥬 Smart Vendor</h2>

    <a href="dashboard.php">
        Dashboard
    </a>

</nav>


<div class="container">

    <div class="card">

        <div class="profile-icon">
            👨‍🌾
        </div>

        <h1>
            Vendor Profile
        </h1>


        <div class="info">

            👤 <strong>Name:</strong>

            <?php
            echo htmlspecialchars($vendor["name"]);
            ?>

        </div>


        <div class="info">

            📧 <strong>Email:</strong>

            <?php
            echo htmlspecialchars($vendor["email"]);
            ?>

        </div>


        <div class="info">

            🏪 <strong>Role:</strong>

            Vegetable Vendor

        </div>


        <a href="dashboard.php" class="btn">
            ← Back to Dashboard
        </a>

    </div>

</div>

</body>

</html>