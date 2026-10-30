<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Smart Vendor</title>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }

        body {
            background: #f4f8f4;
            color: #333;
        }

        .navbar {
            background: #2e7d32;
            color: white;
            padding: 18px 50px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .navbar h2 {
            font-size: 25px;
        }

        .nav-buttons a {
            background: white;
            color: #2e7d32;
            padding: 10px 18px;
            margin-left: 8px;
            border-radius: 7px;
            text-decoration: none;
            font-weight: bold;
        }

        .hero {
            text-align: center;
            padding: 80px 20px;
            background: white;
        }

        .hero .icon {
            font-size: 80px;
            margin-bottom: 20px;
        }

        .hero h1 {
            color: #2e7d32;
            font-size: 45px;
            margin-bottom: 15px;
        }

        .hero p {
            color: #666;
            font-size: 18px;
            max-width: 650px;
            margin: auto;
            line-height: 1.6;
        }

        .buttons {
            margin-top: 30px;
        }

        .btn {
            display: inline-block;
            padding: 13px 25px;
            margin: 8px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            background: #43a047;
            color: white;
        }

        .btn:hover {
            background: #2e7d32;
        }

        .btn.secondary {
            background: #e8f5e9;
            color: #2e7d32;
        }

        .features {
            max-width: 1100px;
            margin: 50px auto;
            padding: 20px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 25px;
        }

        .card {
            background: white;
            padding: 30px;
            text-align: center;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }

        .card .icon {
            font-size: 50px;
            margin-bottom: 15px;
        }

        .card h3 {
            color: #2e7d32;
            margin-bottom: 12px;
        }

        .card p {
            color: #666;
            line-height: 1.5;
        }

        .footer {
            background: #2e7d32;
            color: white;
            text-align: center;
            padding: 20px;
            margin-top: 40px;
        }

        @media (max-width: 768px) {

            .navbar {
                padding: 15px 20px;
            }

            .navbar h2 {
                font-size: 20px;
            }

            .features {
                grid-template-columns: 1fr;
            }

            .hero h1 {
                font-size: 35px;
            }

            .nav-buttons a {
                padding: 8px 10px;
                font-size: 13px;
            }
        }
    </style>
</head>

<body>

    <nav class="navbar">

        <h2>🥬 Smart Vendor</h2>

        <div class="nav-buttons">
            <a href="login.php">Login</a>
            <a href="register.php">Register</a>
        </div>

    </nav>


    <section class="hero">

        <div class="icon">🥬</div>

        <h1>Welcome to Smart Vendor</h1>

        <p>
            Your simple online vegetable booking system.
            Buy fresh vegetables from your trusted local vendor
            without visiting the vegetable lari.
        </p>

        <div class="buttons">

            <a href="login.php" class="btn">
                🛒 Start Shopping
            </a>

            <a href="register.php" class="btn secondary">
                📝 Create Account
            </a>

        </div>

    </section>


    <section class="features">

        <div class="card">

            <div class="icon">🥦</div>

            <h3>Fresh Vegetables</h3>

            <p>
                View available vegetables,
                prices, quantity and vendor details.
            </p>

        </div>


        <div class="card">

            <div class="icon">🛒</div>

            <h3>Easy Booking</h3>

            <p>
                Select your vegetable,
                choose quantity and place your booking easily.
            </p>

        </div>


        <div class="card">

            <div class="icon">👨‍🌾</div>

            <h3>Local Vendors</h3>

            <p>
                Vendors can manage vegetables
                and handle customer bookings.
            </p>

        </div>

    </section>


    <footer class="footer">

        <p>
            © 2026 Smart Vendor | Local Vegetable Booking System
        </p>

    </footer>

</body>
</html>