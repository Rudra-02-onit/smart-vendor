<?php 

session_start(); 

include "../db.php"; 

// Customer login check 
if (!isset($_SESSION["user_id"])) { 
    header("Location: ../login.php"); 
    exit(); 
} 
 
if ($_SESSION["user_role"] != "customer") { 
    header("Location: ../login.php"); 
    exit(); 
} 
 
if ($_SERVER["REQUEST_METHOD"] != "POST") { 
    header("Location: vegetables.php"); 
    exit(); 
} 
 
$customer_id = $_SESSION["user_id"]; 
$vegetable_id = (int)$_POST["vegetable_id"]; 
$quantity = (float)$_POST["quantity"]; 
 
// Get vegetable details 
$stmt = $conn->prepare(" 
    SELECT  
        id, 
        vendor_id, 
        name, 
        price, 
        unit, 
        available_quantity 
    FROM vegetables 
    WHERE id = ? 
"); 
 
$stmt->bind_param("i", $vegetable_id); 
$stmt->execute(); 
 
$result = $stmt->get_result(); 
 
if ($result->num_rows == 0) { 
    die("Vegetable not found."); 
} 
 
$vegetable = $result->fetch_assoc(); 
 
// Check quantity 
if ($quantity <= 0) { 
    die("Invalid quantity."); 
} 
 
if ($quantity > $vegetable["available_quantity"]) { 
    die("Not enough vegetable available."); 
} 
 
$price = (float)$vegetable["price"]; 
$total_amount = $quantity * $price; 
$vendor_id = (int)$vegetable["vendor_id"]; 
 
// Start transaction 
$conn->begin_transaction(); 
 
try { 
 
    // Create booking 
    $stmt = $conn->prepare(" 
        INSERT INTO bookings 
        (customer_id, vendor_id, total_amount, status, customer_note) 
        VALUES (?, ?, ?, 'pending', '') 
    "); 
 
    $stmt->bind_param( 
        "iid", 
        $customer_id, 
        $vendor_id, 
        $total_amount 
    ); 
 
    if (!$stmt->execute()) { 
        throw new Exception("Booking creation failed."); 
    } 
 
    // Get booking ID 
    $booking_id = $conn->insert_id; 
 
    // Add booking item 
    $stmt = $conn->prepare(" 
        INSERT INTO booking_items 
        (booking_id, vegetable_id, quantity, price, subtotal) 
        VALUES (?, ?, ?, ?, ?) 
    "); 
 
    $subtotal = $quantity * $price; 
 
    $stmt->bind_param( 
        "iiddd", 
        $booking_id, 
        $vegetable_id, 
        $quantity, 
        $price, 
        $subtotal 
    ); 
 
    if (!$stmt->execute()) { 
        throw new Exception("Booking item creation failed."); 
    } 
 
    // Reduce vegetable quantity 
    $new_quantity = $vegetable["available_quantity"] - $quantity; 
 
    $stmt = $conn->prepare(" 
        UPDATE vegetables 
        SET available_quantity = ? 
        WHERE id = ? 
    "); 
 
    $stmt->bind_param( 
        "di", 
        $new_quantity, 
        $vegetable_id 
    ); 
 
    if (!$stmt->execute()) { 
        throw new Exception("Quantity update failed."); 
    } 
 
    // Everything successful 
    $conn->commit(); 
 
    ?> 
 
    <!DOCTYPE html> 
    <html lang="en"> 
 
    <head> 
 
        <meta charset="UTF-8"> 
 
        <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
 
        <title>Booking Confirmed</title> 
 
        <style> 
 
            * { 
                box-sizing: border-box; 
                font-family: Arial, sans-serif; 
            } 
 
            body { 
                margin: 0; 
                background: #f4f8f4; 
            } 
 
            .container { 
                max-width: 600px; 
                margin: 80px auto; 
                padding: 20px; 
            } 
 
            .card { 
                background: white; 
                padding: 40px; 
                border-radius: 15px; 
                text-align: center; 
                box-shadow: 0 4px 15px rgba(0,0,0,0.08); 
            } 
 
            .success { 
                font-size: 70px; 
                margin-bottom: 15px; 
            } 
 
            h1 { 
                color: #2e7d32; 
                margin-bottom: 15px; 
            } 
 
            p { 
                color: #666; 
                font-size: 16px; 
                margin: 10px; 
            } 
 
            .amount { 
                font-size: 24px; 
                font-weight: bold; 
                color: #2e7d32; 
                margin: 20px; 
            } 
 
            .btn { 
                display: inline-block; 
                background: #43a047; 
                color: white; 
                padding: 12px 20px; 
                border-radius: 7px; 
                text-decoration: none; 
                font-weight: bold; 
                margin: 8px; 
            } 
 
            .btn:hover { 
                background: #2e7d32; 
            } 
 
        </style> 
 
    </head> 
 
    <body> 
 
        <div class="container"> 
 
            <div class="card"> 
 
                <div class="success">✅</div> 
 
                <h1>Booking Confirmed!</h1> 
 
                <p> 
                    Your vegetable booking has been successfully placed. 
                </p> 
 
                <p> 
                    Vegetable: 
                    <strong> 
                        <?php echo htmlspecialchars($vegetable["name"]); ?> 
                    </strong> 
                </p> 
 
                <p> 
                    Quantity: 
                    <strong> 
                        <?php echo htmlspecialchars($quantity); ?> 
                        <?php echo htmlspecialchars($vegetable["unit"]); ?> 
                    </strong> 
                </p> 
 
                <div class="amount"> 
                    Total: ₹<?php echo number_format($total_amount, 2); ?> 
                </div> 
 
                <a href="my_bookings.php" class="btn"> 
                    🛒 My Bookings 
                </a> 
 
                <a href="vegetables.php" class="btn"> 
                    🥬 Continue Shopping 
                </a> 
 
            </div> 
 
        </div> 
 
    </body> 
 
    </html> 
 
    <?php 
 
} catch (Exception $e) { 
 
    $conn->rollback(); 
 
    echo "Booking failed: " . htmlspecialchars($e->getMessage()); 
} 
 
?>