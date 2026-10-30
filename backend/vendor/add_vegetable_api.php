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
    http_response_code(200);
    exit();
}

require_once dirname(__DIR__) . "/libs/autoload.php";
include dirname(__DIR__) . "/db.php";

use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Please login first."]);
    exit();
}

if ($_SESSION["user_role"] !== "vendor") {
    echo json_encode(["success" => false, "message" => "Only vendor can add vegetables."]);
    exit();
}

try {
    $vendorObjId = new ObjectId($_SESSION["user_id"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Invalid session."]);
    exit();
}

$name               = trim($_POST["name"]               ?? "");
$price              = trim($_POST["price"]              ?? "");
$unit               = trim($_POST["unit"]               ?? "");
$available_quantity = trim($_POST["available_quantity"] ?? "");
$description        = trim($_POST["description"]        ?? "");
$image_name         = "";

if ($name === "" || $price === "" || $unit === "" || $available_quantity === "") {
    echo json_encode(["success" => false, "message" => "Please fill all required fields."]);
    exit();
}

if (!is_numeric($price) || (float)$price < 0) {
    echo json_encode(["success" => false, "message" => "Please enter a valid price."]);
    exit();
}

if (!is_numeric($available_quantity) || (float)$available_quantity < 0) {
    echo json_encode(["success" => false, "message" => "Please enter a valid quantity."]);
    exit();
}

if (!in_array($unit, ["kg", "piece", "dozen"], true)) {
    echo json_encode(["success" => false, "message" => "Please select a valid unit."]);
    exit();
}

// Image upload
if (isset($_FILES["image"]) && $_FILES["image"]["error"] !== UPLOAD_ERR_NO_FILE) {
    if ($_FILES["image"]["error"] !== UPLOAD_ERR_OK) {
        echo json_encode(["success" => false, "message" => "Image upload failed."]);
        exit();
    }

    $image_info = @getimagesize($_FILES["image"]["tmp_name"]);
    if ($image_info === false) {
        echo json_encode(["success" => false, "message" => "Please select a valid image file."]);
        exit();
    }

    $allowed_types = ["image/jpeg" => "jpg", "image/png" => "png", "image/webp" => "webp"];
    $mime_type = $image_info["mime"];

    if (!isset($allowed_types[$mime_type])) {
        echo json_encode(["success" => false, "message" => "Only JPG, PNG or WEBP images are allowed."]);
        exit();
    }

    $upload_directory = dirname(__DIR__, 2) . "/uploads/";
    if (!is_dir($upload_directory)) mkdir($upload_directory, 0777, true);

    $new_extension = $allowed_types[$mime_type];
    $image_name    = time() . "_" . uniqid() . "." . $new_extension;
    $upload_path   = $upload_directory . $image_name;

    if (!move_uploaded_file($_FILES["image"]["tmp_name"], $upload_path)) {
        echo json_encode(["success" => false, "message" => "Image could not be uploaded."]);
        exit();
    }
}

$vegDoc = [
    "vendor_id"          => $vendorObjId,
    "name"               => $name,
    "price"              => (float)$price,
    "unit"               => $unit,
    "available_quantity" => (float)$available_quantity,
    "description"        => $description,
    "image"              => $image_name,
    "created_at"         => new UTCDateTime()
];

$result = $vegetablesCollection->insertOne($vegDoc);

echo json_encode([
    "success" => true,
    "message" => "Vegetable added successfully.",
    "id"      => (string)$result->getInsertedId(),
    "image"   => $image_name
]);

?>
