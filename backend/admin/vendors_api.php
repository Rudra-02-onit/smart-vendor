<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

if (!isset($_SESSION["user_id"]) || $_SESSION["user_role"] !== "admin") {
    echo json_encode(["success" => false, "message" => "Admin login required."]);
    exit();
}

$cursor = $usersCollection->find(
    ["role" => "vendor"],
    ["sort" => ["_id" => -1]]
);

$vendors = [];
foreach ($cursor as $row) {
    $vendors[] = [
        "id"      => (string)$row["_id"],
        "name"    => $row["name"]    ?? "",
        "email"   => $row["email"]   ?? "",
        "phone"   => $row["phone"]   ?? "",
        "address" => $row["address"] ?? "",
        "status"  => $row["status"]  ?? "pending"
    ];
}

echo json_encode(["success" => true, "vendors" => $vendors]);

?>
