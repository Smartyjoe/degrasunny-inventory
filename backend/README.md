# Trader Inventory Management API

A production-ready Laravel backend API for managing inventory, pricing, sales, and profit tracking for traders.

## Features

- ✅ **Authentication**: Laravel Sanctum token-based auth
- ✅ **Product Management**: Full CRUD with pricing configuration
- ✅ **Stock Management**: Daily stock ledger, additions, and manual overrides
- ✅ **Sales Tracking**: Multi-unit sales (bag, cup, bucket) with auto profit calculation
- ✅ **Reports**: Daily, weekly, monthly summaries and product performance
- ✅ **Automated Tasks**: Daily stock carryforward at midnight
- ✅ **Audit Logs**: Complete tracking of all changes
- ✅ **Business Rules**: Strict validation, negative stock prevention, auto-calculations

## Tech Stack

- **Framework**: Laravel 10.x
- **PHP**: 8.2+
- **Database**: MySQL
- **Authentication**: Laravel Sanctum
- **Architecture**: Service + Repository Pattern

## Installation

### 1. Clone and Install Dependencies

```bash
cd backend
composer install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Update `.env` with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=trader_inventory
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Run Migrations and Seeders

```bash
php artisan migrate:fresh --seed
```

This will create all tables and seed sample data including:
- 2 users (admin@example.com / trader@example.com, password: password)
- 5 products (Rice, Beans, Garri, Palm Oil, Groundnut Oil)
- Stock ledgers and additions
- Sample sales data

### 5. Start the Server

```bash
php artisan serve
```

API will be available at: `http://localhost:8000`

### 6. Setup Scheduler (Production)

Add to your crontab:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

Or test manually:

```bash
php artisan stock:carryforward
```

## API Documentation

### Base URL

```
http://localhost:8000/api
```

### Response Format

All responses follow this structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Authentication Endpoints

#### POST /auth/login
Login user and get token.

**Request:**
```json
{
  "email": "trader@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "name": "John Trader",
      "email": "trader@example.com",
      "businessName": "John's Trading Store"
    },
    "token": "1|abc123..."
  }
}
```

#### POST /auth/register
Register new user.

#### POST /auth/logout
Logout current user (requires auth).

#### GET /auth/me
Get current user details (requires auth).

### Product Endpoints

#### GET /products
Get all products with optional filters.

**Query Params:**
- `search`: Search in name/description
- `isActive`: Filter by active status (true/false)
- `lowStock`: Filter low stock items (true/false)

#### POST /products
Create new product.

**Request:**
```json
{
  "name": "Rice (50kg)",
  "description": "Premium quality rice",
  "costPrice": 25000,
  "sellingPrice": 32000,
  "isRetailEnabled": true,
  "cupsPerBag": 200,
  "bucketsPerBag": 20,
  "cupPrice": 200,
  "bucketPrice": 1800,
  "reorderLevel": 20
}
```

#### PUT /products/{id}
Update product.

#### DELETE /products/{id}
Soft delete product (sets is_active to false).

#### PATCH /products/{id}/stock
Update product stock quantity.

### Stock Endpoints

#### GET /stock/daily?date=2024-01-24
Get daily stock ledger for all products.

#### PUT /stock/daily/{id}
Manual stock override.

**Request:**
```json
{
  "openingStock": 100,
  "stockAdded": 20,
  "stockSold": 15,
  "closingStock": 105
}
```

#### POST /stock/add
Add stock to product.

**Request:**
```json
{
  "productId": "1",
  "quantity": 50,
  "costPrice": 25000,
  "supplier": "ABC Suppliers",
  "date": "2024-01-24",
  "notes": "Monthly restocking"
}
```

#### GET /stock/additions
Get all stock additions with filters.

### Sales Endpoints

#### POST /sales
Create new sale.

**Request:**
```json
{
  "productId": "1",
  "unit": "bag",
  "quantity": 5
}
```

Units: `bag`, `cup`, `bucket`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "productId": "1",
    "productName": "Rice (50kg)",
    "unit": "bag",
    "quantity": 5,
    "pricePerUnit": 32000,
    "totalAmount": 160000,
    "profit": 35000,
    "date": "2024-01-24"
  }
}
```

#### GET /sales
Get all sales with optional filters.

**Query Params:**
- `productId`: Filter by product
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)

#### DELETE /sales/{id}
Delete sale and reverse stock.

### Dashboard Endpoints

#### GET /dashboard/stats
Get dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "todaySales": 250000,
    "todayProfit": 45000,
    "todaySalesCount": 12,
    "lowStockCount": 2,
    "totalProducts": 5,
    "activeProducts": 5
  }
}
```

### Report Endpoints

#### GET /reports/daily?date=2024-01-24
Get daily summary report.

#### GET /reports/weekly?weekStart=2024-01-20&weekEnd=2024-01-26
Get weekly summary report.

#### GET /reports/monthly?month=1&year=2024
Get monthly summary report.

#### GET /reports/products
Get product performance report.

**Query Params:**
- `startDate`: Optional start date
- `endDate`: Optional end date

## Business Logic

### Stock Management

1. **Opening Stock**: Automatically carried forward from previous day's closing stock
2. **Closing Stock**: `Opening + Added - Sold`
3. **Negative Stock**: Prevented by validation
4. **Manual Override**: Allowed with audit logging

### Sales & Profit Calculation

1. **Bag Sales**: Direct cost and selling price
2. **Cup Sales**: `(Cost per bag / Cups per bag) × Quantity`
3. **Bucket Sales**: `(Cost per bag / Buckets per bag) × Quantity`
4. **Profit**: `Total Amount - Cost Equivalent`
5. **Stock Deduction**: Converted to bags and deducted from inventory

### Automated Tasks

- **Daily at 00:00**: Stock carryforward runs automatically
- Creates new daily stock ledger for all active products
- Carries forward previous closing stock as opening stock

## Database Schema

### Tables
- `users` - User accounts
- `products` - Product catalog with pricing
- `stock_ledgers` - Daily stock tracking
- `stock_additions` - Purchase/addition records
- `sales` - Sales transactions
- `profit_summaries` - Daily profit aggregates
- `audit_logs` - Change tracking

## Testing

### Test Credentials

```
Admin: admin@example.com / password
Trader: trader@example.com / password
```

### Manual Testing

1. Login to get token
2. Add `Authorization: Bearer {token}` header to all requests
3. Test product creation, stock addition, and sales

### Example cURL

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trader@example.com","password":"password"}'

# Get products (with token)
curl -X GET http://localhost:8000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Integration

Update your frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

The API responses match exactly with the TypeScript interfaces in your React frontend.

## Production Deployment

1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false`
3. Run `php artisan config:cache`
4. Run `php artisan route:cache`
5. Run `php artisan optimize`
6. Setup SSL certificate
7. Configure web server (Nginx/Apache)
8. Setup cron for scheduled tasks
9. Enable database backups

## Troubleshooting

### CORS Issues

Update `config/cors.php`:
```php
'allowed_origins' => [env('SPA_URL', 'http://localhost:5173')],
```

### Token Not Working

Clear cache:
```bash
php artisan config:clear
php artisan cache:clear
```

### Database Connection Failed

Verify MySQL is running and credentials are correct in `.env`.

## Support

For issues or questions, please check the code comments or create an issue.

## License

MIT License
