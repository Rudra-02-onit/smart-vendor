<?php
session_set_cookie_params(["lifetime"=>0,"path"=>"/","domain"=>"","secure"=>false,"httponly"=>true,"samesite"=>"Lax"]);
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") exit();

require_once dirname(__DIR__) . "/libs/autoload.php";
include dirname(__DIR__) . "/db.php";

if (!isset($_SESSION["user_id"]) || $_SESSION["user_role"] !== "admin") {
    echo json_encode(["success"=>false,"message"=>"Admin only."]);
    exit();
}

$settingsCollection = $db->platform_settings;
$s = $settingsCollection->findOne(["type"=>"main"]);
$platformFee = (float)($s["platform_fee_percent"] ?? 5);
$deliveryBase = (float)($s["delivery_charge_base"] ?? 20);
$taxPercent = (float)($s["tax_percent"] ?? 2);

// All completed bookings
$completed = $bookingsCollection->find(["status" => ["\$in" => ["completed","accepted"]]]);

$totalRevenue      = 0;
$totalPlatformFees = 0;
$totalDelivery     = 0;
$totalTax          = 0;
$vendorSales       = [];
$monthlySales      = array_fill(0, 12, 0);

foreach ($completed as $b) {
    $amount   = (float)($b["total_amount"] ?? 0);
    $fee      = $amount * $platformFee / 100;
    $delivery = $deliveryBase;
    $tax      = $amount * $taxPercent / 100;
    $total    = $amount + $fee + $delivery + $tax;

    $totalRevenue      += $total;
    $totalPlatformFees += $fee;
    $totalDelivery     += $delivery;
    $totalTax          += $tax;

    // Vendor wise
    $vid = isset($b["vendor_id"]) ? (string)$b["vendor_id"] : "unknown";
    if (!isset($vendorSales[$vid])) {
        $vendor = $usersCollection->findOne(["_id" => $b["vendor_id"]]);
        $vendorSales[$vid] = [
            "vendor_name"  => $vendor["name"] ?? "Unknown",
            "total_sales"  => 0,
            "orders"       => 0,
            "platform_fee" => 0,
        ];
    }
    $vendorSales[$vid]["total_sales"]  += $amount;
    $vendorSales[$vid]["orders"]       += 1;
    $vendorSales[$vid]["platform_fee"] += $fee;

    // Monthly
    if (isset($b["created_at"])) {
        $month = (int)date("n", $b["created_at"]->toDateTime()->getTimestamp()) - 1;
        $monthlySales[$month] += $total;
    }
}

// Top vendors
usort($vendorSales, fn($a,$b) => $b["total_sales"] - $a["total_sales"]);
$topVendors = array_values(array_slice($vendorSales, 0, 5));

// Monthly labels
$months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
$monthlyData = [];
for ($i=0; $i<12; $i++) {
    $monthlyData[] = ["month"=>$months[$i], "sales"=>round($monthlySales[$i], 2)];
}

echo json_encode([
    "success"           => true,
    "total_revenue"     => round($totalRevenue, 2),
    "platform_fees"     => round($totalPlatformFees, 2),
    "delivery_charges"  => round($totalDelivery, 2),
    "tax_collected"     => round($totalTax, 2),
    "platform_fee_pct"  => $platformFee,
    "top_vendors"       => $topVendors,
    "monthly_sales"     => $monthlyData,
]);
?>
