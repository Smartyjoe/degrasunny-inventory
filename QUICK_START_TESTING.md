# 🚀 Quick Start Testing Guide

## Step 1: Run Database Migrations

```bash
cd backend
php artisan migrate
```

**Expected Output:**
```
Migration: 2026_02_07_120000_add_description_and_quantity_precision_to_sales
Migrated:  2026_02_07_120000_add_description_and_quantity_precision_to_sales

Migration: 2026_02_07_120010_update_stock_decimal_precision
Migrated:  2026_02_07_120010_update_stock_decimal_precision
```

---

## Step 2: Test Sale Editing

### Test 2.1: Create Sale with Description
1. Go to **Sales Entry** page
2. Select a product
3. Enter quantity (e.g., 2)
4. Select payment method
5. Add description: "Test sale with description"
6. Click **Record Sale**

**Expected:** 
- ✅ Sale created successfully
- ✅ **Amber edit button** appears on the newly created sale
- ✅ Receipt shows description

### Test 2.2: Edit Sale Within 3 Hours
1. Click the **amber edit icon** on the sale you just created
2. Change quantity to 3
3. Update description: "Updated test sale"
4. Click **Update Sale**

**Expected:**
- ✅ Sale updated successfully
- ✅ Stock recalculated
- ✅ Edit button still visible (within 3 hours)

### Test 2.3: Edit Button Disappears After 3 Hours
**Note:** This will happen automatically - the backend calculates the time difference and returns `canEdit: false` after 3 hours.

---

## Step 3: Test Stock Addition with Decimals

### Test 3.1: Add Stock with Decimal Quantity
1. Go to **Add Stock** page
2. Select a product
3. Enter quantity: **2.5** (half bags allowed!)
4. Enter cost price
5. Click **Add Stock**

**Expected:**
- ✅ Stock added successfully
- ✅ Quantity displays as "2.5" (not "2.50" or "2.5000")
- ✅ **Amber edit button** appears on the newly created stock addition

### Test 3.2: Edit Stock Addition Same Day
1. Click the **amber edit icon** on the stock addition
2. Change quantity to **3.75**
3. Click **Update Stock**

**Expected:**
- ✅ Stock updated successfully
- ✅ Product stock recalculated
- ✅ Edit button still visible (same day)

### Test 3.3: Edit Button Disappears Next Day
**Note:** Test this tomorrow - the edit button should automatically disappear.

---

## Step 4: Test 4-Decimal Precision

### Test 4.1: Daily Stock Page
1. Go to **Daily Stock** page
2. Check the displayed values

**Expected:**
- ✅ Opening stock shows clean decimals (e.g., "10.25" not "10.2500")
- ✅ Stock added shows decimals (e.g., "2.5")
- ✅ Closing stock calculated correctly

### Test 4.2: Database Verification
```sql
-- Check sales table
SELECT quantity, description FROM sales ORDER BY created_at DESC LIMIT 5;

-- Check stock_additions table
SELECT quantity FROM stock_additions ORDER BY created_at DESC LIMIT 5;

-- Check products table
SELECT name, current_stock FROM products;
```

**Expected:**
- ✅ All quantities stored with up to 4 decimal places
- ✅ Descriptions present where added

---

## Step 5: Test Sales Records Page

### Test 5.1: Navigate to Sales Records
1. Click **Sales Records** in sidebar
2. Page should load with summary cards

**Expected:**
- ✅ Total Sales displayed
- ✅ Total Profit displayed
- ✅ Transaction count displayed
- ✅ Items Sold displayed

### Test 5.2: Filter Sales
1. Set **Start Date** to one week ago
2. Set **End Date** to today
3. Type product name in **Search** box
4. Select a **Payment Method** filter

**Expected:**
- ✅ Table filters in real-time
- ✅ Summary cards update
- ✅ All sales details visible (including descriptions)

### Test 5.3: Edit Sale from Records Page
1. Find a sale created within the last 3 hours
2. Click the **amber edit icon**
3. Make changes
4. Click **Update Sale**

**Expected:**
- ✅ Modal opens with pre-filled data
- ✅ Sale updates successfully
- ✅ Table refreshes with new data

### Test 5.4: Export to CSV
1. Click **Export CSV** button
2. Check downloaded file

**Expected:**
- ✅ CSV file downloads
- ✅ Contains all filtered sales
- ✅ Includes all columns (date, product, quantity, price, description, etc.)

---

## Step 6: Test Receipt with Description

1. Create a sale with description
2. Click the **blue receipt icon**
3. Check the receipt modal

**Expected:**
- ✅ Description appears in italics below item details
- ✅ Labeled as "Note: [description]"

---

## 🐛 Troubleshooting

### Edit Button Not Appearing on New Sales
**Check:**
- Backend returns `canEdit: true` in create response
- Frontend displays sale with canEdit property
- Browser console for errors

**Fix:** Clear browser cache and refresh

### Decimal Input Not Accepting Fractional Values
**Check:**
- Input has `step="0.01"` attribute
- Input type is `number`
- Min value is `0.01`

### Migration Errors
**Common Issues:**
- Database connection not configured
- Tables already exist (run `php artisan migrate:rollback` first)
- Permission issues

**Fix:**
```bash
# Check database connection
php artisan migrate:status

# Rollback if needed
php artisan migrate:rollback

# Re-run migrations
php artisan migrate
```

### Edit Button Appears on Old Sales/Stock
**This is a backend logic issue. Check:**
```php
// In SalesService.php
$hoursDiff = $sale->created_at->diffInHours(now());
$canEdit = $hoursDiff < 3;

// In StockService.php
$additionDate = $stockAddition->created_at->startOfDay();
$todayDate = now()->startOfDay();
$canEdit = $additionDate->equalTo($todayDate);
```

---

## ✅ Complete Testing Checklist

- [ ] Migrations run successfully
- [ ] Create sale with description
- [ ] Edit sale within 3 hours
- [ ] Edit button appears on new sales
- [ ] Add stock with decimal quantity (e.g., 2.5)
- [ ] Edit stock addition same day
- [ ] Edit button appears on new stock additions
- [ ] Daily Stock shows 4-decimal formatting
- [ ] Sales Records page loads
- [ ] Date filtering works
- [ ] Search filtering works
- [ ] Payment filter works
- [ ] CSV export downloads
- [ ] Edit sale from Sales Records page
- [ ] Receipt displays description
- [ ] Verify database has 4-decimal precision

---

## 📞 Support

If you encounter any issues:
1. Check browser console for JavaScript errors
2. Check Laravel logs: `backend/storage/logs/laravel.log`
3. Verify API responses in Network tab
4. Ensure migrations ran successfully

---

**Happy Testing! 🎉**
