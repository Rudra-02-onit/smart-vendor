<?php

session_start();

header("Content-Type: application/json");

include "../db.php";

// Check login
if (!isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Please login first."
    ]);
    exit();
}

// Vendor ko allow nahi karna
if (
    isset($_SESSION["user_role"]) &&
    $_SESSION["user_role"] === "vendor"
) {
    echo json_encode([
        "success" => false,
        "message" => "Vendor cannot access customer bookings."
    ]);
    exit();
}

$customer_id = $_SESSION["user_id"];

// Get customer bookings
$stmt = $conn->prepare("
    SELECT
        b.id AS booking_id,
        b.total_amount,
        b.status,
        b.created_at,
        bi.quantity,
        bi.price,
        v.name AS vegetable_name,
        v.unit,
        u.name AS vendor_name
    FROM bookings b
    INNER JOIN booking_items bi
        ON b.id = bi.booking_id
    INNER JOIN vegetables v
        ON bi.vegetable_id = v.id
    INNER JOIN users u
        ON b.vendor_id = u.id
    WHERE b.customer_id = ?
    ORDER BY b.created_at DESC
");

$stmt->bind_param("i", $customer_id);
$stmt->execute();

$result = $stmt->get_result();

$bookings = [];

while ($booking = $result->fetch_assoc()) {

    $bookings[] = [
        "booking_id" => $booking["booking_id"],
        "total_amount" => $booking["total_amount"],
        "status" => $booking["status"],
        "created_at" => $booking["created_at"],
        "quantity" => $booking["quantity"],
        "price" => $booking["price"],
        "vegetable_name" => $booking["vegetable_name"],
        "unit" => $booking["unit"],
        "vendor_name" => $booking["vendor_name"]
    ];
}

echo json_encode([
    "success" => true,
    "bookings" => $bookings
]);

$stmt->close();
$conn->close();

?>