<?php

session_set_cookie_params([
    "lifetime" => 0, "path" => "/", "domain" => "",
    "secure" => false, "httponly" => true, "samesite" => "Lax"
]);

session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

if ($_SESSION["user_role"] !== "admin") {
    echo json_encode(["success" => false, "message" => "Only admin can view vendor approvals."]);
    exit();
}

$cursor = $usersCollection->find(
    ["role" => "vendor", "status" => "pending"],
    ["sort" => ["_id" => -1]]
);

$vendors = [];
foreach ($cursor as $row) {
    $userId = $row["_id"];

    // Get vendor profile
    $profile   = $vendorProfiles->findOne(["user_id" => $userId]);
    $shopName  = $profile["shop_name"]  ?? "";
    $location  = $profile["location"]   ?? "";
    $desc      = $profile["description"]?? "";
    $photo     = $profile["photo"]      ?? "";

    $vendors[] = [
        "id"          => (string)$userId,
        "name"        => $row["name"]    ?? "",
        "email"       => $row["email"]   ?? "",
        "phone"       => $row["phone"]   ?? "",
        "address"     => $row["address"] ?? "",
        "status"      => $row["status"]  ?? "pending",
        "shop_name"   => $shopName,
        "location"    => $location,
        "description" => $desc,
        "photo"       => $photo
    ];
}

echo json_encode(["success" => true, "vendors" => $vendors]);

?>
