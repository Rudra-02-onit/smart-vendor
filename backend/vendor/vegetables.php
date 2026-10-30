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

$vendor_id = (int) $_SESSION["user_id"];

// Fetch vendor vegetables
$stmt = $conn->prepare(
    "SELECT
        id,
        name,
        price,
        unit,
        available_quantity,
        description,
        image
     FROM vegetables
     WHERE vendor_id = ?
     ORDER BY id DESC"
);

$stmt->bind_param("i", $vendor_id);
$stmt->execute();

$result = $stmt->get_result();

?>

<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>Smart Vendor - My Vegetables</title>

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


/* ---------------- NAVBAR ---------------- */

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


/* ---------------- CONTAINER ---------------- */

.container {
    max-width: 1200px;
    margin: 40px auto;
    padding: 20px;
}


/* ---------------- HEADER ---------------- */

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-bottom: 25px;
}

.header h1 {
    color: #2e7d32;
}

.add-btn {
    background: #43a047;
    color: white;

    padding: 12px 18px;

    border-radius: 8px;

    text-decoration: none;

    font-weight: bold;
}

.add-btn:hover {
    background: #2e7d32;
}


/* ---------------- GRID ---------------- */

.vegetable-grid {
    display: grid;

    grid-template-columns: repeat(3, 1fr);

    gap: 20px;
}


/* ---------------- CARD ---------------- */

.card {
    background: white;

    border-radius: 12px;

    padding: 20px;

    box-shadow:
        0 4px 15px rgba(0,0,0,0.08);

    overflow: hidden;
}


/* ---------------- VEGETABLE IMAGE ---------------- */

.vegetable-image {

    width: 100%;

    height: 220px;

    object-fit: cover;

    border-radius: 10px;

    display: block;

    margin-bottom: 15px;
}


/* ---------------- DEFAULT ICON ---------------- */

.vegetable-icon {

    width: 100%;

    height: 220px;

    display: flex;

    justify-content: center;

    align-items: center;

    background: #e8f5e9;

    border-radius: 10px;

    font-size: 80px;

    margin-bottom: 15px;
}


/* ---------------- CARD CONTENT ---------------- */

.card h2 {
    color: #333;

    margin-bottom: 10px;

    text-transform: capitalize;
}

.price {

    color: #2e7d32;

    font-size: 22px;

    font-weight: bold;

    margin-bottom: 8px;
}

.info {

    color: #666;

    margin-bottom: 7px;
}

.description {

    color: #777;

    margin-top: 12px;

    min-height: 40px;

    line-height: 1.5;
}


/* ---------------- ACTIONS ---------------- */

.actions {

    display: flex;

    gap: 10px;

    margin-top: 20px;
}

.edit-btn,
.delete-btn {

    flex: 1;

    text-align: center;

    padding: 10px;

    border-radius: 7px;

    text-decoration: none;

    font-weight: bold;
}

.edit-btn {

    background: #e8f5e9;

    color: #2e7d32;
}

.edit-btn:hover {

    background: #c8e6c9;
}

.delete-btn {

    background: #ffebee;

    color: #c62828;
}

.delete-btn:hover {

    background: #ffcdd2;
}


/* ---------------- EMPTY ---------------- */

.empty {

    background: white;

    padding: 50px;

    border-radius: 12px;

    text-align: center;

    color: #777;

    box-shadow:
        0 4px 15px rgba(0,0,0,0.08);
}

.empty .icon {

    font-size: 50px;

    margin-bottom: 15px;
}


/* ---------------- RESPONSIVE ---------------- */

@media (max-width: 900px) {

    .vegetable-grid {

        grid-template-columns: repeat(2, 1fr);
    }

}


@media (max-width: 600px) {

    .vegetable-grid {

        grid-template-columns: 1fr;
    }

    .navbar {

        padding: 15px 20px;
    }

    .navbar h2 {

        font-size: 20px;
    }

    .nav-buttons {

        gap: 5px;
    }

    .nav-btn {

        padding: 8px 10px;

        font-size: 13px;
    }

    .header {

        flex-direction: column;

        align-items: flex-start;

        gap: 15px;
    }

    .container {

        margin: 20px auto;

        padding: 12px;
    }

}

</style>

</head>


<body>


<!-- NAVBAR -->

<nav class="navbar">

    <h2>🥬 Smart Vendor</h2>

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


<!-- MAIN -->

<div class="container">


    <!-- HEADER -->

    <div class="header">

        <h1>
            My Vegetables
        </h1>

        <a
            href="add_vegetable.php"
            class="add-btn"
        >
            + Add Vegetable
        </a>

    </div>


    <?php if ($result->num_rows > 0) { ?>


        <!-- VEGETABLE GRID -->

        <div class="vegetable-grid">


            <?php while ($vegetable = $result->fetch_assoc()) { ?>


                <div class="card">


                    <!-- IMAGE -->

                    <?php if (!empty($vegetable["image"])) { ?>

                        <img
                            src="../uploads/<?php
                                echo htmlspecialchars(
                                    $vegetable["image"]
                                );
                            ?>"
                            alt="<?php
                                echo htmlspecialchars(
                                    $vegetable["name"]
                                );
                            ?>"
                            class="vegetable-image"
                        >

                    <?php } else { ?>

                        <div class="vegetable-icon">
                            🥬
                        </div>

                    <?php } ?>


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


                    <!-- QUANTITY -->

                    <div class="info">

                        📦 Available:

                        <?php
                        echo htmlspecialchars(
                            $vegetable[
                                "available_quantity"
                            ]
                        );
                        ?>

                        <?php
                        echo htmlspecialchars(
                            $vegetable["unit"]
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

                            echo "No description available.";
                        }

                        ?>

                    </div>


                    <!-- ACTION BUTTONS -->

                    <div class="actions">


                        <!-- EDIT -->

                        <a
                            href="edit_vegetable.php?id=<?php
                                echo (int)$vegetable["id"];
                            ?>"
                            class="edit-btn"
                        >
                            ✏️ Edit
                        </a>


                        <!-- DELETE -->

                        <a
                            href="delete_vegetable.php?id=<?php
                                echo (int)$vegetable["id"];
                            ?>"
                            class="delete-btn"

                            onclick="
                                return confirm(
                                    'Are you sure you want to delete this vegetable?'
                                );
                            "
                        >
                            🗑️ Delete
                        </a>


                    </div>


                </div>


            <?php } ?>


        </div>


    <?php } else { ?>


        <!-- EMPTY -->

        <div class="empty">

            <div class="icon">
                🥬
            </div>

            <h2>
                No Vegetables Added
            </h2>

            <p>
                You have not added any vegetables yet.
            </p>

            <br>

            <a
                href="add_vegetable.php"
                class="add-btn"
            >
                + Add Your First Vegetable
            </a>

        </div>


    <?php } ?>


</div>


</body>

</html>