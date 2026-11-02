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

$cursor = $vegetablesCollection->find(
    ["vendor_id" => $vendorObjId],
    ["sort" => ["_id" => -1]]
);

$vegetables = [];
$uploadsDir = dirname(__DIR__, 2) . "/uploads/";

foreach ($cursor as $row) {
    $imageUrl = "";
    $dbImage  = trim($row["image"] ?? "");

    if ($dbImage !== "") {
        $fileName   = basename(str_replace("\\", "/", $dbImage));
        $actualFile = $uploadsDir . $fileName;

        if (file_exists($actualFile)) {
            $imageUrl = "http://localhost/uploads/" . rawurlencode($fileName);
        } else {
            $vegName    = trim($row["name"]);
            $extensions = ["jpg", "jpeg", "png", "webp", "jfif"];
            foreach ($extensions as $ext) {
                if (file_exists($uploadsDir . $vegName . "." . $ext)) {
                    $imageUrl = "http://localhost/uploads/" . rawurlencode($vegName . "." . $ext);
                    break;
                }
            }
        }
    }

    $vegetables[] = [
        "id"          => (string)$row["_id"],
        "name"        => $row["name"]               ?? "",
        "price"       => $row["price"]               ?? 0,
        "unit"        => $row["unit"]                ?? "kg",
        "quantity"    => $row["available_quantity"]  ?? 0,
        "description" => $row["description"]         ?? "",
        "image"       => $imageUrl,
        "vendor_name" => $_SESSION["user_name"]
    ];
}

echo json_encode(["success" => true, "vegetables" => $vegetables]);

?>
