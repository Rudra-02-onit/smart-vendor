<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit();
}

session_set_cookie_params([
    "lifetime" => 0,
    "path"     => "/",
    "domain"   => "",
    "secure"   => false,
    "httponly" => true,
    "samesite" => "Lax"
]);

session_start();

require_once __DIR__ . "/libs/autoload.php";
include "db.php";

$data     = json_decode(file_get_contents("php://input"), true);
$email    = trim($data["email"]    ?? "");
$password = $data["password"] ?? "";

if ($email === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "Please enter email and password."
    ]);
    exit();
}

// Find user by email
$user = $usersCollection->findOne(["email" => $email]);

if (!$user) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);
    exit();
}

// Status checks
if ($user["status"] === "blocked") {
    echo json_encode([
        "success" => false,
        "message" => "Your account has been blocked."
    ]);
    exit();
}

if ($user["role"] === "vendor" && $user["status"] === "pending") {
    echo json_encode([
        "success" => false,
        "message" => "Your vendor account is pending admin approval."
    ]);
    exit();
}

if ($user["role"] === "vendor" && $user["status"] === "rejected") {
    echo json_encode([
        "success" => false,
        "message" => "Your vendor registration was rejected by admin."
    ]);
    exit();
}

// Verify password
if (!password_verify($password, $user["password"])) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);
    exit();
}

// Regenerate session
session_regenerate_id(true);

$userId = (string)$user["_id"];

$_SESSION["user_id"]     = $userId;
$_SESSION["user_name"]   = $user["name"];
$_SESSION["user_email"]  = $user["email"];
$_SESSION["user_role"]   = $user["role"];
$_SESSION["user_status"] = $user["status"];

session_write_close();

echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "user"    => [
        "id"     => $userId,
        "name"   => $user["name"],
        "email"  => $user["email"],
        "role"   => $user["role"],
        "status" => $user["status"]
    ]
]);

?>
