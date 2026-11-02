<?php
session_set_cookie_params(["lifetime"=>0,"path"=>"/","domain"=>"","secure"=>false,"httponly"=>true,"samesite"=>"Lax"]);
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit();

require_once dirname(__DIR__) . "/libs/autoload.php";
include dirname(__DIR__) . "/db.php";

if (!isset($_SESSION["user_id"]) || $_SESSION["user_role"] !== "admin") {
    echo json_encode(["success"=>false,"message"=>"Admin only."]);
    exit();
}

use MongoDB\BSON\UTCDateTime;

$settingsCollection = $db->platform_settings;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $settings = [
        "platform_fee_percent" => (float)($data["platform_fee_percent"] ?? 5),
        "delivery_charge_base" => (float)($data["delivery_charge_base"] ?? 20),
        "min_order_amount"     => (float)($data["min_order_amount"]     ?? 50),
        "min_quantity_kg"      => (float)($data["min_quantity_kg"]      ?? 0.5),
        "tax_percent"          => (float)($data["tax_percent"]          ?? 2),
        "updated_at"           => new UTCDateTime()
    ];

    $settingsCollection->updateOne(
        ["type" => "main"],
        ["\$set" => array_merge(["type"=>"main"], $settings)],
        ["upsert" => true]
    );

    echo json_encode(["success"=>true,"message"=>"Settings saved!","settings"=>$settings]);
    exit();
}

// GET
$s = $settingsCollection->findOne(["type"=>"main"]);
if (!$s) {
    $s = [
        "platform_fee_percent" => 5,
        "delivery_charge_base" => 20,
        "min_order_amount"     => 50,
        "min_quantity_kg"      => 0.5,
        "tax_percent"          => 2,
    ];
}

echo json_encode([
    "success"  => true,
    "settings" => [
        "platform_fee_percent" => $s["platform_fee_percent"] ?? 5,
        "delivery_charge_base" => $s["delivery_charge_base"] ?? 20,
        "min_order_amount"     => $s["min_order_amount"]     ?? 50,
        "min_quantity_kg"      => $s["min_quantity_kg"]      ?? 0.5,
        "tax_percent"          => $s["tax_percent"]          ?? 2,
    ]
]);
?>
