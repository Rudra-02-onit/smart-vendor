<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { exit(); }

require_once __DIR__ . "/libs/autoload.php";
include "db.php";

$data     = json_decode(file_get_contents("php://input"), true);
$email    = trim($data["email"]    ?? "");
$password = $data["password"] ?? "";

if ($email === "" || $password === "") {
    echo json_encode(["success" => false, "message" => "Please enter email and password."]);
    exit();
}

$user = $usersCollection->findOne(["email" => $email]);

if (!$user) {
    echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    exit();
}

if ($user["status"] === "blocked") {
    echo json_encode(["success" => false, "message" => "Your account has been blocked."]);
    exit();
}

if ($user["role"] === "vendor" && $user["status"] === "pending") {
    echo json_encode(["success" => false, "message" => "Your vendor account is pending admin approval."]);
    exit();
}

if ($user["role"] === "vendor" && $user["status"] === "rejected") {
    echo json_encode(["success" => false, "message" => "Your vendor registration was rejected."]);
    exit();
}

if (!password_verify($password, $user["password"])) {
    echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    exit();
}

$userId = (string)$user["_id"];

// Simple token - userId + role + timestamp encoded
$tokenData = base64_encode(json_encode([
    "user_id" => $userId,
    "role"    => $user["role"],
    "email"   => $user["email"],
    "name"    => $user["name"],
    "status"  => $user["status"],
    "ts"      => time()
]));

// Also set session as backup
session_set_cookie_params([
    "lifetime" => 86400,
    "path"     => "/",
    "domain"   => "",
    "secure"   => false,
    "httponly" => true,
    "samesite" => "Lax"
]);
session_start();
session_regenerate_id(true);

$_SESSION["user_id"]     = $userId;
$_SESSION["user_name"]   = $user["name"];
$_SESSION["user_email"]  = $user["email"];
$_SESSION["user_role"]   = $user["role"];
$_SESSION["user_status"] = $user["status"];
session_write_close();

echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "token"   => $tokenData,
    "user"    => [
        "id"     => $userId,
        "name"   => $user["name"],
        "email"  => $user["email"],
        "role"   => $user["role"],
        "status" => $user["status"]
    ]
]);
?>
