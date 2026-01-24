# API Testing Guide

## Quick Test Checklist

### 1. Authentication Flow ✓

```bash
# Register new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "business_name": "Test Store"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trader@example.com",
    "password": "password"
  }'

# Save the token from response
export TOKEN="your_token_here"

# Get current user
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Logout
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Product Management ✓

```bash
# Get all products
curl -X GET http://localhost:8000/api/products \
  -H "Authorization: Bearer $TOKEN"

# Get products with filters
curl -X GET "http://localhost:8000/api/products?search=rice&isActive=true" \
  -H "Authorization: Bearer $TOKEN"

# Get low stock products
curl -X GET "http://localhost:8000/api/products?lowStock=true" \
  -H "Authorization: Bearer $TOKEN"

# Create product
curl -X POST http://localhost:8000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test description",
    "costPrice": 10000,
    "sellingPrice": 15000,
    "isRetailEnabled": true,
    "cupsPerBag": 100,
    "bucketsPerBag": 10,
    "cupPrice": 180,
    "bucketPrice": 1600,
    "reorderLevel": 10
  }'

# Update product (replace {id} with actual product ID)
curl -X PUT http://localhost:8000/api/products/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product Name",
    "sellingPrice": 16000,
    "reorderLevel": 15
  }'

# Get single product
curl -X GET http://localhost:8000/api/products/1 \
  -H "Authorization: Bearer $TOKEN"

# Delete product
curl -X DELETE http://localhost:8000/api/products/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Stock Management ✓

```bash
# Get today's stock
curl -X GET "http://localhost:8000/api/stock/daily?date=2024-01-24" \
  -H "Authorization: Bearer $TOKEN"

# Add stock
curl -X POST http://localhost:8000/api/stock/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "1",
    "quantity": 50,
    "costPrice": 25000,
    "supplier": "ABC Suppliers Ltd",
    "date": "2024-01-24",
    "notes": "Monthly restock"
  }'

# Get stock additions
curl -X GET http://localhost:8000/api/stock/additions \
  -H "Authorization: Bearer $TOKEN"

# Get stock additions for specific product
curl -X GET "http://localhost:8000/api/stock/additions?productId=1" \
  -H "Authorization: Bearer $TOKEN"

# Manual stock override
curl -X PUT http://localhost:8000/api/stock/daily/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "openingStock": 100,
    "stockAdded": 50,
    "stockSold": 20,
    "closingStock": 130
  }'
```

### 4. Sales Management ✓

```bash
# Create sale (bag)
curl -X POST http://localhost:8000/api/sales \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "1",
    "unit": "bag",
    "quantity": 5
  }'

# Create sale (cup)
curl -X POST http://localhost:8000/api/sales \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "1",
    "unit": "cup",
    "quantity": 50
  }'

# Create sale (bucket)
curl -X POST http://localhost:8000/api/sales \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "1",
    "unit": "bucket",
    "quantity": 10
  }'

# Get all sales
curl -X GET http://localhost:8000/api/sales \
  -H "Authorization: Bearer $TOKEN"

# Get sales with filters
curl -X GET "http://localhost:8000/api/sales?productId=1&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $TOKEN"

# Get single sale
curl -X GET http://localhost:8000/api/sales/1 \
  -H "Authorization: Bearer $TOKEN"

# Delete sale
curl -X DELETE http://localhost:8000/api/sales/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Dashboard ✓

```bash
# Get dashboard stats
curl -X GET http://localhost:8000/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Reports ✓

```bash
# Get daily report
curl -X GET "http://localhost:8000/api/reports/daily?date=2024-01-24" \
  -H "Authorization: Bearer $TOKEN"

# Get weekly report
curl -X GET "http://localhost:8000/api/reports/weekly?weekStart=2024-01-20&weekEnd=2024-01-26" \
  -H "Authorization: Bearer $TOKEN"

# Get monthly report
curl -X GET "http://localhost:8000/api/reports/monthly?month=1&year=2024" \
  -H "Authorization: Bearer $TOKEN"

# Get product performance
curl -X GET http://localhost:8000/api/reports/products \
  -H "Authorization: Bearer $TOKEN"

# Get product performance with date range
curl -X GET "http://localhost:8000/api/reports/products?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $TOKEN"
```

## Business Logic Tests

### Test 1: Negative Stock Prevention ✓

```bash
# Try to sell more than available stock (should fail)
curl -X POST http://localhost:8000/api/sales \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "1",
    "unit": "bag",
    "quantity": 99999
  }'

# Expected: Error message "Insufficient stock"
```

### Test 2: Profit Calculation ✓

```bash
# Create a sale and verify profit calculation
# If cost_price = 25000, selling_price = 32000
# Profit per bag = 7000
# For 5 bags: total_amount = 160000, profit = 35000

curl -X POST http://localhost:8000/api/sales \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "1",
    "unit": "bag",
    "quantity": 5
  }'

# Verify response has correct profit calculation
```

### Test 3: Retail Unit Validation ✓

```bash
# Try to sell cups for a product without retail enabled (should fail)
curl -X POST http://localhost:8000/api/sales \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "5",
    "unit": "cup",
    "quantity": 10
  }'

# Expected: Error "Retail sales are not enabled for this product"
```

### Test 4: Stock Carryforward ✓

```bash
# Test the scheduled command
cd backend
php artisan stock:carryforward

# Verify that today's opening stock = yesterday's closing stock
curl -X GET "http://localhost:8000/api/stock/daily?date=$(date +%Y-%m-%d)" \
  -H "Authorization: Bearer $TOKEN"
```

### Test 5: Sale Deletion Reverses Stock ✓

```bash
# 1. Check current stock
curl -X GET http://localhost:8000/api/products/1 \
  -H "Authorization: Bearer $TOKEN"

# 2. Create a sale
curl -X POST http://localhost:8000/api/sales \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "1",
    "unit": "bag",
    "quantity": 2
  }'

# 3. Check stock decreased by 2
curl -X GET http://localhost:8000/api/products/1 \
  -H "Authorization: Bearer $TOKEN"

# 4. Delete the sale (get sale ID from step 2)
curl -X DELETE http://localhost:8000/api/sales/{sale_id} \
  -H "Authorization: Bearer $TOKEN"

# 5. Verify stock is restored
curl -X GET http://localhost:8000/api/products/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Test 6: Closing Stock Formula ✓

```bash
# Verify: closing_stock = opening_stock + stock_added - stock_sold

# Add stock
curl -X POST http://localhost:8000/api/stock/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "1",
    "quantity": 20,
    "costPrice": 25000,
    "date": "2024-01-24"
  }'

# Make a sale
curl -X POST http://localhost:8000/api/sales \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "1",
    "unit": "bag",
    "quantity": 5
  }'

# Check daily stock ledger
curl -X GET "http://localhost:8000/api/stock/daily?date=2024-01-24" \
  -H "Authorization: Bearer $TOKEN"

# Verify the formula
```

## Postman Collection

Import this JSON into Postman for easier testing:

```json
{
  "info": {
    "name": "Trader Inventory API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

## Frontend Integration Testing

1. **Start Backend:**
```bash
cd backend
php artisan serve
```

2. **Start Frontend:**
```bash
cd ..
npm run dev
```

3. **Test Flow:**
   - Open `http://localhost:5173`
   - Login with `trader@example.com` / `password`
   - Navigate to Products page
   - Create a new product
   - Add stock
   - Make a sale
   - Check dashboard updates
   - View reports

## Performance Testing

### Load Test with Apache Bench

```bash
# Test authentication endpoint
ab -n 1000 -c 10 -p login.json -T application/json \
  http://localhost:8000/api/auth/login

# Test product listing
ab -n 1000 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/products
```

## Common Issues

### Issue: 401 Unauthorized

**Solution:** Token might be expired or invalid. Login again.

### Issue: 422 Validation Error

**Solution:** Check request body matches expected format.

### Issue: 500 Server Error

**Solution:** Check Laravel logs at `backend/storage/logs/laravel.log`

### Issue: CORS Error

**Solution:** Verify `SPA_URL` in `.env` matches your frontend URL

## Test Results Checklist

- [ ] User registration works
- [ ] User login returns valid token
- [ ] Token authentication works for protected routes
- [ ] Products can be created, read, updated, deleted
- [ ] Stock additions update product stock
- [ ] Sales deduct stock correctly
- [ ] Profit calculations are accurate
- [ ] Negative stock is prevented
- [ ] Retail units validate properly
- [ ] Daily stock carryforward works
- [ ] Sale deletion reverses stock
- [ ] Dashboard stats are accurate
- [ ] Reports generate correctly
- [ ] Frontend connects to backend
- [ ] All CRUD operations work through frontend

## Success Criteria

✅ All business rules enforced
✅ No negative stock allowed
✅ Profit auto-calculated correctly
✅ Stock carryforward automated
✅ API responses match frontend types
✅ Authentication secure
✅ Validation comprehensive
✅ Frontend and backend in sync

## Next Steps

Once all tests pass:
1. Deploy to production server
2. Setup SSL certificate
3. Configure production database
4. Setup automated backups
5. Monitor logs and performance
