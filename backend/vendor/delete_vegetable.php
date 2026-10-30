<?php

session_start();

include "../db.php";

// Check login
if (!isset($_SESSION["user_id"])) {
    header("Location: ../login.php");
    exit();
}

// Only vendor can access
if ($_SESSION["user_role"] != "vendor") {
    header("Location: ../login.php");
    exit();
}

$vendor_id = $_SESSION["user_id"];

// Check vegetable ID
if (!isset($_GET["id"]) || !is_numeric($_GET["id"])) {
    header("Location: vegetables.php");
    exit();
}

$vegetable_id = (int) $_GET["id"];

// Delete only vendor's own vegetable
$stmt = $conn->prepare(
    "DELETE FROM vegetables
     WHERE id = ? AND vendor_id = ?"
);

$stmt->bind_param(
    "ii",
    $vegetable_id,
    $vendor_id
);

$stmt->execute();

// Go back to vegetables page
header("Location: vegetables.php");
exit();

?>