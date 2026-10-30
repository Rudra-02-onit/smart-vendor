<?php

session_start();

include "../db.php";

// Admin login check
if (!isset($_SESSION["user_id"])) {
    header("Location: ../login.php");
    exit();
}

if ($_SESSION["user_role"] != "admin") {
    header("Location: ../login.php");
    exit();
}

$message = "";
$message_type = "";

// Block / Unblock user
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if (
        isset($_POST["user_id"]) &&
        isset($_POST["action"]) &&
        is_numeric($_POST["user_id"])
    ) {

        $user_id = (int) $_POST["user_id"];
        $action = $_POST["action"];

        if ($action == "block") {
            $new_status = "blocked";
        } elseif ($action == "unblock") {
            $new_status = "active";
        } else {
            $new_status = "";
        }

        if ($new_status != "") {

            // Admin cannot block himself
            if ($user_id == $_SESSION["user_id"]) {

                $message = "You cannot block your own admin account.";
                $message_type = "error";

            } else {

                $stmt = $conn->prepare("
                    UPDATE users
                    SET status = ?
                    WHERE id = ?
                    AND role != 'admin'
                ");

                $stmt->bind_param("si", $new_status, $user_id);

                if ($stmt->execute()) {
                    $message = "User status updated successfully.";
                    $message_type = "success";
                } else {
                    $message = "Unable to update user status.";
                    $message_type = "error";
                }

                $stmt->close();
            }
        }
    }
}

// Get all customers and vendors
$stmt = $conn->prepare("
    SELECT id, name, email, role, status
    FROM users
    WHERE role IN ('customer', 'vendor')
    ORDER BY id DESC
");

$stmt->execute();

$result = $stmt->get_result();

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Smart Vendor - Manage Users</title>

    <style>

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }

        body {
            background: #f4f7f5;
            min-height: 100vh;
        }

        .navbar {
            background: #2e7d32;
            color: white;
            padding: 16px 35px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .navbar h2 {
            font-size: 24px;
        }

        .nav-links {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .nav-btn {
            background: white;
            color: #2e7d32;
            padding: 9px 15px;
            border-radius: 7px;
            text-decoration: none;
            font-weight: bold;
        }

        .nav-btn:hover {
            background: #e8f5e9;
        }

        .container {
            width: 94%;
            max-width: 1200px;
            margin: 35px auto;
        }

        .header {
            background: white;
            padding: 25px;
            border-radius: 14px;
            box-shadow: 0 5px 18px rgba(0,0,0,0.08);
            margin-bottom: 25px;
        }

        .header h1 {
            color: #2e7d32;
            margin-bottom: 7px;
        }

        .header p {
            color: #666;
        }

        .message {
            padding: 13px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
        }

        .success {
            background: #e8f5e9;
            color: #2e7d32;
        }

        .error {
            background: #ffebee;
            color: #c62828;
        }

        .table-box {
            background: white;
            padding: 20px;
            border-radius: 14px;
            box-shadow: 0 5px 18px rgba(0,0,0,0.08);
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            min-width: 750px;
        }

        th {
            background: #2e7d32;
            color: white;
            padding: 14px;
            text-align: left;
        }

        td {
            padding: 14px;
            border-bottom: 1px solid #eee;
            color: #444;
        }

        tr:hover {
            background: #f8fff8;
        }

        .role {
            padding: 6px 10px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: bold;
        }

        .customer {
            background: #e3f2fd;
            color: #1565c0;
        }

        .vendor {
            background: #fff3e0;
            color: #ef6c00;
        }

        .status {
            padding: 6px 10px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: bold;
        }

        .active {
            background: #e8f5e9;
            color: #2e7d32;
        }

        .blocked {
            background: #ffebee;
            color: #c62828;
        }

        .action-form {
            display: inline;
        }

        .btn {
            border: none;
            padding: 8px 13px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
        }

        .block-btn {
            background: #e53935;
            color: white;
        }

        .block-btn:hover {
            background: #c62828;
        }

        .unblock-btn {
            background: #43a047;
            color: white;
        }

        .unblock-btn:hover {
            background: #2e7d32;
        }

        .empty {
            text-align: center;
            padding: 30px;
            color: #777;
        }

        footer {
            text-align: center;
            padding: 25px;
            margin-top: 40px;
            color: #777;
        }

        @media (max-width: 700px) {

            .navbar {
                flex-direction: column;
                gap: 12px;
                padding: 15px;
            }

            .container {
                width: 95%;
            }

        }

    </style>

</head>

<body>

<div class="navbar">

    <h2>🥬 Smart Vendor Admin</h2>

    <div class="nav-links">

        <a href="dashboard.php" class="nav-btn">
            Dashboard
        </a>

        <a href="../logout.php" class="nav-btn">
            Logout
        </a>

    </div>

</div>


<div class="container">

    <div class="header">

        <h1>👥 Manage Users</h1>

        <p>
            View and manage all registered customers and vendors.
        </p>

    </div>


    <?php if ($message != "") { ?>

        <div class="message <?php echo $message_type; ?>">

            <?php echo htmlspecialchars($message); ?>

        </div>

    <?php } ?>


    <div class="table-box">

        <?php if ($result->num_rows > 0) { ?>

            <table>

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Name</th>

                        <th>Email</th>

                        <th>Role</th>

                        <th>Status</th>

                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

                <?php while ($user = $result->fetch_assoc()) { ?>

                    <tr>

                        <td>
                            <?php echo $user["id"]; ?>
                        </td>

                        <td>
                            <?php echo htmlspecialchars($user["name"]); ?>
                        </td>

                        <td>
                            <?php echo htmlspecialchars($user["email"]); ?>
                        </td>

                        <td>

                            <span class="role <?php echo htmlspecialchars($user["role"]); ?>">

                                <?php echo ucfirst(htmlspecialchars($user["role"])); ?>

                            </span>

                        </td>

                        <td>

                            <span class="status <?php echo htmlspecialchars($user["status"]); ?>">

                                <?php echo ucfirst(htmlspecialchars($user["status"])); ?>

                            </span>

                        </td>

                        <td>

                            <?php if ($user["status"] == "blocked") { ?>

                                <form method="POST" class="action-form">

                                    <input
                                        type="hidden"
                                        name="user_id"
                                        value="<?php echo $user["id"]; ?>"
                                    >

                                    <input
                                        type="hidden"
                                        name="action"
                                        value="unblock"
                                    >

                                    <button
                                        type="submit"
                                        class="btn unblock-btn"
                                        onclick="return confirm('Are you sure you want to unblock this user?');"
                                    >
                                        Unblock
                                    </button>

                                </form>

                            <?php } else { ?>

                                <form method="POST" class="action-form">

                                    <input
                                        type="hidden"
                                        name="user_id"
                                        value="<?php echo $user["id"]; ?>"
                                    >

                                    <input
                                        type="hidden"
                                        name="action"
                                        value="block"
                                    >

                                    <button
                                        type="submit"
                                        class="btn block-btn"
                                        onclick="return confirm('Are you sure you want to block this user?');"
                                    >
                                        Block
                                    </button>

                                </form>

                            <?php } ?>

                        </td>

                    </tr>

                <?php } ?>

                </tbody>

            </table>

        <?php } else { ?>

            <div class="empty">
                No customers or vendors found.
            </div>

        <?php } ?>

    </div>

</div>


<footer>

    © 2026 Smart Vendor | Admin Panel

</footer>

</body>

</html>

<?php
$stmt->close();
$conn->close();
?>