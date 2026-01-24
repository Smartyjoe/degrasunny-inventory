# 🚀 Start Backend Server

## ✅ All Laravel 10 Issues Fixed!

Your backend is now fully configured and ready to run.

## Quick Start

### Open a new PowerShell/Terminal window and run:

```powershell
cd C:\hot-works\grasunny-inventory\backend
php artisan serve
```

You should see:
```
INFO  Server running on [http://127.0.0.1:8000].

Press Ctrl+C to stop the server.
```

---

## Test the Backend

### 1. Test Base URL
Open browser: http://localhost:8000

Should show:
```json
{
  "success": true,
  "message": "Trader Inventory API",
  "version": "1.0.0"
}
```

### 2. Test API Login

In a new PowerShell window:

```powershell
$body = @{
    email = "trader@example.com"
    password = "password"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

Should return user data with token!

### 3. Test Products API

First login to get token, then:

```powershell
$token = "YOUR_TOKEN_FROM_LOGIN"
Invoke-RestMethod -Uri "http://localhost:8000/api/products" -Headers @{Authorization="Bearer $token"}
```

Should return 5 products (Rice, Beans, Garri, Palm Oil, Groundnut Oil)!

---

## What Was Fixed

✅ **Fixed `bootstrap/app.php`** - Converted from Laravel 11 to Laravel 10 syntax
✅ **Fixed `public/index.php`** - Converted from Laravel 11 to Laravel 10 syntax  
✅ **Fixed `routes/console.php`** - Removed Laravel 11 Schedule facade
✅ **Updated `app/Console/Kernel.php`** - Moved scheduled tasks here (Laravel 10 way)
✅ **Created `app/Http/Kernel.php`** - Full middleware configuration
✅ **Created all middleware** - Authenticate, TrustProxies, etc.
✅ **Created `app/Exceptions/Handler.php`** - Exception handling
✅ **Created storage directories** - All cache and log directories
✅ **Database migrated** - All 7 tables created
✅ **Sample data seeded** - 2 users, 5 products, stock, sales

---

## Verify Schedule Works

```powershell
php artisan schedule:list
```

Should show:
```
0 0 * * *  php artisan stock:carryforward  Next Due: X hours from now
```

---

## Test Credentials

**Trader Account:**
- Email: trader@example.com
- Password: password

**Admin Account:**
- Email: admin@example.com
- Password: password

---

## Next Steps

1. **Start Backend** (in one terminal):
   ```
   cd backend
   php artisan serve
   ```

2. **Start Frontend** (in another terminal):
   ```
   npm run dev
   ```

3. **Open Browser:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000

4. **Login & Test:**
   - Use trader@example.com / password
   - Navigate through products, sales, reports
   - Everything should work!

---

## Troubleshooting

### Issue: Port 8000 already in use
```powershell
# Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Or use different port
php artisan serve --port=8001
```

### Issue: Database connection error
Check `.env` file has correct database credentials:
```
DB_DATABASE=trader_inventory
DB_USERNAME=root
DB_PASSWORD=your_password
```

### Issue: Class not found errors
```powershell
composer dump-autoload
php artisan config:clear
php artisan cache:clear
```

---

## 🎉 You're Ready!

All Laravel 11 syntax issues have been resolved. The backend is fully Laravel 10 compatible and production-ready!
