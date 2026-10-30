<?php

session_set_cookie_params([
    "lifetime" => 0,
    "path"     => "/",
    "domain"   => "",
    "secure"   => false,
    "httponly" => true,
    "samesite" => "Lax"
]);

session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

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

if ($_SESSION["user_role"] !== "customer") {
    echo json_encode(["success" => false, "message" => "Only customers can update profile."]);
    exit();
}

try {
    $customerObjId = new ObjectId($_SESSION["user_id"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Invalid session."]);
    exit();
}

if (!isset($_FILES["photo"])) {
    echo json_encode(["success" => false, "message" => "Please select a photo."]);
    exit();
}

$file = $_FILES["photo"];
if ($file["error"] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "message" => "Photo upload error."]);
    exit();
}

$imageInfo = getimagesize($file["tmp_name"]);
if ($imageInfo === false) {
    echo json_encode(["success" => false, "message" => "Please upload a valid image."]);
    exit();
}

$allowedTypes = ["image/jpeg" => "jpg", "image/png" => "png", "image/webp" => "webp"];
$mimeType     = $imageInfo["mime"];

if (!isset($allowedTypes[$mimeType])) {
    echo json_encode(["success" => false, "message" => "Only JPG, PNG and WEBP images are allowed."]);
    exit();
}

$extension = $allowedTypes[$mimeType];
$uploadDir = dirname(__DIR__) . "/uploads/";
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

// Get old photo
$profile  = $customerProfiles->findOne(["user_id" => $customerObjId]);
$oldPhoto = $profile["photo"] ?? null;

$fileName   = "customer_" . $_SESSION["user_id"] . "_" . time() . "_" . bin2hex(random_bytes(4)) . "." . $extension;
$targetPath = $uploadDir . $fileName;

if (!move_uploaded_file($file["tmp_name"], $targetPath)) {
    echo json_encode(["success" => false, "message" => "Unable to save photo."]);
    exit();
}

if ($profile) {
    $customerProfiles->updateOne(
        ["user_id" => $customerObjId],
        ["\$set" => ["photo" => $fileName]]
    );
} else {
    $customerProfiles->insertOne([
        "user_id" => $customerObjId,
        "photo"   => $fileName
    ]);
}

// Delete old photo
if (!empty($oldPhoto)) {
    $oldPath = $uploadDir . basename($oldPhoto);
    if (file_exists($oldPath)) unlink($oldPath);
}

echo json_encode(["success" => true, "message" => "Profile photo updated successfully.", "photo" => $fileName]);

?>
