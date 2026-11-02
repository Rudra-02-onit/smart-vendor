<?php
/**
 * Demo user passwords update karo new format mein
 * Run ONCE: http://localhost/backend/update_demo_passwords.php
 */
require_once __DIR__ . "/libs/autoload.php";
include "db.php";
header("Content-Type: application/json");

$updates = [
    ["email" => "admin@smartvendor.com",  "newPass" => "Admin@123"],
    ["email" => "vendor@smartvendor.com", "newPass" => "Vendor@123"],
    ["email" => "customer@test.com",      "newPass" => "Customer@123"],
];

$results = [];
foreach ($updates as $u) {
    $hashed = password_hash($u["newPass"], PASSWORD_DEFAULT);
    $result = $usersCollection->updateOne(
        ["email" => $u["email"]],
        ["\$set" => ["password" => $hashed]]
    );
    $results[] = [
        "email"    => $u["email"],
        "updated"  => $result->getModifiedCount() > 0,
        "password" => $u["newPass"]
    ];
}

echo json_encode(["success" => true, "results" => $results]);
?>
