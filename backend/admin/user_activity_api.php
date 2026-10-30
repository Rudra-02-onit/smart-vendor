<?php

session_set_cookie_params([
    "lifetime" => 0, "path" => "/", "domain" => "",
    "secure" => false, "httponly" => true, "samesite" => "Lax"
]);

session_start();

header("Content-Type: application/json; charset=UTF-8");
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
    echo json_encode(["success" => false, "message" => "Only admin can view user activity."]);
    exit();
}

$user_id_str = trim($_GET["user_id"] ?? "");
if ($user_id_str === "") {
    echo json_encode(["success" => false, "message" => "Invalid user ID."]);
    exit();
}

try {
    $userObjId = new ObjectId($user_id_str);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Invalid user ID format."]);
    exit();
}

$user = $usersCollection->findOne(["_id" => $userObjId, "role" => ["\$in" => ["customer", "vendor"]]]);

if (!$user) {
    echo json_encode(["success" => false, "message" => "User not found."]);
    exit();
}

$activity = [];

if ($user["role"] === "customer") {
    $cursor = $bookingsCollection->find(
        ["customer_id" => $userObjId],
        ["sort" => ["created_at" => -1]]
    );

    foreach ($cursor as $b) {
        $vendor     = $usersCollection->findOne(["_id" => $b["vendor_id"]]);
        $vendorName = $vendor["name"]  ?? "";
        $vendorEmail= $vendor["email"] ?? "";
        $createdAt  = "";
        if (isset($b["created_at"])) {
            $createdAt = date("Y-m-d H:i:s", $b["created_at"]->toDateTime()->getTimestamp());
        }

        $activity[] = [
            "booking_id"     => (string)$b["_id"],
            "vegetable_name" => $b["vegetable_name"] ?? "",
            "unit"           => $b["unit"]           ?? "kg",
            "quantity"       => $b["quantity"]        ?? 0,
            "price"          => $b["price"]           ?? 0,
            "subtotal"       => $b["total_amount"]    ?? 0,
            "total_amount"   => $b["total_amount"]    ?? 0,
            "status"         => $b["status"]          ?? "",
            "date"           => $createdAt,
            "vendor_name"    => $vendorName,
            "vendor_email"   => $vendorEmail
        ];
    }

    echo json_encode([
        "success"       => true,
        "user"          => ["id" => $user_id_str, "name" => $user["name"], "email" => $user["email"], "role" => $user["role"]],
        "activity_type" => "purchases",
        "activity"      => $activity
    ]);
    exit();
}

if ($user["role"] === "vendor") {
    $cursor = $bookingsCollection->find(
        ["vendor_id" => $userObjId],
        ["sort" => ["created_at" => -1]]
    );

    foreach ($cursor as $b) {
        $customer      = $usersCollection->findOne(["_id" => $b["customer_id"]]);
        $customerName  = $customer["name"]  ?? "";
        $customerEmail = $customer["email"] ?? "";
        $createdAt     = "";
        if (isset($b["created_at"])) {
            $createdAt = date("Y-m-d H:i:s", $b["created_at"]->toDateTime()->getTimestamp());
        }

        $activity[] = [
            "booking_id"     => (string)$b["_id"],
            "vegetable_name" => $b["vegetable_name"] ?? "",
            "unit"           => $b["unit"]           ?? "kg",
            "quantity"       => $b["quantity"]        ?? 0,
            "price"          => $b["price"]           ?? 0,
            "subtotal"       => $b["total_amount"]    ?? 0,
            "total_amount"   => $b["total_amount"]    ?? 0,
            "status"         => $b["status"]          ?? "",
            "date"           => $createdAt,
            "customer_name"  => $customerName,
            "customer_email" => $customerEmail
        ];
    }

    echo json_encode([
        "success"       => true,
        "user"          => ["id" => $user_id_str, "name" => $user["name"], "email" => $user["email"], "role" => $user["role"]],
        "activity_type" => "sales",
        "activity"      => $activity
    ]);
    exit();
}

echo json_encode(["success" => false, "message" => "Invalid user role."]);

?>
