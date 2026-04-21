# Fixing "Call to undefined method recalculateDailyLedger" Error

## Root Cause Analysis

Based on a thorough review of the codebase and the provided error logs, I have identified two overlapping issues causing the errors when editing stock and sales.

### 1. The Deployment / Sync Issue (The Immediate Error)
The error log specifically states:
`Error: Call to undefined method App\Services\StockLedgerService::recalculateDailyLedger() at /home/propxtur/crypto.smatatech.com.ng/app/Services/SalesService.php:229`

This error means that while the `recalculateDailyLedger` method **does exist** in your local codebase within `app/Services/StockLedgerService.php`, it **does not exist on the production server**. 
This usually happens when you upload or push updates to `SalesService.php` and `StockService.php` (where you started calling this new centralized method) but missed uploading the updated `StockLedgerService.php`, or the server failed to reflect the change.

### 2. A Hidden Logic Bug in Ledger Recalculation
While investigating the missing method, I discovered a **critical logic bug** inside the `recalculateDailyLedger` method itself. If the production server *had* run this method, it would have severely corrupted your stock ledgers. 

The original code in `StockLedgerService.php` calculated total stock sold like this:
```php
$stockSold = $sales->sum(function ($sale) {
    return (float) ($sale->quantity_in_bags ?? $sale->quantity);
});
```
Because the `Sale` model does not have a `quantity_in_bags` attribute, this ALWAYS fell back to `$sale->quantity`. 
**Why this is dangerous:** If a user sells 50 *cups*, `$sale->quantity` is `50`. The ledger would mistakenly deduct **50 entire bags** from `closing_stock` instead of the correct fractional amount of a bag!

---

## Step-by-Step Fixes

I have proactively fixed the logic bug in your local codebase. You now need to deploy the fixed codebase to your production server.

### Step 1: Review Local Fixes Applied
I have updated `backend/app/Services/StockLedgerService.php` to properly inject and use the `PricingService`. It now correctly converts sales of "cups" and "buckets" into their exact fractional bag equivalents during ledger recalculations:

```php
// In StockLedgerService.php
public function __construct(protected PricingService $pricingService) {}

// ... inside recalculation logic:
$stockSold = $sales->sum(function ($sale) use ($product) {
    return $this->pricingService->convertToBags($product, $sale->unit, $sale->quantity);
});
```

### Step 2: Deploy the Fixes to Production
To resolve the `undefined method` error and apply the critical logic fix, you must deploy the updated files to your live server.

**Option A (Using Git/Terminal):**
1. Commit the changes made to `StockLedgerService.php`.
2. Pull the latest code onto your live server (`/home/propxtur/crypto.smatatech.com.ng`).
3. If applicable, restart your queue workers or PHP service:
   ```bash
   php artisan optimize:clear
   ```

**Option B (Manual FTP Upload):**
Upload the following modified file to your live server, ensuring it completely overwrites the existing file:
*   `app/Services/StockLedgerService.php`

### Step 3: Verify the Fix
### 4. Silent Failures when Updating Stock
I found that updating stock was failing "silently" because:
- **Missing Date:** The frontend was not sending the `date` field during updates, but the backend `StockAdditionRequest` requires it. This triggered a 422 Validation Error.
- **Hidden Errors:** The `api.ts` service was configured to suppress toasts for 422 errors, assuming the component would show them. However, since `date` isn't a field you manually edit, there was no place to show the error, making it appear as if "nothing happened".
- **Total Cost Sync:** The `total_cost` was only calculated on creation, so updating quantity didn't update the total cost in the database.

**Fixes Applied:**
- Updated `StockAdditionPage.tsx` to correctly pass the original date during updates.
- Modified `api.ts` to show a toast for 422 errors if they occur.
- Updated `StockAddition.php` model to recalculate `total_cost` whenever the record is saved.
- Fixed a bug in `StockAdditionPage.tsx` and `SalesEntryPage.tsx` where the "Edit" button logic only ran once on load (instead of when data arrived).

---

## Final Deployment Steps
1. **Frontend:** Rebuild and deploy your frontend to ensure the `date` is sent and `useEffect` hooks work correctly.
2. **Backend:** Ensure you have updated `app/Models/StockAddition.php` and `app/Services/StockLedgerService.php`.
3. **Cache:** Run `php artisan optimize:clear` on the server.
