<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit();
}

session_set_cookie_params([
    "lifetime" => 0, "path" => "/", "domain" => "",
    "secure" => false, "httponly" => true, "samesite" => "Lax"
]);

session_start();

require_once dirname(__DIR__) . "/libs/autoload.php";
include dirname(__DIR__) . "/db.php";

use MongoDB\BSON\ObjectId;

if (!isset($_SESSION["user_id"]) || $_SESSION["user_role"] !== "vendor") {
    echo json_encode(["success" => false, "message" => "Vendor login required.", "logged_in" => false]);
    exit();
}

try {
    $vendorObjId = new ObjectId($_SESSION["user_id"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Invalid session."]);
    exit();
}

// POST - Update booking status
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $input      = json_decode(file_get_contents("php://input"), true);
    $booking_id = trim($input["booking_id"] ?? "");
    $status     = strtolower(trim($input["status"] ?? ""));

    if ($booking_id === "") {
        echo json_encode(["success" => false, "message" => "Invalid booking ID."]);
        exit();
    }

    if (!in_array($status, ["accepted", "rejected", "completed"], true)) {
        echo json_encode(["success" => false, "message" => "Invalid booking status."]);
        exit();
    }

    try {
        $bookingObjId = new ObjectId($booking_id);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Invalid booking ID format."]);
        exit();
    }

    $booking = $bookingsCollection->findOne(["_id" => $bookingObjId, "vendor_id" => $vendorObjId]);

    if (!$booking) {
        echo json_encode(["success" => false, "message" => "Booking not found."]);
        exit();
    }

    $current = strtolower(trim($booking["status"] ?? ""));
    $allowed = false;

    if (in_array($current, ["pending", "booked"]) && in_array($status, ["accepted", "rejected"])) {
        $allowed = true;
    }
    if ($current === "accepted" && $status === "completed") {
        $allowed = true;
    }

    if (!$allowed) {
        echo json_encode(["success" => false, "message" => "Status change not allowed."]);
        exit();
    }

    $bookingsCollection->updateOne(
        ["_id" => $bookingObjId, "vendor_id" => $vendorObjId],
        ["\$set" => ["status" => $status]]
    );

    echo json_encode(["success" => true, "message" => "Booking status updated successfully."]);
    exit();
}

// GET vendor bookings
$cursor   = $bookingsCollection->find(
    ["vendor_id" => $vendorObjId],
    ["sort" => ["created_at" => -1]]
);

$bookings = [];
foreach ($cursor as $b) {
    // Get customer info
    $customerName  = "";
    $customerEmail = "";
    $customerPhone = "";

    if (isset($b["customer_id"])) {
        $customer = $usersCollection->findOne(["_id" => $b["customer_id"]]);
        if ($customer) {
            $customerName  = $customer["name"]  ?? "";
            $customerEmail = $customer["email"] ?? "";
            $customerPhone = $customer["phone"] ?? "";
        }
    }

    $createdAt = "";
    if (isset($b["created_at"])) {
        $createdAt = date("Y-m-d H:i:s", $b["created_at"]->toDateTime()->getTimestamp());
    }

    $bookings[] = [
        "booking_id"     => (string)$b["_id"],
        "total_amount"   => $b["total_amount"]   ?? 0,
        "status"         => $b["status"]          ?? "pending",
        "customer_note"  => $b["customer_note"]   ?? "",
        "created_at"     => $createdAt,
        "quantity"       => $b["quantity"]         ?? 0,
        "price"          => $b["price"]            ?? 0,
        "subtotal"       => $b["total_amount"]     ?? 0,
        "vegetable_id"   => isset($b["vegetable_id"]) ? (string)$b["vegetable_id"] : "",
        "vegetable_name" => $b["vegetable_name"]   ?? "",
        "unit"           => $b["unit"]             ?? "kg",
        "image"          => $b["image"]            ?? "",
        "delivery_slot"  => $b["delivery_slot"]    ?? "",
        "customer_name"  => $customerName,
        "customer_email" => $customerEmail,
        "customer_phone" => $customerPhone
    ];
}

echo json_encode(["success" => true, "bookings" => $bookings, "count" => count($bookings)]);

?>
