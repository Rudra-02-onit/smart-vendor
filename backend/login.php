<?php

session_start();

include "db.php";

$message = "";
$message_type = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $email = trim($_POST["email"]);
    $password = $_POST["password"];

    if ($email == "" || $password == "") {

        $message = "Please enter email and password.";
        $message_type = "error";

    } else {

        $stmt = $conn->prepare(
            "SELECT id, name, email, password, role, status
             FROM users
             WHERE email = ?"
        );

        $stmt->bind_param("s", $email);

        $stmt->execute();

        $result = $stmt->get_result();

        if ($result->num_rows == 1) {

            $user = $result->fetch_assoc();

            // Check if user is blocked
            if ($user["status"] == "blocked") {

                $message = "Your account has been blocked. You cannot make bookings.";
                $message_type = "error";

            } elseif (password_verify($password, $user["password"])) {

                // Regenerate session ID for security
                session_regenerate_id(true);

                // Store user information in session
                $_SESSION["user_id"] = $user["id"];
                $_SESSION["user_name"] = $user["name"];
                $_SESSION["user_email"] = $user["email"];
                $_SESSION["user_role"] = $user["role"];
                $_SESSION["user_status"] = $user["status"];

                // Redirect according to role
                if ($user["role"] == "customer") {

                    header("Location: customer/dashboard.php");
                    exit();

                } elseif ($user["role"] == "vendor") {

                    header("Location: vendor/dashboard.php");
                    exit();

                } elseif ($user["role"] == "admin") {

                    header("Location: admin/dashboard.php");
                    exit();

                }

            } else {

                $message = "Invalid email or password.";
                $message_type = "error";
            }

        } else {

            $message = "Invalid email or password.";
            $message_type = "error";
        }

        $stmt->close();
    }
}

?>

<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Smart Vendor - Login</title>

    <style>

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }

        body {
            min-height: 100vh;
            background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            width: 100%;
            max-width: 420px;
            background: white;
            padding: 35px;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.12);
        }

        .logo {
            text-align: center;
            margin-bottom: 25px;
        }

        .logo h1 {
            color: #2e7d32;
            font-size: 32px;
        }

        .logo p {
            color: #666;
            margin-top: 5px;
        }

        .message {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }

        .error {
            background: #ffebee;
            color: #c62828;
        }

        .form-group {
            margin-top: 18px;
        }

        label {
            display: block;
            margin-bottom: 7px;
            font-weight: bold;
            color: #333;
        }

        input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 15px;
        }

        input:focus {
            outline: none;
            border-color: #43a047;
        }

        button {
            width: 100%;
            margin-top: 25px;
            padding: 13px;
            border: none;
            border-radius: 8px;
            background: #43a047;
            color: white;
            font-size: 17px;
            font-weight: bold;
            cursor: pointer;
        }

        button:hover {
            background: #2e7d32;
        }

        .register-link {
            text-align: center;
            margin-top: 20px;
            color: #555;
        }

        .register-link a {
            color: #2e7d32;
            text-decoration: none;
            font-weight: bold;
        }

    </style>

</head>

<body>

<div class="container">

    <div class="logo">

        <h1>🥬 Smart Vendor</h1>

        <p>Login to your account</p>

    </div>

    <?php if ($message != "") { ?>

        <div class="message <?php echo $message_type; ?>">

            <?php echo htmlspecialchars($message); ?>

        </div>

    <?php } ?>

    <form method="POST" action="">

        <div class="form-group">

            <label>Email</label>

            <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
            >

        </div>

        <div class="form-group">

            <label>Password</label>

            <input
                type="password"
                name="password"
                placeholder="Enter your password"
                required
            >

        </div>

        <button type="submit">
            Login
        </button>

    </form>

    <div class="register-link">

        Don't have an account?

        <a href="register.php">Create Account</a>

    </div>

</div>

</body>

</html>