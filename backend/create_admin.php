<?php

/**
 * Admin Account Create karo
 * Run: http://localhost/smart_vendor/backend/create_admin.php
 * EK BAAR CHALAAO - phir delete kar do
 */

require_once __DIR__ . "/libs/autoload.php";
include "db.php";

use MongoDB\BSON\UTCDateTime;

header("Content-Type: application/json");

// Check if admin already exists
$existing = $usersCollection->findOne(["role" => "admin"]);

if ($existing) {
    echo json_encode([
        "success"  => true,
        "message"  => "Admin already exists!",
        "email"    => $existing["email"],
        "password" => "admin123 (original password, cannot show hashed)"
    ]);
    exit();
}

// Create admin
$result = $usersCollection->insertOne([
    "name"       => "Admin",
    "email"      => "admin@smartvendor.com",
    "password"   => password_hash("admin123", PASSWORD_DEFAULT),
    "phone"      => "9999999999",
    "address"    => "Admin Office",
    "role"       => "admin",
    "status"     => "active",
    "created_at" => new UTCDateTime()
]);

echo json_encode([
    "success"  => true,
    "message"  => "Admin created successfully!",
    "id"       => (string)$result->getInsertedId(),
    "email"    => "admin@smartvendor.com",
    "password" => "admin123"
]);

?>
