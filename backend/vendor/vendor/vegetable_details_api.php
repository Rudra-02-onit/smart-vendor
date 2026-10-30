<?php

session_set_cookie_params([
    "lifetime" => 0,
    "path" => "/",
    "domain" => "",
    "secure" => false,
    "httponly" => true,
    "samesite" => "Lax"
]);

session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

include "../db.php";

// Check login
if (!isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Please login first."
    ]);
    exit();
}

// Only vendor
if (
    !isset($_SESSION["user_role"]) ||
    $_SESSION["user_role"] !== "vendor"
) {
    echo json_encode([
        "success" => false,
        "message" => "Only vendor can access this."
    ]);
    exit();
}

$vendor_id = (int) $_SESSION["user_id"];

$id = isset($_GET["id"]) ? (int) $_GET["id"] : 0;

if ($id <= 0) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid vegetable ID."
    ]);
    exit();
}

$stmt = $conn->prepare(
    "SELECT id, name, price, unit, available_quantity, description, image
     FROM vegetables
     WHERE id = ? AND vendor_id = ?"
);

$stmt->bind_param("ii", $id, $vendor_id);
$stmt->execute();

$result = $stmt->get_result();
$vegetable = $result->fetch_assoc();

$stmt->close();
$conn->close();

if (!$vegetable) {
    echo json_encode([
        "success" => false,
        "message" => "Vegetable not found."
    ]);
    exit();
}

echo json_encode([
    "success" => true,
    "vegetable" => $vegetable
]);

?>