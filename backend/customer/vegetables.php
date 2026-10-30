<?php

session_start();

include "../db.php";

// Check login
if (!isset($_SESSION["user_id"])) {
    header("Location: ../login.php");
    exit();
}

// Vendor ko customer page se roko
if (
    isset($_SESSION["user_role"]) &&
    $_SESSION["user_role"] === "vendor"
) {
    header("Location: ../vendor/dashboard.php");
    exit();
}


// ==========================================
// FETCH ALL VEGETABLES
// ==========================================

$sql = "SELECT 
            vegetables.id,
            vegetables.name,
            vegetables.price,
            vegetables.unit,
            vegetables.available_quantity,
            vegetables.description,
            vegetables.image,
            users.name AS vendor_name
        FROM vegetables
        INNER JOIN users
        ON vegetables.vendor_id = users.id
        WHERE vegetables.available_quantity > 0
        ORDER BY vegetables.id DESC";

$result = $conn->query($sql);

?>

<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Smart Vendor - Fresh Vegetables</title>

<style>

/* ==========================================
   RESET
========================================== */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
}


/* ==========================================
   BODY
========================================== */

body {
    background: #f4f8f4;
    color: #333;
}


/* ==========================================
   NAVBAR
========================================== */

.navbar {
    background: #2e7d32;
    color: white;

    padding: 18px 50px;

    display: flex;
    justify-content: space-between;
    align-items: center;

    box-shadow: 0 3px 10px rgba(0,0,0,0.15);

    position: sticky;
    top: 0;
    z-index: 100;
}

.logo {
    font-size: 26px;
    font-weight: bold;
}

.nav-buttons {
    display: flex;
    gap: 10px;
}

.nav-btn {
    background: white;
    color: #2e7d32;

    padding: 10px 17px;

    border-radius: 7px;

    text-decoration: none;

    font-weight: bold;

    transition: 0.2s;
}

.nav-btn:hover {
    background: #e8f5e9;
}


/* ==========================================
   MAIN CONTAINER
========================================== */

.container {
    max-width: 1200px;

    margin: 40px auto;

    padding: 20px;
}


/* ==========================================
   PAGE HEADER
========================================== */

.page-header {
    background: white;

    padding: 30px;

    border-radius: 15px;

    margin-bottom: 30px;

    box-shadow: 0 4px 15px rgba(0,0,0,0.08);

    text-align: center;
}

.page-header h1 {
    color: #2e7d32;

    font-size: 32px;

    margin-bottom: 10px;
}

.page-header p {
    color: #777;

    font-size: 16px;
}


/* ==========================================
   VEGETABLE GRID
========================================== */

.vegetable-grid {
    display: grid;

    grid-template-columns: repeat(3, 1fr);

    gap: 25px;
}


/* ==========================================
   VEGETABLE CARD
========================================== */

.card {
    background: white;

    border-radius: 15px;

    overflow: hidden;

    box-shadow: 0 4px 15px rgba(0,0,0,0.08);

    transition: 0.3s;
}

.card:hover {
    transform: translateY(-7px);

    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}


/* ==========================================
   IMAGE
========================================== */

.image-box {
    width: 100%;

    height: 230px;

    background: #e8f5e9;

    display: flex;

    justify-content: center;

    align-items: center;

    overflow: hidden;
}

.vegetable-image {
    width: 100%;

    height: 100%;

    object-fit: cover;

    transition: 0.3s;
}

.card:hover .vegetable-image {
    transform: scale(1.05);
}

.vegetable-icon {
    font-size: 75px;
}


/* ==========================================
   CARD CONTENT
========================================== */

.card-content {
    padding: 22px;
}

.card h2 {
    color: #333;

    font-size: 22px;

    margin-bottom: 10px;
}


/* ==========================================
   PRICE
========================================== */

.price {
    color: #2e7d32;

    font-size: 23px;

    font-weight: bold;

    margin-bottom: 14px;
}


/* ==========================================
   INFORMATION
========================================== */

.info {
    color: #555;

    margin-bottom: 9px;

    font-size: 15px;
}

.vendor {
    color: #666;

    font-size: 14px;

    margin-top: 12px;

    padding-top: 12px;

    border-top: 1px solid #eee;
}


/* ==========================================
   DESCRIPTION
========================================== */

.description {
    color: #777;

    margin-top: 12px;

    line-height: 1.5;

    min-height: 45px;

    font-size: 14px;
}


/* ==========================================
   BUY BUTTON
========================================== */

.buy-btn {
    display: block;

    width: 100%;

    margin-top: 20px;

    padding: 13px;

    background: #43a047;

    color: white;

    text-align: center;

    border-radius: 8px;

    text-decoration: none;

    font-weight: bold;

    font-size: 16px;

    transition: 0.2s;
}

.buy-btn:hover {
    background: #2e7d32;

    transform: scale(1.02);
}


/* ==========================================
   EMPTY
========================================== */

.empty {
    background: white;

    padding: 70px 20px;

    text-align: center;

    border-radius: 15px;

    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

.empty-icon {
    font-size: 70px;

    margin-bottom: 20px;
}

.empty h2 {
    color: #555;

    margin-bottom: 10px;
}

.empty p {
    color: #777;
}


/* ==========================================
   FOOTER
========================================== */

.footer {
    margin-top: 50px;

    background: #2e7d32;

    color: white;

    text-align: center;

    padding: 20px;
}


/* ==========================================
   TABLET
========================================== */

@media (max-width: 900px) {

    .vegetable-grid {
        grid-template-columns: repeat(2, 1fr);
    }

}


/* ==========================================
   MOBILE
========================================== */

@media (max-width: 600px) {

    .navbar {
        padding: 15px 20px;
    }

    .logo {
        font-size: 21px;
    }

    .nav-btn {
        padding: 8px 10px;

        font-size: 12px;
    }

    .container {
        margin: 20px auto;

        padding: 12px;
    }

    .page-header h1 {
        font-size: 26px;
    }

    .vegetable-grid {
        grid-template-columns: 1fr;
    }

    .image-box {
        height: 210px;
    }

}

</style>

</head>


<body>


<!-- ==========================================
     NAVBAR
========================================== -->

<nav class="navbar">

    <div class="logo">
        🥬 Smart Vendor
    </div>

    <div class="nav-buttons">

        <a
            href="dashboard.php"
            class="nav-btn"
        >
            Dashboard
        </a>

        <a
            href="../logout.php"
            class="nav-btn"
        >
            Logout
        </a>

    </div>

</nav>


<!-- ==========================================
     MAIN
========================================== -->

<div class="container">


    <!-- PAGE HEADER -->

    <div class="page-header">

        <h1>
            🥬 Fresh Vegetables
        </h1>

        <p>
            Choose fresh vegetables from your trusted local vendor
            and book them online.
        </p>

    </div>


    <?php if ($result && $result->num_rows > 0) { ?>


        <!-- VEGETABLE GRID -->

        <div class="vegetable-grid">


            <?php while ($vegetable = $result->fetch_assoc()) { ?>


                <!-- CARD -->

                <div class="card">


                    <!-- IMAGE -->

                    <div class="image-box">

                        <?php if (!empty($vegetable["image"])) { ?>

                            <img
                                src="../uploads/<?php echo htmlspecialchars($vegetable["image"]); ?>"
                                alt="<?php echo htmlspecialchars($vegetable["name"]); ?>"
                                class="vegetable-image"
                            >

                        <?php } else { ?>

                            <div class="vegetable-icon">
                                🥬
                            </div>

                        <?php } ?>

                    </div>


                    <!-- CARD CONTENT -->

                    <div class="card-content">


                        <!-- NAME -->

                        <h2>

                            <?php
                            echo htmlspecialchars(
                                $vegetable["name"]
                            );
                            ?>

                        </h2>


                        <!-- PRICE -->

                        <div class="price">

                            ₹<?php
                            echo number_format(
                                $vegetable["price"],
                                2
                            );
                            ?>

                            /

                            <?php
                            echo htmlspecialchars(
                                $vegetable["unit"]
                            );
                            ?>

                        </div>


                        <!-- AVAILABLE QUANTITY -->

                        <div class="info">

                            📦 <strong>Available:</strong>

                            <?php
                            echo htmlspecialchars(
                                $vegetable["available_quantity"]
                            );
                            ?>

                            <?php
                            echo htmlspecialchars(
                                $vegetable["unit"]
                            );
                            ?>

                        </div>


                        <!-- VENDOR -->

                        <div class="vendor">

                            👨‍🌾 <strong>Vendor:</strong>

                            <?php
                            echo htmlspecialchars(
                                $vegetable["vendor_name"]
                            );
                            ?>

                        </div>


                        <!-- DESCRIPTION -->

                        <div class="description">

                            <?php

                            if (
                                !empty(
                                    $vegetable["description"]
                                )
                            ) {

                                echo htmlspecialchars(
                                    $vegetable["description"]
                                );

                            } else {

                                echo "Fresh vegetable available from local vendor.";

                            }

                            ?>

                        </div>


                        <!-- BUY BUTTON -->

                        <a
                            href="book_vegetable.php?id=<?php echo (int)$vegetable["id"]; ?>"
                            class="buy-btn"
                        >
                            🛒 Buy Now
                        </a>


                    </div>


                </div>


            <?php } ?>


        </div>


    <?php } else { ?>


        <!-- EMPTY -->

        <div class="empty">

            <div class="empty-icon">
                🥬
            </div>

            <h2>
                No Vegetables Available
            </h2>

            <p>
                Currently there are no vegetables available.
                Please check again later.
            </p>

        </div>


    <?php } ?>


</div>


<!-- ==========================================
     FOOTER
========================================== -->

<footer class="footer">

    <p>
        © 2026 Smart Vendor | Local Vegetable Booking System
    </p>

</footer>


</body>

</html>