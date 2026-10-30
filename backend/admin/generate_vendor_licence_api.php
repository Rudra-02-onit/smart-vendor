<?php

session_set_cookie_params([
    "lifetime" => 0, "path" => "/", "domain" => "",
    "secure" => false, "httponly" => true, "samesite" => "Lax"
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
use MongoDB\BSON\UTCDateTime;

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Please login first."]);
    exit();
}

if ($_SESSION["user_role"] !== "admin") {
    echo json_encode(["success" => false, "message" => "Only admin can generate vendor licence."]);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit();
}

$vendor_id_str = trim($_POST["vendor_id"] ?? "");
if ($vendor_id_str === "") {
    echo json_encode(["success" => false, "message" => "Invalid vendor ID."]);
    exit();
}

try {
    $vendorObjId = new ObjectId($vendor_id_str);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Invalid vendor ID format."]);
    exit();
}

$vendor = $usersCollection->findOne(["_id" => $vendorObjId, "role" => "vendor"]);

if (!$vendor) {
    echo json_encode(["success" => false, "message" => "Vendor not found."]);
    exit();
}

if ($vendor["status"] !== "active") {
    echo json_encode(["success" => false, "message" => "Licence can only be generated for an approved vendor."]);
    exit();
}

$profile = $vendorProfiles->findOne(["user_id" => $vendorObjId]);

if ($profile && !empty($profile["licence_number"])) {
    echo json_encode([
        "success"        => true,
        "message"        => "Licence already generated.",
        "licence_number" => $profile["licence_number"]
    ]);
    exit();
}

$year          = date("Y");
$randomPart    = strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
$licence_number = "SV-" . $year . "-" . substr($vendor_id_str, -4) . "-" . $randomPart;
$generated_at  = new UTCDateTime();

if ($profile) {
    $vendorProfiles->updateOne(
        ["user_id" => $vendorObjId],
        ["\$set" => ["licence_number" => $licence_number, "licence_generated_at" => $generated_at]]
    );
} else {
    $vendorProfiles->insertOne([
        "user_id"               => $vendorObjId,
        "licence_number"        => $licence_number,
        "licence_generated_at"  => $generated_at
    ]);
}

echo json_encode([
    "success"        => true,
    "message"        => "Vendor licence generated successfully.",
    "licence_number" => $licence_number,
    "generated_at"   => date("Y-m-d H:i:s")
]);

?>
