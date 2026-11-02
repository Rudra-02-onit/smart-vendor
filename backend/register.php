<?php

$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:5173';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit();
}

require_once __DIR__ . "/libs/autoload.php";
include "db.php";

use MongoDB\BSON\UTCDateTime;

function uploadDocument($file, $prefix)
{
    if (!isset($file) || $file["error"] !== UPLOAD_ERR_OK) {
        return ["success" => false, "message" => "Please upload the required document."];
    }

    $allowedTypes = [
        "application/pdf" => "pdf",
        "image/jpeg"      => "jpg",
        "image/png"       => "png",
        "image/webp"      => "webp"
    ];

    $finfo    = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file["tmp_name"]);
    finfo_close($finfo);

    if (!isset($allowedTypes[$mimeType])) {
        return ["success" => false, "message" => "Only PDF, JPG, PNG and WEBP documents are allowed."];
    }

    $uploadDir = dirname(__DIR__) . "/uploads/";
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

    $extension = $allowedTypes[$mimeType];
    $fileName  = $prefix . "_" . time() . "_" . bin2hex(random_bytes(4)) . "." . $extension;
    $targetPath = $uploadDir . $fileName;

    if (!move_uploaded_file($file["tmp_name"], $targetPath)) {
        return ["success" => false, "message" => "Unable to save document."];
    }

    return ["success" => true, "file_name" => $fileName, "file_path" => $targetPath];
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit();
}

$name             = trim($_POST["name"]             ?? "");
$email            = trim($_POST["email"]            ?? "");
$phone            = trim($_POST["phone"]            ?? "");
$address          = trim($_POST["address"]          ?? "");
$password         = $_POST["password"]              ?? "";
$confirm_password = $_POST["confirm_password"]      ?? "";
$role             = $_POST["role"]                  ?? "";

// Vendor fields
$id_proof_number      = trim($_POST["id_proof_number"]      ?? "");
$tax_number           = trim($_POST["tax_number"]           ?? "");
$bank_name            = trim($_POST["bank_name"]            ?? "");
$account_holder_name  = trim($_POST["account_holder_name"]  ?? "");
$account_number       = trim($_POST["account_number"]       ?? "");
$ifsc_code            = trim($_POST["ifsc_code"]            ?? "");

// Basic validation
if ($name === "" || $email === "" || $phone === "" || $address === "" || $password === "" || $confirm_password === "" || $role === "") {
    echo json_encode(["success" => false, "message" => "Please fill all required fields."]);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Please enter a valid email."]);
    exit();
}

// Phone validation - 10 digits, starts with 6/7/8/9
if (!preg_match('/^[6-9][0-9]{9}$/', $phone)) {
    echo json_encode(["success" => false, "message" => "Phone number must be 10 digits and must start with 6, 7, 8 or 9."]);
    exit();
}

// Password validation - 8-12 chars, 1 uppercase, 1 special char, 1 number
if (strlen($password) < 8 || strlen($password) > 12) {
    echo json_encode(["success" => false, "message" => "Password must be 8 to 12 characters long."]);
    exit();
}
if (!preg_match('/[A-Z]/', $password)) {
    echo json_encode(["success" => false, "message" => "Password must contain at least 1 uppercase letter (A-Z)."]);
    exit();
}
if (!preg_match('/[@#$*!%^&]/', $password)) {
    echo json_encode(["success" => false, "message" => "Password must contain at least 1 special character (@#\$*!%^&)."]);
    exit();
}
if (!preg_match('/[0-9]/', $password)) {
    echo json_encode(["success" => false, "message" => "Password must contain at least 1 number (0-9)."]);
    exit();
}

if ($password !== $confirm_password) {
    echo json_encode(["success" => false, "message" => "Passwords do not match."]);
    exit();
}

if ($role !== "customer" && $role !== "vendor") {
    echo json_encode(["success" => false, "message" => "Please select a valid account type."]);
    exit();
}

if ($role === "vendor" && ($id_proof_number === "" || $tax_number === "" || $bank_name === "" || $account_holder_name === "" || $account_number === "" || $ifsc_code === "")) {
    echo json_encode(["success" => false, "message" => "Please fill all vendor document and bank details."]);
    exit();
}

// Check duplicate email
$existing = $usersCollection->findOne(["email" => $email]);
if ($existing) {
    echo json_encode(["success" => false, "message" => "This email is already registered."]);
    exit();
}

$idProofFile = null;
$taxFile     = null;
$uploadedFiles = [];

// Vendor document uploads
if ($role === "vendor") {
    if (!isset($_FILES["id_proof_document"])) {
        echo json_encode(["success" => false, "message" => "Please upload ID proof document."]);
        exit();
    }

    $idUpload = uploadDocument($_FILES["id_proof_document"], "id_proof");
    if (!$idUpload["success"]) {
        echo json_encode(["success" => false, "message" => $idUpload["message"]]);
        exit();
    }

    $idProofFile     = $idUpload["file_name"];
    $uploadedFiles[] = $idUpload["file_path"];

    if (!isset($_FILES["tax_document"])) {
        unlink($idUpload["file_path"]);
        echo json_encode(["success" => false, "message" => "Please upload tax document."]);
        exit();
    }

    $taxUpload = uploadDocument($_FILES["tax_document"], "tax_document");
    if (!$taxUpload["success"]) {
        unlink($idUpload["file_path"]);
        echo json_encode(["success" => false, "message" => $taxUpload["message"]]);
        exit();
    }

    $taxFile         = $taxUpload["file_name"];
    $uploadedFiles[] = $taxUpload["file_path"];
}

$hashed_password = password_hash($password, PASSWORD_DEFAULT);
$status = ($role === "vendor") ? "pending" : "active";
$now    = new UTCDateTime();

try {
    // Insert user
    $userDoc = [
        "name"       => $name,
        "email"      => $email,
        "password"   => $hashed_password,
        "phone"      => $phone,
        "address"    => $address,
        "role"       => $role,
        "status"     => $status,
        "created_at" => $now
    ];

    $insertResult = $usersCollection->insertOne($userDoc);
    $user_id = $insertResult->getInsertedId();

    // Vendor profile
    if ($role === "vendor") {
        $vendorProfileDoc = [
            "user_id"              => $user_id,
            "shop_name"            => $name . "'s Vegetable Lari",
            "location"             => $address,
            "description"          => "Local vegetable vendor.",
            "id_proof_number"      => $id_proof_number,
            "id_proof_document"    => $idProofFile,
            "tax_number"           => $tax_number,
            "tax_document"         => $taxFile,
            "bank_name"            => $bank_name,
            "account_holder_name"  => $account_holder_name,
            "account_number"       => $account_number,
            "ifsc_code"            => $ifsc_code,
            "licence_number"       => null,
            "created_at"           => $now
        ];

        $vendorProfiles->insertOne($vendorProfileDoc);
    }

    if ($role === "vendor") {
        echo json_encode([
            "success" => true,
            "message" => "Vendor registration submitted successfully. Please wait for admin approval."
        ]);
    } else {
        echo json_encode([
            "success" => true,
            "message" => "Customer registration successful! You can now login."
        ]);
    }

} catch (Exception $e) {
    foreach ($uploadedFiles as $filePath) {
        if (file_exists($filePath)) unlink($filePath);
    }
    echo json_encode(["success" => false, "message" => "Registration failed: " . $e->getMessage()]);
}

?>
