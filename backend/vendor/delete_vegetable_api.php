<?php

session_set_cookie_params([
    "lifetime" => 0, "path" => "/", "domain" => "",
    "secure" => false, "httponly" => true, "samesite" => "Lax"
]);

session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit();
}

require_once dirname(__DIR__) . "/libs/autoload.php";
include dirname(__DIR__) . "/db.php";

use MongoDB\BSON\ObjectId;

if (!isset($_SESSION["user_id"]) || $_SESSION["user_role"] !== "vendor") {
    echo json_encode(["success" => false, "message" => "Vendor login required."]);
    exit();
}

try {
    $vendorObjId = new ObjectId($_SESSION["user_id"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Invalid session."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$veg_id_str = trim($data["id"] ?? "");

if ($veg_id_str === "") {
    echo json_encode(["success" => false, "message" => "Invalid vegetable ID."]);
    exit();
}

try {
    $vegObjId = new ObjectId($veg_id_str);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Invalid vegetable ID format."]);
    exit();
}

$vegetable = $vegetablesCollection->findOne(["_id" => $vegObjId, "vendor_id" => $vendorObjId]);
if (!$vegetable) {
    echo json_encode(["success" => false, "message" => "Vegetable not found or you are not allowed to delete it."]);
    exit();
}

$deleteResult = $vegetablesCollection->deleteOne(["_id" => $vegObjId, "vendor_id" => $vendorObjId]);

if ($deleteResult->getDeletedCount() > 0) {
    // Delete image
    $image = trim($vegetable["image"] ?? "");
    if ($image !== "") {
        $fileName  = basename(str_replace("\\", "/", $image));
        $imagePath = dirname(__DIR__, 2) . "/uploads/" . $fileName;
        if (file_exists($imagePath)) @unlink($imagePath);
    }
    echo json_encode(["success" => true, "message" => "Vegetable deleted successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Unable to delete vegetable."]);
}

?>
