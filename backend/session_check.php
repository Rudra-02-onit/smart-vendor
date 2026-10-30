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

echo json_encode([
    "success"    => true,
    "session_id" => session_id(),
    "user_id"    => $_SESSION["user_id"]   ?? null,
    "user_role"  => $_SESSION["user_role"] ?? null,
    "user_name"  => $_SESSION["user_name"] ?? null,
    "logged_in"  => isset($_SESSION["user_id"])
]);

?>
