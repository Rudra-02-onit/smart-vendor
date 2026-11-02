<?php

/**
 * Seed Script - Sample Vendor + Vegetables add karo
 * Run: http://localhost/backend/seed_data.php
 * EK BAAR CHALAAO
 */

require_once __DIR__ . "/libs/autoload.php";
include "db.php";

use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

header("Content-Type: application/json");

$now = new UTCDateTime();

// ── 1. Check if vendor already exists ──
$existingVendor = $usersCollection->findOne(["email" => "vendor@smartvendor.com"]);

if (!$existingVendor) {
    // Create sample vendor user
    $vendorResult = $usersCollection->insertOne([
        "name"       => "Ramesh Vegetables",
        "email"      => "vendor@smartvendor.com",
        "password"   => password_hash("Vendor@123", PASSWORD_DEFAULT),
        "phone"      => "9876543210",
        "address"    => "Sabzi Mandi, Market Road",
        "role"       => "vendor",
        "status"     => "active",
        "created_at" => $now
    ]);

    $vendorId = $vendorResult->getInsertedId();

    // Vendor profile
    $vendorProfiles->insertOne([
        "user_id"     => $vendorId,
        "shop_name"   => "Ramesh Fresh Vegetables",
        "location"    => "Sabzi Mandi, Market Road",
        "description" => "Fresh vegetables daily from local farms.",
        "created_at"  => $now
    ]);

} else {
    $vendorId = $existingVendor["_id"];
}

// ── 2. Vegetables data ──
$vegetables = [
    [
        "name"               => "Tomato",
        "price"              => 30,
        "unit"               => "kg",
        "available_quantity" => 100,
        "description"        => "Fresh red tomatoes",
        "image"              => "tometo.jpeg.jfif"
    ],
    [
        "name"               => "Onion",
        "price"              => 25,
        "unit"               => "kg",
        "available_quantity" => 150,
        "description"        => "Fresh onions",
        "image"              => "onion.jfif"
    ],
    [
        "name"               => "Potato",
        "price"              => 20,
        "unit"               => "kg",
        "available_quantity" => 200,
        "description"        => "Fresh potatoes",
        "image"              => "poteto.jpg"
    ],
    [
        "name"               => "Green Chilli",
        "price"              => 60,
        "unit"               => "kg",
        "available_quantity" => 50,
        "description"        => "Fresh green chillies",
        "image"              => "green chilli.jfif"
    ],
    [
        "name"               => "Ginger",
        "price"              => 120,
        "unit"               => "kg",
        "available_quantity" => 40,
        "description"        => "Fresh ginger",
        "image"              => "ginger.jfif"
    ],
    [
        "name"               => "Coriander",
        "price"              => 15,
        "unit"               => "piece",
        "available_quantity" => 80,
        "description"        => "Fresh coriander bunch",
        "image"              => "coriander"
    ],
    [
        "name"               => "Ladies Finger",
        "price"              => 40,
        "unit"               => "kg",
        "available_quantity" => 60,
        "description"        => "Fresh ladies finger (bhindi)",
        "image"              => "ladies finger.jfif"
    ],
    [
        "name"               => "Capsicum",
        "price"              => 80,
        "unit"               => "kg",
        "available_quantity" => 30,
        "description"        => "Fresh green capsicum",
        "image"              => ""
    ],
    [
        "name"               => "Cabbage",
        "price"              => 25,
        "unit"               => "piece",
        "available_quantity" => 50,
        "description"        => "Fresh cabbage",
        "image"              => ""
    ],
    [
        "name"               => "Carrot",
        "price"              => 35,
        "unit"               => "kg",
        "available_quantity" => 70,
        "description"        => "Fresh carrots",
        "image"              => ""
    ],
];

$added   = 0;
$skipped = 0;

foreach ($vegetables as $veg) {
    // Skip if already exists
    $existing = $vegetablesCollection->findOne([
        "name"      => $veg["name"],
        "vendor_id" => $vendorId
    ]);

    if ($existing) {
        $skipped++;
        continue;
    }

    $vegetablesCollection->insertOne([
        "vendor_id"          => $vendorId,
        "name"               => $veg["name"],
        "price"              => $veg["price"],
        "unit"               => $veg["unit"],
        "available_quantity" => $veg["available_quantity"],
        "description"        => $veg["description"],
        "image"              => $veg["image"],
        "created_at"         => $now
    ]);

    $added++;
}

// ── 3. Sample Customer ──
$existingCustomer = $usersCollection->findOne(["email" => "customer@test.com"]);

if (!$existingCustomer) {
    $usersCollection->insertOne([
        "name"       => "Rahul Kumar",
        "email"      => "customer@test.com",
        "password"   => password_hash("Customer@123", PASSWORD_DEFAULT),
        "phone"      => "9123456789",
        "address"    => "123, Green Park, Delhi",
        "role"       => "customer",
        "status"     => "active",
        "created_at" => $now
    ]);
    $customerMsg = "Customer created!";
} else {
    $customerMsg = "Customer already exists.";
}

echo json_encode([
    "success"      => true,
    "message"      => "Seed completed!",
    "vegetables_added"   => $added,
    "vegetables_skipped" => $skipped,
    "vendor_email"    => "vendor@smartvendor.com",
    "vendor_password" => "Vendor@123",
    "customer_email"    => "customer@test.com",
    "customer_password" => "Customer@123",
    "customer_status"   => $customerMsg
]);

?>
