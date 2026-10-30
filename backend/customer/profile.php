<?php

session_start();

include "../db.php";

if (!isset($_SESSION["user_id"])) {
    header("Location: ../login.php");
    exit();
}

if ($_SESSION["user_role"] != "customer") {
    header("Location: ../login.php");
    exit();
}

$customer_id = $_SESSION["user_id"];

$stmt = $conn->prepare("
    SELECT name, email
    FROM users
    WHERE id = ?
");

$stmt->bind_param("i", $customer_id);
$stmt->execute();

$result = $stmt->get_result();
$user = $result->fetch_assoc();

?>

<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>My Profile - Smart Vendor</title>

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
    max-width: 600px;
    margin: 50px auto;
    padding: 20px;
}

.profile-box {
    background: white;
    padding: 35px;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

h1 {
    color: #2e7d32;
    margin-bottom: 30px;
}

.info {
    margin-bottom: 20px;
    font-size: 18px;
    color: #555;
}

.info strong {
    color: #333;
}

.back-btn {
    display: inline-block;
    margin-top: 10px;
    background: #43a047;
    color: white;
    padding: 10px 18px;
    border-radius: 7px;
    text-decoration: none;
    font-weight: bold;
}

.back-btn:hover {
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

    <div class="profile-box">

        <h1>👤 My Profile</h1>

        <div class="info">
            <strong>Name:</strong>
            <?php echo htmlspecialchars($user["name"]); ?>
        </div>

        <div class="info">
            <strong>Email:</strong>
            <?php echo htmlspecialchars($user["email"]); ?>
        </div>

        <div class="info">
            <strong>Role:</strong>
            Customer
        </div>

        <a href="dashboard.php" class="back-btn">
            ← Back to Dashboard
        </a>

    </div>

</div>

</body>

</html>