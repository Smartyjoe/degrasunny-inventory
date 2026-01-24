<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockLedger;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Centralized Stock Ledger Management Service
 * 
 * CRITICAL RULES:
 * 1. Exactly ONE ledger per (product_id, date) combination
 * 2. This is the ONLY place that creates stock ledgers
 * 3. All other services MUST use getOrCreateDailyLedger()
 * 4. Ledgers are created once, then only updated
 * 5. Date is DATE-only, never timestamp
 */
class StockLedgerService
{
    /**
     * Get or create a daily ledger for a product and date
     * This is the ONLY authorized method to create ledgers
     * 
     * @param int $productId
     * @param string $dateString Format: Y-m-d
     * @return StockLedger
     */
    public function getOrCreateDailyLedger(int $productId, string $dateString): StockLedger
    {
        // Ensure date is string format Y-m-d (no time component)
        $dateString = Carbon::parse($dateString)->toDateString();
        
        // Use firstOrCreate with proper attribute separation
        // This is atomic at database level and prevents race conditions
        return StockLedger::firstOrCreate(
            // Search criteria (unique constraint fields)
            [
                'product_id' => $productId,
                'date' => $dateString,
            ],
            // Default values for new record only
            [
                'opening_stock' => $this->calculateOpeningStock($productId, $dateString),
                'stock_added' => 0,
                'stock_sold' => 0,
                'closing_stock' => $this->calculateOpeningStock($productId, $dateString),
                'manually_edited' => false,
            ]
        );
    }

    /**
     * Calculate opening stock for a date
     * Uses previous day's closing stock, or current product stock if no history
     * 
     * @param int $productId
     * @param string $dateString
     * @return float
     */
    protected function calculateOpeningStock(int $productId, string $dateString): float
    {
        // Get previous day's closing stock
        $previousDate = Carbon::parse($dateString)->subDay()->toDateString();
        
        $previousLedger = StockLedger::where('product_id', $productId)
            ->where('date', $previousDate)
            ->first();
        
        if ($previousLedger) {
            return (float) $previousLedger->closing_stock;
        }
        
        // No previous ledger - use current product stock
        $product = Product::find($productId);
        return $product ? (float) $product->current_stock : 0;
    }

    /**
     * Update stock added and recalculate closing stock
     * 
     * @param StockLedger $ledger
     * @param float $quantityAdded
     * @return void
     */
    public function addStock(StockLedger $ledger, float $quantityAdded): void
    {
        DB::transaction(function () use ($ledger, $quantityAdded) {
            $ledger->stock_added += $quantityAdded;
            $ledger->closing_stock = $this->calculateClosingStock($ledger);
            $ledger->save();
        });
    }

    /**
     * Update stock sold and recalculate closing stock
     * 
     * @param StockLedger $ledger
     * @param float $quantitySold
     * @return void
     */
    public function deductStock(StockLedger $ledger, float $quantitySold): void
    {
        DB::transaction(function () use ($ledger, $quantitySold) {
            $ledger->stock_sold += $quantitySold;
            $ledger->closing_stock = $this->calculateClosingStock($ledger);
            $ledger->save();
        });
    }

    /**
     * Reverse stock deduction (for sale deletion)
     * 
     * @param StockLedger $ledger
     * @param float $quantityToRestore
     * @return void
     */
    public function restoreStock(StockLedger $ledger, float $quantityToRestore): void
    {
        DB::transaction(function () use ($ledger, $quantityToRestore) {
            $ledger->stock_sold -= $quantityToRestore;
            
            // Prevent negative stock_sold
            if ($ledger->stock_sold < 0) {
                $ledger->stock_sold = 0;
            }
            
            $ledger->closing_stock = $this->calculateClosingStock($ledger);
            $ledger->save();
        });
    }

    /**
     * Calculate closing stock using the formula
     * closing = opening + added - sold
     * 
     * @param StockLedger $ledger
     * @return float
     */
    protected function calculateClosingStock(StockLedger $ledger): float
    {
        return $ledger->opening_stock + $ledger->stock_added - $ledger->stock_sold;
    }

    /**
     * Initialize ledgers for all active products for a given date
     * Used by daily cron job
     * 
     * @param Carbon $date
     * @return int Number of ledgers created
     */
    public function initializeDailyLedgersForAllProducts(Carbon $date): int
    {
        $dateString = $date->toDateString();
        $products = Product::where('is_active', true)->get();
        $created = 0;

        foreach ($products as $product) {
            try {
                $this->getOrCreateDailyLedger($product->id, $dateString);
                $created++;
            } catch (\Exception $e) {
                // Log but continue with other products
                Log::error("Failed to initialize ledger for product {$product->id}: {$e->getMessage()}");
            }
        }

        return $created;
    }

    /**
     * Get daily stock data for all products on a date
     * 
     * @param string $dateString
     * @return array
     */
    public function getDailyStockForDate(string $dateString): array
    {
        $dateString = Carbon::parse($dateString)->toDateString();
        
        return StockLedger::with('product')
            ->where('date', $dateString)
            ->get()
            ->map(function ($ledger) {
                return [
                    'id' => (string) $ledger->id,
                    'productId' => (string) $ledger->product_id,
                    'productName' => $ledger->product ? $ledger->product->name : 'Unknown Product',
                    'date' => $ledger->date,
                    'openingStock' => (float) $ledger->opening_stock,
                    'stockAdded' => (float) $ledger->stock_added,
                    'stockSold' => (float) $ledger->stock_sold,
                    'closingStock' => (float) $ledger->closing_stock,
                ];
            })
            ->toArray();
    }

    /**
     * Validate that closing stock formula is maintained
     * 
     * @param StockLedger $ledger
     * @throws \Exception
     */
    public function validateLedgerIntegrity(StockLedger $ledger): void
    {
        $calculated = $this->calculateClosingStock($ledger);
        
        if (abs($calculated - $ledger->closing_stock) > 0.01) {
            throw new \Exception(
                "Ledger integrity violation for product {$ledger->product_id} on {$ledger->date}. " .
                "Expected closing: {$calculated}, Actual: {$ledger->closing_stock}"
            );
        }
    }
}
