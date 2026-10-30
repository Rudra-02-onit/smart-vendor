# 🥬 Smart Vendor

Fresh vegetable booking system built with **React.js** frontend, **PHP** backend, and **MongoDB** database.

## 🛠️ Tech Stack

| Layer    | Technology         |
|----------|--------------------|
| Frontend | React.js + Vite    |
| Backend  | PHP (XAMPP Apache) |
| Database | MongoDB            |

## 📦 Project Structure

```
smart_vendor/
├── backend/          # PHP APIs
│   ├── admin/        # Admin APIs
│   ├── customer/     # Customer APIs
│   ├── vendor/       # Vendor APIs
│   ├── db.php        # MongoDB connection
│   ├── login_api.php
│   ├── register.php
│   └── libs/         # Composer packages (auto-generated)
├── react_frontend/   # React.js app
│   └── src/
│       └── pages/
└── uploads/          # Vegetable images
```

## ⚙️ Setup Instructions

### Prerequisites
- XAMPP (PHP 8.2+, Apache)
- MongoDB Community Server
- Node.js (for React frontend)
- Composer

### 1. MongoDB Setup
- Install MongoDB from https://www.mongodb.com/try/download/community
- Make sure MongoDB service is running on port 27017

### 2. PHP MongoDB Extension
- Download `php_mongodb` DLL for PHP 8.2 TS x64 from https://pecl.php.net/package/mongodb
- Place in `C:\xampp\php\ext\`
- Add `extension=mongodb` to `C:\xampp\php\php.ini`
- Restart Apache

### 3. Backend Setup
```bash
cd backend
composer install
```

### 4. Create Admin Account
Open browser: `http://localhost/smart_vendor/backend/create_admin.php`

Admin credentials:
- Email: `admin@smartvendor.com`
- Password: `admin123`

### 5. Frontend Setup
```bash
cd react_frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

## 🔑 Default Admin Login
- **Email:** admin@smartvendor.com
- **Password:** admin123

## 🚀 Features
- Customer registration & login
- Vendor registration with document upload
- Admin approval workflow for vendors
- Browse fresh vegetables
- Book vegetables with quantity
- Vendor manage bookings (accept/reject/complete)
- Admin dashboard with statistics
