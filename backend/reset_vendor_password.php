<?php

include "db.php";

$email = "jatin123@gmail.com";
$new_password = "123456";

$hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

$stmt = $conn->prepare(
    "UPDATE users
     SET password = ?
     WHERE email = ? AND role = 'vendor'"
);

$stmt->bind_param(
    "ss",
    $hashed_password,
    $email
);

if ($stmt->execute()) {
    echo "Vendor password reset successfully.";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();

?>