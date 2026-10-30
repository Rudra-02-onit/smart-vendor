
<?php

session_start();

include "../db.php";

// ------------------------------------
// CHECK LOGIN
// ------------------------------------

if (!isset($_SESSION["user_id"])) {
    header("Location: ../login.php");
    exit();
}

// ------------------------------------
// ONLY VENDOR CAN ACCESS
// ------------------------------------

if (
    !isset($_SESSION["user_role"]) ||
    $_SESSION["user_role"] !== "vendor"
) {
    header("Location: ../login.php");
    exit();
}

$vendor_id = (int) $_SESSION["user_id"];

$message = "";
$message_type = "";


// ------------------------------------
// FORM SUBMITTED
// ------------------------------------

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $name = trim($_POST["name"] ?? "");
    $price = trim($_POST["price"] ?? "");
    $unit = trim($_POST["unit"] ?? "");
    $available_quantity = trim($_POST["available_quantity"] ?? "");
    $description = trim($_POST["description"] ?? "");

    $image_name = "";


    // ------------------------------------
    // BASIC VALIDATION
    // ------------------------------------

    if (
        $name === "" ||
        $price === "" ||
        $unit === "" ||
        $available_quantity === ""
    ) {

        $message = "Please fill all required fields.";
        $message_type = "error";

    } elseif (!is_numeric($price) || (float)$price < 0) {

        $message = "Please enter a valid price.";
        $message_type = "error";

    } elseif (
        !is_numeric($available_quantity) ||
        (float)$available_quantity < 0
    ) {

        $message = "Please enter a valid quantity.";
        $message_type = "error";

    } elseif (!in_array($unit, ["kg", "piece", "dozen"], true)) {

        $message = "Please select a valid unit.";
        $message_type = "error";

    } else {


        // ------------------------------------
        // IMAGE UPLOAD
        // ------------------------------------

        if (
            isset($_FILES["image"]) &&
            $_FILES["image"]["error"] !== UPLOAD_ERR_NO_FILE
        ) {

            // Check upload error

            if ($_FILES["image"]["error"] !== UPLOAD_ERR_OK) {

                $message = "Image upload failed. Please try again.";
                $message_type = "error";

            } else {

                $temporary_file = $_FILES["image"]["tmp_name"];


                // ------------------------------------
                // CHECK IF REAL IMAGE
                // ------------------------------------

                $image_info = @getimagesize($temporary_file);

                if ($image_info === false) {

                    $message = "Please select a valid image file.";
                    $message_type = "error";

                } else {

                    // ------------------------------------
                    // GET REAL IMAGE TYPE
                    // ------------------------------------

                    $mime_type = $image_info["mime"];

                    $allowed_types = [
                        "image/jpeg" => "jpg",
                        "image/png"  => "png",
                        "image/webp" => "webp"
                    ];


                    if (!isset($allowed_types[$mime_type])) {

                        $message =
                            "Only JPG, JPEG, PNG or WEBP images are allowed.";

                        $message_type = "error";

                    } else {

                        // ------------------------------------
                        // UPLOAD DIRECTORY
                        // ------------------------------------

                        $upload_directory = "../uploads/";


                        // Create folder if it doesn't exist

                        if (!is_dir($upload_directory)) {

                            mkdir(
                                $upload_directory,
                                0777,
                                true
                            );
                        }


                        // ------------------------------------
                        // CREATE UNIQUE IMAGE NAME
                        // ------------------------------------

                        $new_extension =
                            $allowed_types[$mime_type];

                        $image_name =
                            time() .
                            "_" .
                            uniqid() .
                            "." .
                            $new_extension;


                        $upload_path =
                            $upload_directory .
                            $image_name;


                        // ------------------------------------
                        // MOVE IMAGE
                        // ------------------------------------

                        if (
                            !move_uploaded_file(
                                $temporary_file,
                                $upload_path
                            )
                        ) {

                            $message =
                                "Image could not be uploaded.";

                            $message_type = "error";

                            $image_name = "";
                        }
                    }
                }
            }
        }


        // ------------------------------------
        // INSERT INTO DATABASE
        // ------------------------------------

        if ($message === "") {

            $price = (float) $price;

            $available_quantity =
                (float) $available_quantity;


            $sql = "
                INSERT INTO vegetables
                (
                    vendor_id,
                    name,
                    price,
                    unit,
                    available_quantity,
                    description,
                    image
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ";


            $stmt = $conn->prepare($sql);


            if (!$stmt) {

                $message =
                    "Database error: " .
                    $conn->error;

                $message_type = "error";

            } else {


                // ------------------------------------
                // CORRECT BIND PARAM
                // ------------------------------------

                $stmt->bind_param(
                    "isdsdss",
                    $vendor_id,
                    $name,
                    $price,
                    $unit,
                    $available_quantity,
                    $description,
                    $image_name
                );


                // ------------------------------------
                // EXECUTE
                // ------------------------------------

                if ($stmt->execute()) {

                    $stmt->close();

                    header(
                        "Location: vegetables.php"
                    );

                    exit();

                } else {

                    $message =
                        "Error adding vegetable: " .
                        $stmt->error;

                    $message_type = "error";

                    $stmt->close();
                }
            }
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

<title>Smart Vendor - Add Vegetable</title>


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


/* ------------------------------
   NAVBAR
------------------------------ */

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


/* ------------------------------
   CONTAINER
------------------------------ */

.container {

    max-width: 650px;

    margin: 40px auto;

    padding: 20px;
}


.form-box {

    background: white;

    padding: 30px;

    border-radius: 12px;

    box-shadow:
        0 4px 15px rgba(0,0,0,0.08);
}


h1 {

    color: #2e7d32;

    margin-bottom: 25px;
}


/* ------------------------------
   MESSAGE
------------------------------ */

.message {

    padding: 12px;

    border-radius: 7px;

    margin-bottom: 20px;

    font-weight: bold;
}


.message.error {

    background: #ffebee;

    color: #c62828;
}


/* ------------------------------
   FORM
------------------------------ */

.form-group {

    margin-bottom: 18px;
}


label {

    display: block;

    margin-bottom: 7px;

    font-weight: bold;

    color: #333;
}


input,
select,
textarea {

    width: 100%;

    padding: 12px;

    border: 1px solid #ccc;

    border-radius: 7px;

    font-size: 15px;
}


input:focus,
select:focus,
textarea:focus {

    outline: none;

    border-color: #43a047;
}


textarea {

    height: 100px;

    resize: vertical;
}


input[type="file"] {

    padding: 10px;

    background: white;
}


small {

    display: block;

    margin-top: 6px;

    color: #777;
}


/* ------------------------------
   BUTTON
------------------------------ */

.submit-btn {

    width: 100%;

    padding: 13px;

    border: none;

    border-radius: 7px;

    background: #43a047;

    color: white;

    font-size: 16px;

    font-weight: bold;

    cursor: pointer;
}


.submit-btn:hover {

    background: #2e7d32;
}


/* ------------------------------
   BACK
------------------------------ */

.back {

    display: inline-block;

    margin-top: 15px;

    color: #2e7d32;

    text-decoration: none;

    font-weight: bold;
}


/* ------------------------------
   MOBILE
------------------------------ */

@media (max-width: 600px) {

    .navbar {

        padding: 15px 20px;
    }


    .navbar h2 {

        font-size: 20px;
    }


    .nav-btn {

        padding: 8px 10px;

        font-size: 13px;
    }


    .container {

        margin: 20px auto;

        padding: 12px;
    }


    .form-box {

        padding: 20px;
    }


    h1 {

        font-size: 24px;
    }

}

</style>

</head>


<body>


<!-- NAVBAR -->

<nav class="navbar">

    <h2>🥬 Smart Vendor</h2>

    <a
        href="vegetables.php"
        class="nav-btn"
    >
        My Vegetables
    </a>

</nav>


<!-- CONTAINER -->

<div class="container">

    <div class="form-box">


        <h1>🥬 Add Vegetable</h1>


        <!-- ERROR MESSAGE -->

        <?php if ($message !== "") { ?>

            <div class="message error">

                <?php
                echo htmlspecialchars($message);
                ?>

            </div>

        <?php } ?>


        <!-- FORM -->

        <form
            method="POST"
            enctype="multipart/form-data"
        >


            <!-- NAME -->

            <div class="form-group">

                <label>
                    Vegetable Name *
                </label>

                <input
                    type="text"
                    name="name"
                    placeholder="Example: Tomato"
                    value="<?php
                        echo htmlspecialchars(
                            $_POST["name"] ?? ""
                        );
                    ?>"
                    required
                >

            </div>


            <!-- PRICE -->

            <div class="form-group">

                <label>
                    Price *
                </label>

                <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0"
                    placeholder="Example: 50"
                    value="<?php
                        echo htmlspecialchars(
                            $_POST["price"] ?? ""
                        );
                    ?>"
                    required
                >

            </div>


            <!-- UNIT -->

            <div class="form-group">

                <label>
                    Unit *
                </label>

                <select
                    name="unit"
                    required
                >

                    <option value="">
                        Select Unit
                    </option>

                    <option
                        value="kg"
                        <?php
                        echo (
                            ($_POST["unit"] ?? "") === "kg"
                        )
                        ? "selected"
                        : "";
                        ?>
                    >
                        Kg
                    </option>

                    <option
                        value="piece"
                        <?php
                        echo (
                            ($_POST["unit"] ?? "") === "piece"
                        )
                        ? "selected"
                        : "";
                        ?>
                    >
                        Piece
                    </option>

                    <option
                        value="dozen"
                        <?php
                        echo (
                            ($_POST["unit"] ?? "") === "dozen"
                        )
                        ? "selected"
                        : "";
                        ?>
                    >
                        Dozen
                    </option>

                </select>

            </div>


            <!-- QUANTITY -->

            <div class="form-group">

                <label>
                    Available Quantity *
                </label>

                <input
                    type="number"
                    name="available_quantity"
                    step="0.01"
                    min="0"
                    placeholder="Example: 100"
                    value="<?php
                        echo htmlspecialchars(
                            $_POST["available_quantity"] ?? ""
                        );
                    ?>"
                    required
                >

            </div>


            <!-- IMAGE -->

            <div class="form-group">

                <label>
                    Fresh Vegetable Photo
                </label>

                <input
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                >

                <small>
                    JPG, JPEG, PNG or WEBP only
                </small>

            </div>


            <!-- DESCRIPTION -->

            <div class="form-group">

                <label>
                    Description
                </label>

                <textarea
                    name="description"
                    placeholder="Example: Fresh tomato available today."
                ><?php
                    echo htmlspecialchars(
                        $_POST["description"] ?? ""
                    );
                ?></textarea>

            </div>


            <!-- SUBMIT -->

            <button
                type="submit"
                class="submit-btn"
            >
                ➕ Add Vegetable
            </button>


        </form>


        <!-- BACK -->

        <a
            href="vegetables.php"
            class="back"
        >
            ← Back to My Vegetables
        </a>


    </div>

</div>


</body>

</html>

