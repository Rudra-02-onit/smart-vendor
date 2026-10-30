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
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { exit(); }

require_once dirname(__DIR__) . "/libs/autoload.php";
include dirname(__DIR__) . "/db.php";

use MongoDB\BSON\ObjectId;

if (!isset($_SESSION["user_id"]) || $_SESSION["user_role"] !== "vendor") {
    echo json_encode(["success" => false, "message" => "Vendor login required."]);
    exit();
}

try { $vendorObjId = new ObjectId($_SESSION["user_id"]); }
catch (Exception $e) { echo json_encode(["success" => false, "message" => "Invalid session."]); exit(); }

$user    = $usersCollection->findOne(["_id" => $vendorObjId, "role" => "vendor"]);
$profile = $vendorProfiles->findOne(["user_id" => $vendorObjId]);

if (!$user) {
    echo json_encode(["success" => false, "message" => "Vendor not found."]);
    exit();
}

echo json_encode([
    "success" => true,
    "vendor"  => [
        "id"                   => (string)$user["_id"],
        "name"                 => $user["name"]                         ?? "",
        "email"                => $user["email"]                        ?? "",
        "phone"                => $user["phone"]                        ?? "",
        "shop_name"            => $profile["shop_name"]                 ?? "",
        "location"             => $profile["location"]                  ?? "",
        "description"          => $profile["description"]               ?? "",
        "photo"                => $profile["photo"]                     ?? "",
        "licence_number"       => $profile["licence_number"]            ?? "",
        "licence_generated_at" => isset($profile["licence_generated_at"])
            ? date("Y-m-d H:i:s", $profile["licence_generated_at"]->toDateTime()->getTimestamp())
            : ""
    ]
]);
?>
