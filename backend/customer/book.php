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

$customer_id = $_SESSION["user_id"];

// Check vegetable ID
if (!isset($_GET["id"]) || !is_numeric($_GET["id"])) {
    header("Location: vegetables.php");
    exit();
}

$vegetable_id = (int) $_GET["id"];

$message = "";
$message_type = "";


/* --------------------------------
   FETCH VEGETABLE
-------------------------------- */

$stmt = $conn->prepare(
    "SELECT 
        vegetables.id,
        vegetables.name,
        vegetables.price,
        vegetables.unit,
        vegetables.available_quantity,
        vegetables.description,
        vegetables.vendor_id,
        users.name AS vendor_name
     FROM vegetables
     INNER JOIN users
        ON vegetables.vendor_id = users.id
     WHERE vegetables.id = ?
       AND vegetables.available_quantity > 0
       AND users.role = 'vendor'"
);

$stmt->bind_param("i", $vegetable_id);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows == 0) {
    header("Location: vegetables.php");
    exit();
}

$vegetable = $result->fetch_assoc();


/* --------------------------------
   BOOKING SUBMIT
-------------------------------- */

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $quantity = isset($_POST["quantity"])
        ? (float) $_POST["quantity"]
        : 0;

    $customer_note = isset($_POST["customer_note"])
        ? trim($_POST["customer_note"])
        : "";


    // Validate quantity
    if ($quantity <= 0) {

        $message = "Please enter a valid quantity.";
        $message_type = "error";

    } elseif ($quantity > (float)$vegetable["available_quantity"]) {

        $message = "Only " .
            $vegetable["available_quantity"] .
            " " .
            $vegetable["unit"] .
            " is available.";

        $message_type = "error";

    } else {

        $price = (float) $vegetable["price"];

        $total_amount = $quantity * $price;

        $vendor_id = (int) $vegetable["vendor_id"];


        /*
        --------------------------------
        START DATABASE TRANSACTION
        --------------------------------
        */

        $conn->begin_transaction();

        try {

            /*
            --------------------------------
            INSERT INTO BOOKINGS
            --------------------------------
            */

            $booking_stmt = $conn->prepare(
                "INSERT INTO bookings
                (customer_id, vendor_id, total_amount, status, customer_note)
                VALUES (?, ?, ?, 'pending', ?)"
            );

            $booking_stmt->bind_param(
                "iids",
                $customer_id,
                $vendor_id,
                $total_amount,
                $customer_note
            );

            if (!$booking_stmt->execute()) {
                throw new Exception("Booking could not be created.");
            }


            // Get booking ID
            $booking_id = $conn->insert_id;


            /*
            --------------------------------
            INSERT INTO BOOKING ITEMS
            --------------------------------
            */

            $item_stmt = $conn->prepare(
                "INSERT INTO booking_items
                (booking_id, vegetable_id, quantity, price, subtotal)
                VALUES (?, ?, ?, ?, ?)"
            );

            $item_stmt->bind_param(
                "iiddd",
                $booking_id,
                $vegetable_id,
                $quantity,
                $price,
                $total_amount
            );

            if (!$item_stmt->execute()) {
                throw new Exception("Booking item could not be created.");
            }


            /*
            --------------------------------
            UPDATE VEGETABLE STOCK
            --------------------------------
            */

            $update_stmt = $conn->prepare(
                "UPDATE vegetables
                 SET available_quantity = available_quantity - ?
                 WHERE id = ?
                 AND available_quantity >= ?"
            );

            $update_stmt->bind_param(
                "did",
                $quantity,
                $vegetable_id,
                $quantity
            );

            if (!$update_stmt->execute()) {
                throw new Exception("Vegetable quantity could not be updated.");
            }


            if ($update_stmt->affected_rows == 0) {
                throw new Exception("Not enough vegetable quantity available.");
            }


            /*
            --------------------------------
            COMMIT
            --------------------------------
            */

            $conn->commit();

            header(
                "Location: my_bookings.php?success=1"
            );

            exit();

        } catch (Exception $e) {

            /*
            --------------------------------
            ROLLBACK
            --------------------------------
            */

            $conn->rollback();

            $message = "Booking failed. Please try again.";
            $message_type = "error";
        }
    }
}

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Smart Vendor - Book Vegetable</title>


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

        .container {
            max-width: 650px;

            margin: 40px auto;

            padding: 20px;
        }

        .box {
            background: white;

            padding: 30px;

            border-radius: 12px;

            box-shadow:
                0 4px 15px rgba(0,0,0,0.08);
        }

        .title {
            text-align: center;

            color: #2e7d32;

            margin-bottom: 25px;
        }

        .vegetable {
            text-align: center;

            margin-bottom: 25px;
        }

        .icon {
            font-size: 60px;

            margin-bottom: 10px;
        }

        .vegetable h1 {
            color: #333;

            margin-bottom: 10px;
        }

        .vendor {
            color: #555;

            margin-bottom: 10px;
        }

        .price {
            color: #2e7d32;

            font-size: 24px;

            font-weight: bold;

            margin-bottom: 10px;
        }

        .available {
            color: #666;

            margin-bottom: 15px;
        }

        .description {
            color: #777;

            margin-bottom: 25px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;

            font-weight: bold;

            color: #333;

            margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;

            padding: 12px;

            border: 1px solid #ccc;

            border-radius: 7px;

            font-size: 16px;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;

            border-color: #43a047;
        }

        textarea {
            resize: vertical;

            min-height: 90px;
        }

        .total-box {
            background: #e8f5e9;

            padding: 18px;

            border-radius: 8px;

            margin-bottom: 20px;

            text-align: center;
        }

        .total-box span {
            color: #555;

            display: block;

            margin-bottom: 5px;
        }

        .total {
            color: #2e7d32;

            font-size: 28px;

            font-weight: bold;
        }

        .book-btn {
            width: 100%;

            border: none;

            background: #43a047;

            color: white;

            padding: 14px;

            border-radius: 8px;

            font-size: 17px;

            font-weight: bold;

            cursor: pointer;
        }

        .book-btn:hover {
            background: #2e7d32;
        }

        .back-btn {
            display: block;

            text-align: center;

            margin-top: 15px;

            color: #2e7d32;

            text-decoration: none;

            font-weight: bold;
        }

        .message {
            padding: 12px;

            border-radius: 7px;

            margin-bottom: 20px;

            text-align: center;

            font-weight: bold;
        }

        .error {
            background: #ffebee;

            color: #c62828;
        }

        @media (max-width: 600px) {

            .navbar {
                padding: 15px 20px;
            }

            .container {
                margin: 20px auto;

                padding: 15px;
            }

            .box {
                padding: 20px;
            }

        }

    </style>

</head>


<body>


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


<div class="container">

    <div class="box">

        <h2 class="title">
            🛒 Book Vegetable
        </h2>


        <?php if ($message != "") { ?>

            <div class="message error">

                <?php
                echo htmlspecialchars($message);
                ?>

            </div>

        <?php } ?>


        <div class="vegetable">

            <div class="icon">
                🥬
            </div>


            <h1>

                <?php
                echo htmlspecialchars(
                    $vegetable["name"]
                );
                ?>

            </h1>


            <div class="vendor">

                👨‍🌾 Vendor:

                <strong>

                    <?php
                    echo htmlspecialchars(
                        $vegetable["vendor_name"]
                    );
                    ?>

                </strong>

            </div>


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


            <div class="available">

                📦 Available:

                <strong>

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

                </strong>

            </div>


            <div class="description">

                <?php

                if (!empty($vegetable["description"])) {

                    echo htmlspecialchars(
                        $vegetable["description"]
                    );

                } else {

                    echo "Fresh vegetable available today.";

                }

                ?>

            </div>

        </div>


        <form method="POST">


            <div class="form-group">

                <label>
                    Quantity
                    (<?php echo htmlspecialchars($vegetable["unit"]); ?>)
                </label>

                <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    min="0.01"
                    max="<?php echo $vegetable["available_quantity"]; ?>"
                    step="0.01"
                    value="1"
                    required
                    oninput="calculateTotal()"
                >

            </div>


            <div class="total-box">

                <span>
                    Total Amount
                </span>

                <div class="total">

                    ₹<span id="totalAmount">0.00</span>

                </div>

            </div>


            <div class="form-group">

                <label>
                    Customer Note (Optional)
                </label>

                <textarea
                    name="customer_note"
                    placeholder="Example: Please keep fresh tomatoes."
                ></textarea>

            </div>


            <button
                type="submit"
                class="book-btn"
                onclick="return confirmBooking();"
            >
                🛒 Confirm Booking
            </button>


        </form>


        <a
            href="vegetables.php"
            class="back-btn"
        >
            ← Back to Vegetables
        </a>

    </div>

</div>


<script>

    const price =
        <?php echo (float)$vegetable["price"]; ?>;

    const unit =
        "<?php echo htmlspecialchars($vegetable["unit"]); ?>";


    function calculateTotal() {

        const quantity =
            parseFloat(
                document.getElementById("quantity").value
            ) || 0;

        const total =
            quantity * price;

        document.getElementById("totalAmount")
            .innerText =
            total.toFixed(2);
    }


    function confirmBooking() {

        const quantity =
            parseFloat(
                document.getElementById("quantity").value
            ) || 0;

        if (quantity <= 0) {

            alert("Please enter a valid quantity.");

            return false;
        }

        return confirm(
            "Confirm booking of " +
            quantity +
            " " +
            unit +
            " for ₹" +
            (quantity * price).toFixed(2) +
            "?"
        );
    }


    calculateTotal();

</script>


</body>

</html>