<?php

include "db.php";

$email = "jatin123@gmail.com";
$password = "123456";

$stmt = $conn->prepare(
    "SELECT email, password, role, status
     FROM users
     WHERE email = ?
     LIMIT 1"
);

$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows !== 1) {
    echo "USER NOT FOUND";
    exit();
}

$user = $result->fetch_assoc();

echo "Email: " . $user["email"] . "<br>";
echo "Role: " . $user["role"] . "<br>";
echo "Status: " . $user["status"] . "<br>";

if (password_verify($password, $user["password"])) {
    echo "<br><b style='color:green'>PASSWORD CORRECT</b>";
} else {
    echo "<br><b style='color:red'>PASSWORD WRONG</b>";
}

$stmt->close();
$conn->close();

?>