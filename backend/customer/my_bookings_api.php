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
    echo json_encode(["success" => false, "message" => "Only customers can view bookings."]);
    exit();
}

$customer_id = $_SESSION["user_id"];

try {
    $customerObjId = new ObjectId($customer_id);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Invalid session."]);
    exit();
}

$cursor = $bookingsCollection->find(
    ["customer_id" => $customerObjId],
    ["sort" => ["created_at" => -1]]
);

$bookings = [];

foreach ($cursor as $booking) {
    // Get vendor name
    $vendorName = "";
    if (isset($booking["vendor_id"])) {
        $vendor = $usersCollection->findOne(["_id" => $booking["vendor_id"]]);
        if ($vendor) $vendorName = $vendor["name"];
    }

    $createdAt = "";
    if (isset($booking["created_at"])) {
        $createdAt = date("Y-m-d H:i:s", $booking["created_at"]->toDateTime()->getTimestamp());
    }

    $bookings[] = [
        "booking_id"     => (string)$booking["_id"],
        "vegetable_name" => $booking["vegetable_name"] ?? "",
        "unit"           => $booking["unit"]           ?? "kg",
        "quantity"       => $booking["quantity"]       ?? 0,
        "price"          => $booking["price"]          ?? 0,
        "total_amount"   => $booking["total_amount"]   ?? 0,
        "status"         => $booking["status"]         ?? "pending",
        "customer_note"  => $booking["customer_note"]  ?? "",
        "created_at"     => $createdAt,
        "vendor_name"    => $vendorName
    ];
}

echo json_encode(["success" => true, "bookings" => $bookings]);

?>
