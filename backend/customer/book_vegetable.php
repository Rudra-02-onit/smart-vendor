<?php

session_start();

include "../db.php";

if (!isset($_SESSION["user_id"])) {
    header("Location: ../login.php");
    exit();
}

if ($_SESSION["user_role"] === "vendor") {
    header("Location: ../vendor/dashboard.php");
    exit();
}

if (!isset($_GET["id"]) || !is_numeric($_GET["id"])) {
    header("Location: vegetables.php");
    exit();
}

$vegetable_id = (int)$_GET["id"];

$stmt = $conn->prepare("
    SELECT 
        vegetables.*,
        users.name AS vendor_name
    FROM vegetables
    INNER JOIN users ON vegetables.vendor_id = users.id
    WHERE vegetables.id = ?
");

$stmt->bind_param("i", $vegetable_id);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    header("Location: vegetables.php");
    exit();
}

$vegetable = $result->fetch_assoc();

?>

<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Buy Vegetable</title>

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
    max-width: 700px;
    margin: 40px auto;
    padding: 20px;
}

.card {
    background: white;
    padding: 30px;
    border-radius: 14px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

.image-box {
    width: 100%;
    height: 300px;
    background: #e8f5e9;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 25px;
}

.image-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

h1 {
    color: #2e7d32;
    margin-bottom: 15px;
}

.price {
    font-size: 24px;
    font-weight: bold;
    color: #2e7d32;
    margin-bottom: 15px;
}

.info {
    color: #666;
    margin-bottom: 10px;
}

form {
    margin-top: 25px;
}

label {
    display: block;
    margin-bottom: 7px;
    font-weight: bold;
}

input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 7px;
    margin-bottom: 15px;
}

button {
    width: 100%;
    padding: 13px;
    background: #43a047;
    color: white;
    border: none;
    border-radius: 7px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
}

button:hover {
    background: #2e7d32;
}

</style>

</head>

<body>

<nav class="navbar">

    <h2>🥬 Smart Vendor</h2>

    <a href="vegetables.php">
        ← Back
    </a>

</nav>

<div class="container">

    <div class="card">

        <div class="image-box">

            <?php if (!empty($vegetable["image"])) { ?>

                <img
                    src="../uploads/<?php echo htmlspecialchars($vegetable["image"]); ?>"
                    alt="<?php echo htmlspecialchars($vegetable["name"]); ?>"
                >

            <?php } else { ?>

                <div style="font-size:100px;text-align:center;padding-top:90px;">
                    🥬
                </div>

            <?php } ?>

        </div>

        <h1>
            <?php echo htmlspecialchars($vegetable["name"]); ?>
        </h1>

        <div class="price">
            ₹<?php echo number_format($vegetable["price"], 2); ?>
            / <?php echo htmlspecialchars($vegetable["unit"]); ?>
        </div>

        <div class="info">
            📦 Available:
            <?php echo htmlspecialchars($vegetable["available_quantity"]); ?>
            <?php echo htmlspecialchars($vegetable["unit"]); ?>
        </div>

        <div class="info">
            👨‍🌾 Vendor:
            <?php echo htmlspecialchars($vegetable["vendor_name"]); ?>
        </div>

        <form action="create_booking.php" method="POST">

            <input
                type="hidden"
                name="vegetable_id"
                value="<?php echo $vegetable_id; ?>"
            >

            <label>
                Quantity
            </label>

            <input
                type="number"
                name="quantity"
                step="0.01"
                min="0.01"
                max="<?php echo $vegetable["available_quantity"]; ?>"
                required
            >

            <button type="submit">
                🛒 Confirm Booking
            </button>

        </form>

    </div>

</div>

</body>

</html>