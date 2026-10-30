<?php

// MongoDB Connection
$mongoUri = "mongodb://localhost:27017";
$mongoClient = new MongoDB\Client($mongoUri);
$db = $mongoClient->smart_vendor;

// Collections
$usersCollection      = $db->users;
$vegetablesCollection = $db->vegetables;
$bookingsCollection   = $db->bookings;
$vendorProfiles       = $db->vendor_profiles;
$customerProfiles     = $db->customer_profiles;

?>
