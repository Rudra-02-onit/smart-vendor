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

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { exit(); }

require_once dirname(__DIR__) . "/libs/autoload.php";
include dirname(__DIR__) . "/db.php";

if (!isset($_SESSION["user_id"]) || $_SESSION["user_role"] !== "admin") {
    echo json_encode(["success" => false, "message" => "Admin login required."]);
    exit();
}

$cursor   = $bookingsCollection->find([], ["sort" => ["created_at" => -1]]);
$bookings = [];

foreach ($cursor as $b) {
    $customerName  = ""; $customerEmail = "";
    $vendorName    = ""; $vendorEmail   = "";

    if (isset($b["customer_id"])) {
        $c = $usersCollection->findOne(["_id" => $b["customer_id"]]);
        if ($c) { $customerName = $c["name"] ?? ""; $customerEmail = $c["email"] ?? ""; }
    }
    if (isset($b["vendor_id"])) {
        $v = $usersCollection->findOne(["_id" => $b["vendor_id"]]);
        if ($v) { $vendorName = $v["name"] ?? ""; $vendorEmail = $v["email"] ?? ""; }
    }

    $createdAt = "";
    if (isset($b["created_at"])) {
        $createdAt = date("Y-m-d H:i:s", $b["created_at"]->toDateTime()->getTimestamp());
    }

    $bookings[] = [
        "booking_id"     => (string)$b["_id"],
        "customer_name"  => $customerName,
        "customer_email" => $customerEmail,
        "vendor_name"    => $vendorName,
        "vendor_email"   => $vendorEmail,
        "vegetable_name" => $b["vegetable_name"] ?? "",
        "unit"           => $b["unit"]           ?? "kg",
        "quantity"       => $b["quantity"]        ?? 0,
        "price"          => $b["price"]           ?? 0,
        "total_amount"   => $b["total_amount"]    ?? 0,
        "status"         => $b["status"]          ?? "pending",
        "customer_note"  => $b["customer_note"]   ?? "",
        "created_at"     => $createdAt
    ];
}

echo json_encode(["success" => true, "bookings" => $bookings]);
?>
