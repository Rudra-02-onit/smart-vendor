<?php

require_once __DIR__ . "/libs/autoload.php";

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $db     = $client->smart_vendor;

    // Test ping
    $db->command(["ping" => 1]);

    echo json_encode([
        "success"  => true,
        "message"  => "MongoDB connection successful!",
        "database" => "smart_vendor"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "MongoDB connection failed: " . $e->getMessage()
    ]);
}

?>
