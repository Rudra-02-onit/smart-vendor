<?php

session_set_cookie_params([
    "lifetime" => 0, "path" => "/", "domain" => "",
    "secure" => false, "httponly" => true, "samesite" => "Lax"
]);

session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit();
}

require_once dirname(__DIR__) . "/libs/autoload.php";
include dirname(__DIR__) . "/db.php";

use MongoDB\BSON\ObjectId;

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Please login first."]);
    exit();
}

if ($_SESSION["user_role"] !== "vendor") {
    echo json_encode(["success" => false, "message" => "Only vendor can edit vegetables."]);
    exit();
}

try {
    $vendorObjId = new ObjectId($_SESSION["user_id"]);
    $vegObjId    = new ObjectId(trim($_POST["id"] ?? ""));
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Invalid ID."]);
    exit();
}

$name               = trim($_POST["name"]               ?? "");
$price              = (float)($_POST["price"]           ?? 0);
$unit               = trim($_POST["unit"]               ?? "");
$available_quantity = (float)($_POST["available_quantity"] ?? 0);
$description        = trim($_POST["description"]        ?? "");

if ($name === "") {
    echo json_encode(["success" => false, "message" => "Vegetable name is required."]);
    exit();
}

if (!in_array($unit, ["kg", "piece", "dozen"])) {
    echo json_encode(["success" => false, "message" => "Invalid unit."]);
    exit();
}

// Get old vegetable
$vegetable = $vegetablesCollection->findOne(["_id" => $vegObjId, "vendor_id" => $vendorObjId]);
if (!$vegetable) {
    echo json_encode(["success" => false, "message" => "Vegetable not found."]);
    exit();
}

$image_name   = $vegetable["image"] ?? "";
$uploadsDir   = dirname(__DIR__, 2) . "/uploads/";

// New image
if (isset($_FILES["image"]) && $_FILES["image"]["error"] === UPLOAD_ERR_OK) {
    $check = getimagesize($_FILES["image"]["tmp_name"]);
    if ($check === false) {
        echo json_encode(["success" => false, "message" => "Invalid image."]);
        exit();
    }

    $allowed = ["image/jpeg" => "jpg", "image/png" => "png", "image/webp" => "webp"];
    if (!isset($allowed[$check["mime"]])) {
        echo json_encode(["success" => false, "message" => "Only JPG, PNG and WEBP images are allowed."]);
        exit();
    }

    $new_image_name = uniqid("veg_", true) . "." . $allowed[$check["mime"]];
    $target         = $uploadsDir . $new_image_name;

    if (!is_dir($uploadsDir)) mkdir($uploadsDir, 0777, true);

    if (!move_uploaded_file($_FILES["image"]["tmp_name"], $target)) {
        echo json_encode(["success" => false, "message" => "Unable to save image."]);
        exit();
    }

    // Delete old image
    if (!empty($image_name) && file_exists($uploadsDir . $image_name)) {
        unlink($uploadsDir . $image_name);
    }

    $image_name = $new_image_name;
}

$vegetablesCollection->updateOne(
    ["_id" => $vegObjId, "vendor_id" => $vendorObjId],
    ["\$set" => [
        "name"               => $name,
        "price"              => $price,
        "unit"               => $unit,
        "available_quantity" => $available_quantity,
        "description"        => $description,
        "image"              => $image_name
    ]]
);

echo json_encode(["success" => true, "message" => "Vegetable updated successfully."]);

?>
