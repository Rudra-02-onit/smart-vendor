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

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

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

if ($_SESSION["user_role"] !== "customer") {
    echo json_encode(["success" => false, "message" => "Only customers can book vegetables."]);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request."]);
    exit();
}

$customer_id   = $_SESSION["user_id"];
$vegetable_id  = trim($_POST["vegetable_id"]  ?? "");
$quantity      = (float)($_POST["quantity"]   ?? 0);
$customer_note = trim($_POST["customer_note"] ?? "");

if ($vegetable_id === "" || $quantity <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid vegetable or quantity."]);
    exit();
}

try {
    $vegObjId  = new ObjectId($vegetable_id);
    $vegetable = $vegetablesCollection->findOne([
        "_id"                => $vegObjId,
        "available_quantity" => ["\$gt" => 0]
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Invalid vegetable ID."]);
    exit();
}

if (!$vegetable) {
    echo json_encode(["success" => false, "message" => "Vegetable is not available."]);
    exit();
}

if ($quantity > (float)$vegetable["available_quantity"]) {
    echo json_encode([
        "success" => false,
        "message" => "Only " . $vegetable["available_quantity"] . " " . $vegetable["unit"] . " is available."
    ]);
    exit();
}

$price        = (float)$vegetable["price"];
$total_amount = $quantity * $price;
$vendor_id    = $vegetable["vendor_id"];
$now          = new UTCDateTime();

try {
    $customerObjId = new ObjectId($customer_id);

    $bookingDoc = [
        "customer_id"   => $customerObjId,
        "vendor_id"     => $vendor_id,
        "vegetable_id"  => $vegObjId,
        "vegetable_name"=> $vegetable["name"],
        "unit"          => $vegetable["unit"],
        "quantity"      => $quantity,
        "price"         => $price,
        "total_amount"  => $total_amount,
        "status"        => "pending",
        "customer_note" => $customer_note,
        "created_at"    => $now
    ];

    $result    = $bookingsCollection->insertOne($bookingDoc);
    $booking_id = (string)$result->getInsertedId();

    // Update vegetable quantity
    $vegetablesCollection->updateOne(
        ["_id" => $vegObjId, "available_quantity" => ["\$gte" => $quantity]],
        ["\$inc" => ["available_quantity" => -$quantity]]
    );

    echo json_encode([
        "success"      => true,
        "message"      => "Booking successful.",
        "booking_id"   => $booking_id,
        "total_amount" => $total_amount
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Booking failed: " . $e->getMessage()]);
}

?>
