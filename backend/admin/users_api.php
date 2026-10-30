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

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit();
}

require_once dirname(__DIR__) . "/libs/autoload.php";
include dirname(__DIR__) . "/db.php";

use MongoDB\BSON\ObjectId;

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "message" => "Please login first."]);
    exit();
}

if ($_SESSION["user_role"] !== "admin") {
    echo json_encode(["success" => false, "message" => "Only admin can manage users."]);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $user_id_str = trim($_POST["user_id"] ?? "");
    $action      = trim($_POST["action"]  ?? "");

    if ($user_id_str === "") {
        echo json_encode(["success" => false, "message" => "Invalid user ID."]);
        exit();
    }

    if ($user_id_str === $_SESSION["user_id"]) {
        echo json_encode(["success" => false, "message" => "You cannot modify your own admin account."]);
        exit();
    }

    try {
        $userObjId = new ObjectId($user_id_str);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Invalid user ID format."]);
        exit();
    }

    if ($action === "accept") {
        $result = $usersCollection->updateOne(
            ["_id" => $userObjId, "role" => "vendor", "status" => "pending"],
            ["\$set" => ["status" => "active"]]
        );
        if ($result->getModifiedCount() > 0) {
            echo json_encode(["success" => true, "message" => "Vendor accepted successfully."]);
        } else {
            echo json_encode(["success" => false, "message" => "Vendor not found or already processed."]);
        }
        exit();
    }

    if ($action === "reject") {
        $result = $usersCollection->updateOne(
            ["_id" => $userObjId, "role" => "vendor", "status" => "pending"],
            ["\$set" => ["status" => "rejected"]]
        );
        if ($result->getModifiedCount() > 0) {
            echo json_encode(["success" => true, "message" => "Vendor rejected successfully."]);
        } else {
            echo json_encode(["success" => false, "message" => "Vendor not found or already processed."]);
        }
        exit();
    }

    if ($action === "delete") {
        $result = $usersCollection->deleteOne(
            ["_id" => $userObjId, "role" => ["\$ne" => "admin"]]
        );
        if ($result->getDeletedCount() > 0) {
            echo json_encode(["success" => true, "message" => "User deleted successfully."]);
        } else {
            echo json_encode(["success" => false, "message" => "User not found."]);
        }
        exit();
    }

    if (in_array($action, ["block", "unblock"], true)) {
        $new_status = ($action === "block") ? "blocked" : "active";
        $result = $usersCollection->updateOne(
            ["_id" => $userObjId, "role" => ["\$ne" => "admin"]],
            ["\$set" => ["status" => $new_status]]
        );
        if ($result->getModifiedCount() > 0) {
            echo json_encode(["success" => true, "message" => ($action === "block") ? "User blocked successfully." : "User unblocked successfully."]);
        } else {
            echo json_encode(["success" => false, "message" => "User not found or status unchanged."]);
        }
        exit();
    }

    echo json_encode(["success" => false, "message" => "Invalid action."]);
    exit();
}

// GET USERS
$cursor = $usersCollection->find(
    ["role" => ["\$in" => ["customer", "vendor"]]],
    ["sort" => ["_id" => -1]]
);

$users = [];
foreach ($cursor as $row) {
    $status = $row["status"] ?? "pending";
    $createdAt = "";
    if (isset($row["created_at"])) {
        $createdAt = date("Y-m-d H:i:s", $row["created_at"]->toDateTime()->getTimestamp());
    }

    $users[] = [
        "id"         => (string)$row["_id"],
        "name"       => $row["name"]    ?? "",
        "email"      => $row["email"]   ?? "",
        "phone"      => $row["phone"]   ?? "",
        "address"    => $row["address"] ?? "",
        "role"       => $row["role"]    ?? "",
        "status"     => $status,
        "created_at" => $createdAt
    ];
}

echo json_encode(["success" => true, "users" => $users]);

?>
