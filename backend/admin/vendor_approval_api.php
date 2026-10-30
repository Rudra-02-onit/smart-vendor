<?php

ob_start();

session_set_cookie_params([
    "lifetime" => 0, "path" => "/", "domain" => "",
    "secure" => false, "httponly" => true, "samesite" => "Lax"
]);

session_start();

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    ob_end_clean();
    exit();
}

function sendResponse($data) {
    ob_clean();
    echo json_encode($data);
    exit();
}

require_once dirname(__DIR__) . "/libs/autoload.php";
include dirname(__DIR__) . "/db.php";

use MongoDB\BSON\ObjectId;

if (!isset($_SESSION["user_id"])) {
    sendResponse(["success" => false, "message" => "Please login first."]);
}

if ($_SESSION["user_role"] !== "admin") {
    sendResponse(["success" => false, "message" => "Only admin can approve vendors."]);
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    sendResponse(["success" => false, "message" => "Invalid request method."]);
}

$vendor_id_str = trim($_POST["vendor_id"] ?? "");
$action        = trim($_POST["action"]    ?? "");

if ($vendor_id_str === "") {
    sendResponse(["success" => false, "message" => "Invalid vendor ID."]);
}

if (!in_array($action, ["approve", "reject"], true)) {
    sendResponse(["success" => false, "message" => "Invalid action."]);
}

try {
    $vendorObjId = new ObjectId($vendor_id_str);
} catch (Exception $e) {
    sendResponse(["success" => false, "message" => "Invalid vendor ID format."]);
}

$vendor = $usersCollection->findOne(["_id" => $vendorObjId, "role" => "vendor"]);

if (!$vendor) {
    sendResponse(["success" => false, "message" => "Vendor not found."]);
}

if ($vendor["status"] !== "pending") {
    sendResponse(["success" => false, "message" => "This vendor is already processed."]);
}

$new_status = ($action === "approve") ? "active" : "rejected";

$result = $usersCollection->updateOne(
    ["_id" => $vendorObjId, "role" => "vendor", "status" => "pending"],
    ["\$set" => ["status" => $new_status]]
);

if ($result->getModifiedCount() !== 1) {
    sendResponse(["success" => false, "message" => "Vendor status was not updated."]);
}

if ($action === "approve") {
    sendResponse(["success" => true, "message" => "Vendor approved successfully."]);
}

sendResponse(["success" => true, "message" => "Vendor rejected successfully."]);

?>
