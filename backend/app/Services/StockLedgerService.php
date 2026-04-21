<?php

namespace App\Services;

use App\Models\StockLedger;
use App\Models\Product;
use App\Models\Sale;
use App\Models\StockAddition;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * CRITICAL: Centralized Stock Ledger Service
 * 
 * This is the ONLY place where stock ledgers are created.
 * All other services MUST use this service to interact with ledgers.
 * 
 * RULES:
 * - One ledger per (user_id, product_id, date)
 * - Dates are DATE only, never timestamps
 * - All operations are transactional
 * - Updates only, never duplicate creates
 */
class StockLedgerService
{
    /**
     * Get or create daily stock ledger (ATOMIC OPERATION)
     * 
     * This is the ONLY method that creates stock ledgers.
     * Uses firstOrCreate which is atomic at database level.
     * 
     * @param Product $product
     * @param Carbon $date
     * @return StockLedger
     */
    public function getOrCreateDailyLedger(Product $product, Carbon $date): StockLedger
    {
        // CRITICAL: Convert to date string (no time component)
        $dateString = $date->toDateString();
        
        // ATOMIC: firstOrCreate is database-atomic
        return StockLedger::firstOrCreate(
            [
                'user_id' => $product->user_id,
                'product_id' => $product->id,
                'date' => $dateString,
            ],
            [
                'opening_stock' => $this->getPreviousClosingStock($product, $date),
                'stock_added' => 0,
                'stock_sold' => 0,
                'closing_stock' => $this->getPreviousClosingStock($product, $date),
                'manually_edited' => false,
            ]
        );
    }

    /**
     * Get previous day's closing stock
     * 
     * @param Product $product
     * @param Carbon $date
     * @return float
     */
    private function getPreviousClosingStock(Product $product, Carbon $date): float
    {
        $previousDate = $date->copy()->subDay()->toDateString();
        
        $previousLedger = StockLedger::where('user_id', $product->user_id)
            ->where('product_id', $product->id)
            ->where('date', $previousDate)
            ->first();

        if ($previousLedger) {
            return (float) $previousLedger->closing_stock;
        }

        // No previous ledger exists - for historical dates this is acceptable as 0
        // For today, use product's current stock as starting point
        return (float) $product->current_stock;
    }

    /**
     * Record stock sold (called by sales)
     * 
     * @param Product $product
     * @param float $quantity
     * @param Carbon $date
     * @return StockLedger
     */
    public function recordStockSold(Product $product, float $quantity, Carbon $date): StockLedger
    {
        return DB::transaction(function () use ($product, $quantity, $date) {
            // Get or create ledger (atomic)
            $ledger = $this->getOrCreateDailyLedger($product, $date);

            // Update stock sold
            $ledger->stock_sold += $quantity;
            
            // Recalculate closing stock
            $ledger->closing_stock = $ledger->opening_stock + $ledger->stock_added - $ledger->stock_sold;
            
            // Save
            $ledger->save();

            return $ledger;
        });
    }

    /**
     * Record stock added (called by stock additions)
     * 
     * @param Product $product
     * @param float $quantity
     * @param Carbon $date
     * @return StockLedger
     */
    public function recordStockAdded(Product $product, float $quantity, Carbon $date): StockLedger
    {
        return DB::transaction(function () use ($product, $quantity, $date) {
            // Get or create ledger (atomic)
            $ledger = $this->getOrCreateDailyLedger($product, $date);

            // Update stock added
            $ledger->stock_added += $quantity;
            
            // Recalculate closing stock
            $ledger->closing_stock = $ledger->opening_stock + $ledger->stock_added - $ledger->stock_sold;
            
            // Save
            $ledger->save();

            return $ledger;
        });
    }

    /**
     * Get ledger for a specific date (read-only)
     * 
     * @param Product $product
     * @param Carbon $date
     * @return StockLedger|null
     */
    public function getLedger(Product $product, Carbon $date): ?StockLedger
    {
        return StockLedger::where('user_id', $product->user_id)
            ->where('product_id', $product->id)
            ->where('date', $date->toDateString())
            ->first();
    }

    /**
     * Validate closing stock calculation
     * 
     * @param StockLedger $ledger
     * @return bool
     */
    public function validateClosingStock(StockLedger $ledger): bool
    {
        $expected = $ledger->opening_stock + $ledger->stock_added - $ledger->stock_sold;
        return abs($ledger->closing_stock - $expected) < 0.01; // Float comparison tolerance
    }

    /**
     * Get or calculate daily stock from transactions
     * 
     * When no ledger exists, this calculates stock values on-the-fly
     * from StockAddition and Sale records.
     * 
     * @param Product $product
     * @param Carbon $date
     * @return array{openingStock: float, stockAdded: float, stockSold: float, closingStock: float}
     */
    public function calculateDailyStock(Product $product, Carbon $date): array
    {
        $dateString = $date->toDateString();

        // Get opening stock from yesterday's closing
        $openingStock = $this->getPreviousClosingStock($product, $date);

        // Sum stock additions for this date
        $stockAdded = (float) StockAddition::where('user_id', $product->user_id)
            ->where('product_id', $product->id)
            ->whereDate('date', $dateString)
            ->sum('quantity');

        // Calculate stock sold from sales records
        $sales = Sale::where('user_id', $product->user_id)
            ->where('product_id', $product->id)
            ->whereDate('date', $dateString)
            ->get();

        $stockSold = (float) $sales->sum(function ($sale) {
            return (float) ($sale->quantity_in_bags ?? $sale->quantity);
        });

        $closingStock = $openingStock + $stockAdded - $stockSold;

        return [
            'openingStock' => $openingStock,
            'stockAdded' => $stockAdded,
            'stockSold' => $stockSold,
            'closingStock' => $closingStock,
        ];
    }
}
