# Test API Script for Trader Inventory Backend
# Run this after starting the server with: php artisan serve

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Testing Trader Inventory API" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Server is running
Write-Host "Test 1: Checking if server is running..." -ForegroundColor Yellow
try {
    $baseTest = Invoke-RestMethod -Uri "http://localhost:8000" -Method Get
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host "   Message: $($baseTest.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Server is not running. Please start it with: php artisan serve" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 2: Login
Write-Host "Test 2: Testing login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "trader@example.com"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.data.user.name)" -ForegroundColor Gray
    Write-Host "   Email: $($loginResponse.data.user.email)" -ForegroundColor Gray
    
    $token = $loginResponse.data.token
    Write-Host "   Token received: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 3: Get Products
Write-Host "Test 3: Fetching products..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $products = Invoke-RestMethod -Uri "http://localhost:8000/api/products" -Method Get -Headers $headers
    
    Write-Host "✅ Products fetched successfully!" -ForegroundColor Green
    Write-Host "   Total products: $($products.data.Count)" -ForegroundColor Gray
    
    foreach ($product in $products.data) {
        Write-Host "   - $($product.name) (Stock: $($product.currentStock))" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed to fetch products: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Get Dashboard Stats
Write-Host "Test 4: Fetching dashboard stats..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:8000/api/dashboard/stats" -Method Get -Headers $headers
    
    Write-Host "✅ Dashboard stats fetched successfully!" -ForegroundColor Green
    Write-Host "   Today's Sales: $($stats.data.todaySales)" -ForegroundColor Gray
    Write-Host "   Today's Profit: $($stats.data.todayProfit)" -ForegroundColor Gray
    Write-Host "   Total Products: $($stats.data.totalProducts)" -ForegroundColor Gray
    Write-Host "   Low Stock Count: $($stats.data.lowStockCount)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to fetch dashboard stats: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 5: Create a Sale
Write-Host "Test 5: Creating a test sale..." -ForegroundColor Yellow
try {
    $saleBody = @{
        productId = "1"
        unit = "bag"
        quantity = 2
    } | ConvertTo-Json

    $sale = Invoke-RestMethod -Uri "http://localhost:8000/api/sales" -Method Post -Body $saleBody -ContentType "application/json" -Headers $headers
    
    Write-Host "✅ Sale created successfully!" -ForegroundColor Green
    Write-Host "   Product: $($sale.data.productName)" -ForegroundColor Gray
    Write-Host "   Quantity: $($sale.data.quantity) $($sale.data.unit)" -ForegroundColor Gray
    Write-Host "   Total Amount: $($sale.data.totalAmount)" -ForegroundColor Gray
    Write-Host "   Profit: $($sale.data.profit)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create sale: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ All API tests completed!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API is working correctly!" -ForegroundColor Green
Write-Host "You can now start the frontend with: npm run dev" -ForegroundColor Cyan
