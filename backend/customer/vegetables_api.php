<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit();
}

session_set_cookie_params([
    "lifetime" => 0,
    "path"     => "/",
    "domain"   => "",
    "secure"   => false,
    "httponly" => true,
    "samesite" => "Lax"
]);

session_start();

require_once dirname(__DIR__) . "/libs/autoload.php";
include dirname(__DIR__) . "/db.php";

// Get all available vegetables
$cursor = $vegetablesCollection->find(
    ["available_quantity" => ["\$gt" => 0]],
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
            $imageUrl = "http://localhost/smart_vendor/uploads/" . rawurlencode($fileName);
        } else {
            $vegName    = trim($row["name"]);
            $extensions = ["jpg", "jpeg", "png", "webp", "jfif"];
            foreach ($extensions as $ext) {
                $possibleFile = $uploadsDir . $vegName . "." . $ext;
                if (file_exists($possibleFile)) {
                    $imageUrl = "http://localhost/smart_vendor/uploads/" . rawurlencode($vegName . "." . $ext);
                    break;
                }
            }
        }
    }

    // Get vendor name
    $vendorName = "";
    if (isset($row["vendor_id"])) {
        $vendor = $usersCollection->findOne(["_id" => $row["vendor_id"]]);
        if ($vendor) $vendorName = $vendor["name"];
    }

    $vegetables[] = [
        "id"                 => (string)$row["_id"],
        "name"               => $row["name"]               ?? "",
        "price"              => $row["price"]               ?? 0,
        "unit"               => $row["unit"]                ?? "kg",
        "available_quantity" => $row["available_quantity"]  ?? 0,
        "description"        => $row["description"]         ?? "",
        "image"              => $imageUrl,
        "vendor_name"        => $vendorName
    ];
}

echo json_encode(["success" => true, "vegetables" => $vegetables]);

?>
