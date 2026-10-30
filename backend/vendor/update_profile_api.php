<?php

session_set_cookie_params([
    "lifetime" => 0,
    "path" => "/",
    "domain" => "",
    "secure" => false,
    "httponly" => true,
    "samesite" => "Lax"
]);

session_start();

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

include __DIR__ . "/../db.php";

function response($success, $message, $extra = [])
{
    echo json_encode(
        array_merge(
            [
                "success" => $success,
                "message" => $message
            ],
            $extra
        )
    );
    exit();
}

// Vendor login check
if (!isset($_SESSION["user_id"])) {
    response(false, "Vendor not logged in.");
}

if (
    !isset($_SESSION["user_role"]) ||
    $_SESSION["user_role"] !== "vendor"
) {
    response(false, "Only vendor can update profile.");
}

$vendor_id = (int) $_SESSION["user_id"];

// Check uploaded file
if (!isset($_FILES["photo"])) {
    response(false, "Please select a photo.");
}

$file = $_FILES["photo"];

// Upload error
if ($file["error"] !== UPLOAD_ERR_OK) {

    $errorMessages = [
        UPLOAD_ERR_INI_SIZE =>
            "Photo is too large for the server.",
        UPLOAD_ERR_FORM_SIZE =>
            "Photo is too large.",
        UPLOAD_ERR_PARTIAL =>
            "Photo upload was incomplete.",
        UPLOAD_ERR_NO_FILE =>
            "Please select a photo.",
        UPLOAD_ERR_NO_TMP_DIR =>
            "Temporary folder is missing.",
        UPLOAD_ERR_CANT_WRITE =>
            "Unable to write uploaded photo.",
        UPLOAD_ERR_EXTENSION =>
            "Photo upload stopped by server."
    ];

    response(
        false,
        $errorMessages[$file["error"]]
        ?? "Photo upload failed."
    );
}

// Check file size - 5 MB
if ($file["size"] > 5 * 1024 * 1024) {
    response(
        false,
        "Photo size must be less than 5 MB."
    );
}

// Check real image
$imageInfo = @getimagesize(
    $file["tmp_name"]
);

if ($imageInfo === false) {
    response(
        false,
        "Selected file is not a valid image."
    );
}

// Allowed image types
$allowedTypes = [
    "image/jpeg" => "jpg",
    "image/png" => "png",
    "image/webp" => "webp"
];

$mimeType = $imageInfo["mime"];

if (!isset($allowedTypes[$mimeType])) {
    response(
        false,
        "Only JPG, PNG and WEBP images are allowed."
    );
}

// Upload folder - absolute path
$uploadDir = __DIR__ . "/../uploads/";

if (!is_dir($uploadDir)) {

    if (!mkdir($uploadDir, 0777, true)) {
        response(
            false,
            "Unable to create uploads folder."
        );
    }
}

if (!is_writable($uploadDir)) {
    response(
        false,
        "Uploads folder is not writable."
    );
}

// Get old photo
$stmt = $conn->prepare("
    SELECT photo
    FROM vendor_profiles
    WHERE user_id = ?
    LIMIT 1
");

if (!$stmt) {
    response(
        false,
        "Database error: " . $conn->error
    );
}

$stmt->bind_param(
    "i",
    $vendor_id
);

$stmt->execute();

$result = $stmt->get_result();

$oldPhoto = "";

if ($result->num_rows > 0) {

    $profile = $result->fetch_assoc();

    $oldPhoto = $profile["photo"] ?? "";
}

$stmt->close();

// Create new filename
$extension = $allowedTypes[$mimeType];

$newFileName =
    "vendor_" .
    $vendor_id .
    "_" .
    time() .
    "_" .
    bin2hex(random_bytes(4)) .
    "." .
    $extension;

$targetPath =
    $uploadDir . $newFileName;

// Move uploaded image
if (
    !move_uploaded_file(
        $file["tmp_name"],
        $targetPath
    )
) {

    response(
        false,
        "Unable to save photo. Check the uploads folder."
    );
}

// Check vendor profile exists
$stmt = $conn->prepare("
    SELECT id
    FROM vendor_profiles
    WHERE user_id = ?
    LIMIT 1
");

if (!$stmt) {

    if (file_exists($targetPath)) {
        unlink($targetPath);
    }

    response(
        false,
        "Database error: " . $conn->error
    );
}

$stmt->bind_param(
    "i",
    $vendor_id
);

$stmt->execute();

$result = $stmt->get_result();

$profileExists =
    $result->num_rows > 0;

$stmt->close();

// Save new photo
if ($profileExists) {

    $stmt = $conn->prepare("
        UPDATE vendor_profiles
        SET photo = ?
        WHERE user_id = ?
    ");

    if (!$stmt) {

        if (file_exists($targetPath)) {
            unlink($targetPath);
        }

        response(
            false,
            "Database error: " . $conn->error
        );
    }

    $stmt->bind_param(
        "si",
        $newFileName,
        $vendor_id
    );

} else {

    $stmt = $conn->prepare("
        INSERT INTO vendor_profiles
        (
            user_id,
            shop_name,
            location,
            description,
            photo
        )
        VALUES (?, '', '', NULL, ?)
    ");

    if (!$stmt) {

        if (file_exists($targetPath)) {
            unlink($targetPath);
        }

        response(
            false,
            "Database error: " . $conn->error
        );
    }

    $stmt->bind_param(
        "is",
        $vendor_id,
        $newFileName
    );
}

if (!$stmt->execute()) {

    if (file_exists($targetPath)) {
        unlink($targetPath);
    }

    $stmt->close();

    response(
        false,
        "Unable to save profile photo."
    );
}

$stmt->close();

// Delete old photo
if (!empty($oldPhoto)) {

    $oldPath =
        $uploadDir . basename($oldPhoto);

    if (
        file_exists($oldPath) &&
        is_file($oldPath) &&
        $oldPhoto !== $newFileName
    ) {
        unlink($oldPath);
    }
}

$conn->close();

response(
    true,
    "Profile photo updated successfully.",
    [
        "photo" => $newFileName
    ]
);

?>