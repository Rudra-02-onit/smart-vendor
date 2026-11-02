<?php

session_set_cookie_params(["lifetime"=>0,"path"=>"/","domain"=>"","secure"=>false,"httponly"=>true,"samesite"=>"Lax"]);
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { exit(); }

require_once dirname(__DIR__) . "/libs/autoload.php";
include dirname(__DIR__) . "/db.php";

use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success"=>false,"message"=>"Please login first."]);
    exit();
}
if ($_SESSION["user_role"] !== "customer") {
    echo json_encode(["success"=>false,"message"=>"Only customers can book."]);
    exit();
}

$customer_id   = $_SESSION["user_id"];
$vegetable_id  = trim($_POST["vegetable_id"]  ?? "");
$quantity      = (float)($_POST["quantity"]   ?? 0);
$customer_note = trim($_POST["customer_note"] ?? "");

if ($vegetable_id === "" || $quantity <= 0) {
    echo json_encode(["success"=>false,"message"=>"Invalid vegetable or quantity."]);
    exit();
}

try {
    $vegObjId  = new ObjectId($vegetable_id);
    $vegetable = $vegetablesCollection->findOne(["_id"=>$vegObjId,"available_quantity"=>["\$gt"=>0]]);
} catch (Exception $e) {
    echo json_encode(["success"=>false,"message"=>"Invalid vegetable ID."]);
    exit();
}

if (!$vegetable) {
    echo json_encode(["success"=>false,"message"=>"Vegetable is not available."]);
    exit();
}

if ($quantity > (float)$vegetable["available_quantity"]) {
    echo json_encode(["success"=>false,"message"=>"Only ".$vegetable["available_quantity"]." ".$vegetable["unit"]." available."]);
    exit();
}

// ── Delivery Timing Logic ──
// Booking slots: 5am-8am → delivery 10am-12pm, 8am-12pm → delivery 2pm-4pm, 12pm-6pm → delivery next morning 7am-9am
$hour = (int)date("G"); // 0-23
$bookingTime = date("H:i");

if ($hour >= 5 && $hour < 8) {
    $deliverySlot = "10:00 AM - 12:00 PM Today";
    $deliveryTime = date("Y-m-d") . " 10:00:00";
} elseif ($hour >= 8 && $hour < 12) {
    $deliverySlot = "2:00 PM - 4:00 PM Today";
    $deliveryTime = date("Y-m-d") . " 14:00:00";
} elseif ($hour >= 12 && $hour < 18) {
    $deliverySlot = "7:00 AM - 9:00 AM Tomorrow";
    $deliveryTime = date("Y-m-d", strtotime("+1 day")) . " 07:00:00";
} else {
    $deliverySlot = "7:00 AM - 9:00 AM Tomorrow";
    $deliveryTime = date("Y-m-d", strtotime("+1 day")) . " 07:00:00";
}

$price        = (float)$vegetable["price"];
$total_amount = $quantity * $price;
$vendor_id    = $vegetable["vendor_id"];

// Get platform settings
$settingsCollection = $db->platform_settings;
$settings = $settingsCollection->findOne(["type"=>"main"]);
$platformFeePct = (float)($settings["platform_fee_percent"] ?? 5);
$deliveryCharge = (float)($settings["delivery_charge_base"] ?? 20);
$taxPct         = (float)($settings["tax_percent"]          ?? 2);
$minQty         = (float)($settings["min_quantity_kg"]      ?? 0.5);

// Min quantity check
if ($quantity < $minQty) {
    echo json_encode(["success"=>false,"message"=>"Minimum order quantity is {$minQty} {$vegetable['unit']}."]);
    exit();
}

$platform_fee  = round($total_amount * $platformFeePct / 100, 2);
$tax_amount    = round($total_amount * $taxPct / 100, 2);
$grand_total   = $total_amount + $platform_fee + $deliveryCharge + $tax_amount;
$now          = new UTCDateTime();

try {
    $customerObjId = new ObjectId($customer_id);

    $bookingDoc = [
        "customer_id"    => $customerObjId,
        "vendor_id"      => $vendor_id,
        "vegetable_id"   => $vegObjId,
        "vegetable_name" => $vegetable["name"],
        "category"       => $vegetable["category"] ?? "Vegetables",
        "unit"           => $vegetable["unit"],
        "quantity"       => $quantity,
        "price"          => $price,
        "item_total"     => $total_amount,
        "platform_fee"   => $platform_fee,
        "delivery_charge"=> $deliveryCharge,
        "tax"            => $tax_amount,
        "total_amount"   => $grand_total,
        "status"         => "pending",
        "customer_note"  => $customer_note,
        "delivery_slot"  => $deliverySlot,
        "delivery_time"  => $deliveryTime,
        "booking_time"   => date("H:i"),
        "created_at"     => $now
    ];

    $result    = $bookingsCollection->insertOne($bookingDoc);
    $booking_id = (string)$result->getInsertedId();

    $vegetablesCollection->updateOne(
        ["_id"=>$vegObjId,"available_quantity"=>["\$gte"=>$quantity]],
        ["\$inc"=>["available_quantity"=>-$quantity]]
    );

    echo json_encode([
        "success"        => true,
        "message"        => "Booking successful.",
        "booking_id"     => $booking_id,
        "item_total"     => $total_amount,
        "platform_fee"   => $platform_fee,
        "delivery_charge"=> $deliveryCharge,
        "tax"            => $tax_amount,
        "total_amount"   => $grand_total,
        "delivery_slot"  => $deliverySlot
    ]);

} catch (Exception $e) {
    echo json_encode(["success"=>false,"message"=>"Booking failed: ".$e->getMessage()]);
}
?>
