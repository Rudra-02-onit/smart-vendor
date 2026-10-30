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

$customers  = $usersCollection->countDocuments(["role" => "customer"]);
$vendors    = $usersCollection->countDocuments(["role" => "vendor"]);
$vegetables = $vegetablesCollection->countDocuments([]);
$totalBook  = $bookingsCollection->countDocuments([]);
$pending    = $bookingsCollection->countDocuments(["status" => "pending"]);
$accepted   = $bookingsCollection->countDocuments(["status" => "accepted"]);
$completed  = $bookingsCollection->countDocuments(["status" => "completed"]);
$rejected   = $bookingsCollection->countDocuments(["status" => "rejected"]);
$pendingVendors = $usersCollection->countDocuments(["role" => "vendor", "status" => "pending"]);

echo json_encode([
    "success"         => true,
    "customers"       => $customers,
    "vendors"         => $vendors,
    "vegetables"      => $vegetables,
    "total_bookings"  => $totalBook,
    "pending_bookings"=> $pending,
    "accepted_bookings"=> $accepted,
    "completed_bookings"=> $completed,
    "rejected_bookings" => $rejected,
    "pending_vendors"   => $pendingVendors
]);
?>
