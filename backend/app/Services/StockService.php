<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockLedger;
use App\Models\StockAddition;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StockService
{
    public function __construct(
        protected StockLedgerService $ledgerService
    ) {}

    /**
     * Carry forward closing stock to next day
     * Used by scheduled task
     */
    public function carryForwardStock(): void
    {
        $today = Carbon::today();
        $this->ledgerService->initializeDailyLedgersForAllProducts($today);
    }

    /**
     * Add stock to product
     */
    public function addStock(array $data): StockAddition
    {
        return DB::transaction(function () use ($data) {
            $product = Product::findOrFail($data['product_id']);
            $dateString = Carbon::parse($data['date'])->toDateString();

            // Create stock addition record
            $addition = StockAddition::create([
                'product_id' => $product->id,
                'quantity' => $data['quantity'],
                'cost_price' => $data['cost_price'],
                'supplier' => $data['supplier'] ?? null,
                'date' => $dateString,
                'notes' => $data['notes'] ?? null,
            ]);

            // Update product current stock
            $product->increment('current_stock', $data['quantity']);

            // Get or create daily stock ledger (centralized, no duplicates)
            $ledger = $this->ledgerService->getOrCreateDailyLedger($product->id, $dateString);
            
            // Update stock added and recalculate closing
            $this->ledgerService->addStock($ledger, $data['quantity']);

            // Update cost price if provided
            if (isset($data['update_cost_price']) && $data['update_cost_price']) {
                $product->update(['cost_price' => $data['cost_price']]);
            }

            // Log the action
            AuditLog::log('created', 'stock_addition', $addition->id, null, $addition->toArray());

            return $addition;
        });
    }

    /**
     * Update stock after sale
     */
    public function deductStock(Product $product, float $quantity, string $dateString): void
    {
        DB::transaction(function () use ($product, $quantity, $dateString) {
            // Check if sufficient stock
            if ($product->current_stock < $quantity) {
                throw new \Exception('Insufficient stock. Available: ' . $product->current_stock . ' bags');
            }

            // Update product stock
            $product->decrement('current_stock', $quantity);

            // Get or create daily ledger (centralized, no duplicates)
            $ledger = $this->ledgerService->getOrCreateDailyLedger($product->id, $dateString);
            
            // Update stock sold and recalculate closing
            $this->ledgerService->deductStock($ledger, $quantity);
        });
    }

    /**
     * Restore stock after sale deletion
     */
    public function restoreStock(Product $product, float $quantity, string $dateString): void
    {
        DB::transaction(function () use ($product, $quantity, $dateString) {
            // Restore product stock
            $product->increment('current_stock', $quantity);

            // Get or create daily ledger
            $ledger = $this->ledgerService->getOrCreateDailyLedger($product->id, $dateString);
            
            // Restore stock (decrease stock_sold)
            $this->ledgerService->restoreStock($ledger, $quantity);
        });
    }

    /**
     * Manual stock override
     */
    public function overrideStock(StockLedger $ledger, array $data): StockLedger
    {
        return DB::transaction(function () use ($ledger, $data) {
            $oldValue = $ledger->toArray();

            $ledger->update([
                'opening_stock' => $data['opening_stock'] ?? $ledger->opening_stock,
                'stock_added' => $data['stock_added'] ?? $ledger->stock_added,
                'stock_sold' => $data['stock_sold'] ?? $ledger->stock_sold,
                'closing_stock' => $data['closing_stock'] ?? $ledger->closing_stock,
                'manually_edited' => true,
            ]);

            // Update product current stock to match ledger
            $product = $ledger->product;
            $product->update(['current_stock' => $ledger->closing_stock]);

            // Log the override
            AuditLog::log('updated', 'stock_ledger', $ledger->id, $oldValue, $ledger->toArray());

            return $ledger;
        });
    }

    /**
     * Validate stock availability for sale
     */
    public function validateStockAvailability(Product $product, float $requiredQuantity): void
    {
        if ($product->current_stock < $requiredQuantity) {
            throw new \Exception(
                "Insufficient stock for {$product->name}. " .
                "Required: {$requiredQuantity} bags, Available: {$product->current_stock} bags"
            );
        }
    }

    /**
     * Get daily stock for date
     */
    public function getDailyStock(string $dateString): array
    {
        return $this->ledgerService->getDailyStockForDate($dateString);
    }
}
