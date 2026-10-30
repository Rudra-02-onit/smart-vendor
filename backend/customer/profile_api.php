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

if ($_SESSION["user_role"] !== "customer") {
    echo json_encode(["success" => false, "message" => "Only customers can view profile."]);
    exit();
}

try {
    $customerObjId = new ObjectId($_SESSION["user_id"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Invalid session."]);
    exit();
}

$user = $usersCollection->findOne(["_id" => $customerObjId, "role" => "customer"]);

if (!$user) {
    echo json_encode(["success" => false, "message" => "Customer not found."]);
    exit();
}

// Get photo from customer_profiles
$profile = $customerProfiles->findOne(["user_id" => $customerObjId]);
$photo   = $profile["photo"] ?? "";

echo json_encode([
    "success"  => true,
    "customer" => [
        "id"    => (string)$user["_id"],
        "name"  => $user["name"],
        "email" => $user["email"],
        "phone" => $user["phone"] ?? "",
        "photo" => $photo
    ]
]);

?>
