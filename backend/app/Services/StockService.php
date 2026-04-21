<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockLedger;
use App\Models\StockAddition;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * REFACTORED: Now uses centralized StockLedgerService
 * NEVER creates StockLedger records directly
 */

class StockService
{
    protected StockLedgerService $ledgerService;

    public function __construct(StockLedgerService $ledgerService)
    {
        $this->ledgerService = $ledgerService;
    }

    /**
     * DEPRECATED: Initialize daily stock for a product
     * USE: StockLedgerService::getOrCreateDailyLedger() instead
     */
    public function initializeDailyStock(Product $product, Carbon $date): StockLedger
    {
        // Use updateOrCreate to avoid duplicate entry errors
        $previousDay = $date->copy()->subDay();
        $previousLedger = StockLedger::where('product_id', $product->id)
            ->where('date', $previousDay)
            ->first();

        $openingStock = $previousLedger ? $previousLedger->closing_stock : $product->current_stock;

        return StockLedger::updateOrCreate(
            [
                'product_id' => $product->id,
                'date' => $date,
            ],
            [
                'user_id' => $product->user_id,
                'opening_stock' => $openingStock,
                'stock_added' => 0,
                'stock_sold' => 0,
                'closing_stock' => $openingStock,
            ]
        );
    }

    /**
     * Carry forward closing stock to next day
     * REFACTORED: Uses centralized service
     */
    public function carryForwardStock(): void
    {
        $today = Carbon::today();
        $products = Product::active()->get();

        foreach ($products as $product) {
            // Use centralized service
            $this->ledgerService->getOrCreateDailyLedger($product, $today);
        }
    }

    /**
     * Add stock to product
     * 
     * REFACTORED: Now uses centralized StockLedgerService
     */
    public function addStock(array $data): StockAddition
    {
        return DB::transaction(function () use ($data) {
            $product = Product::findOrFail($data['product_id']);
            $date = Carbon::parse($data['date']);

            // Capture stock before and after for history tracking
            $stockBefore = (float) $product->current_stock;
            $stockAfter = $stockBefore + $data['quantity'];

            // Create stock addition record with stock tracking
            $addition = StockAddition::create([
                'user_id' => auth()->id(),
                'product_id' => $product->id,
                'quantity' => $data['quantity'],
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'cost_price' => $data['cost_price'],
                'supplier' => $data['supplier'] ?? null,
                'date' => $date,
                'notes' => $data['notes'] ?? null,
            ]);

            // Update product current stock
            $product->increment('current_stock', $data['quantity']);

            // Record in ledger (centralized service handles everything)
            $this->ledgerService->recordStockAdded($product, $data['quantity'], $date);

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
     * Update stock addition
     */
    public function updateStockAddition(StockAddition $addition, array $data): StockAddition
    {
        return DB::transaction(function () use ($addition, $data) {
            $product = $addition->product;
            $oldQuantity = $addition->quantity;
            $oldDate = $addition->date;

            // Reverse old stock impact
            $product->decrement('current_stock', $oldQuantity);
            $this->ledgerService->recordStockDeducted($product, $oldQuantity, $oldDate);

            // Apply new values
            $newQuantity = $data['quantity'] ?? $addition->quantity;
            $newDate = isset($data['date']) ? Carbon::parse($data['date']) : $addition->date;

            // Recalculate stock before/after
            $stockBefore = (float) $product->current_stock;
            $stockAfter = $stockBefore + $newQuantity;

            // Update addition record
            $addition->update([
                'quantity' => $newQuantity,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'cost_price' => $data['cost_price'] ?? $addition->cost_price,
                'supplier' => $data['supplier'] ?? $addition->supplier,
                'date' => $newDate,
                'notes' => $data['notes'] ?? $addition->notes,
            ]);

            // Apply new stock
            $product->increment('current_stock', $newQuantity);
            $this->ledgerService->recordStockAdded($product, $newQuantity, $newDate);

            // Update cost price if provided and requested
            if (isset($data['cost_price']) && isset($data['update_cost_price']) && $data['update_cost_price']) {
                $product->update(['cost_price' => $data['cost_price']]);
            }

            // Recalculate ledgers
            $this->ledgerService->recalculateDailyLedger($product, $newDate);
            if ($oldDate->format('Y-m-d') !== $newDate->format('Y-m-d')) {
                $this->ledgerService->recalculateDailyLedger($product, $oldDate);
            }

            // Log the update
            AuditLog::log('updated', 'stock_addition', $addition->id, null, $addition->toArray());

            return $addition->fresh('product');
        });
    }

    /**
     * Update stock after sale
     * 
     * REFACTORED: Now uses centralized StockLedgerService
     */
    public function deductStock(Product $product, float $quantity, Carbon $date): void
    {
        DB::transaction(function () use ($product, $quantity, $date) {
            // Validate sufficient stock
            if ($product->current_stock < $quantity) {
                throw new \Exception('Insufficient stock. Available: ' . $product->current_stock . ' bags');
            }

            // Update product stock
            $product->decrement('current_stock', $quantity);

            // Record in ledger (centralized service handles everything)
            $this->ledgerService->recordStockSold($product, $quantity, $date);
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
     * 
     * This method now correctly handles:
     * - Existing ledger records for the date
     * - Products with no ledger (calculates from transactions)
     * - Products with no transactions on that date
     */
    public function getDailyStock(Carbon $date, Product $product = null): array
    {
        $dateString = $date->toDateString();
        $userId = auth()->id();

        // If single product requested
        if ($product) {
            $ledger = StockLedger::where('user_id', $userId)
                ->where('product_id', $product->id)
                ->where('date', $dateString)
                ->first();

            if ($ledger) {
                return [
                    'id' => (string) $ledger->id,
                    'productId' => (string) $ledger->product_id,
                    'productName' => $product->name,
                    'date' => $dateString,
                    'openingStock' => (float) $ledger->opening_stock,
                    'stockAdded' => (float) $ledger->stock_added,
                    'stockSold' => (float) $ledger->stock_sold,
                    'closingStock' => (float) $ledger->closing_stock,
                ];
            }

            // No ledger - calculate from transactions
            return [
                'productId' => (string) $product->id,
                'productName' => $product->name,
                'date' => $dateString,
            ] + $this->ledgerService->calculateDailyStock($product, $date);
        }

        // Get all products for user
        $products = Product::where('user_id', $userId)
            ->where('is_active', true)
            ->get();

        return $products->map(function ($product) use ($date, $dateString) {
            $ledger = StockLedger::where('user_id', $product->user_id)
                ->where('product_id', $product->id)
                ->where('date', $dateString)
                ->first();

            if ($ledger) {
                return [
                    'id' => (string) $ledger->id,
                    'productId' => (string) $ledger->product_id,
                    'productName' => $product->name,
                    'date' => $dateString,
                    'openingStock' => (float) $ledger->opening_stock,
                    'stockAdded' => (float) $ledger->stock_added,
                    'stockSold' => (float) $ledger->stock_sold,
                    'closingStock' => (float) $ledger->closing_stock,
                ];
            }

            // No ledger exists - calculate from transactions
            $calculated = $this->ledgerService->calculateDailyStock($product, $date);
            return [
                'productId' => (string) $product->id,
                'productName' => $product->name,
                'date' => $dateString,
            ] + $calculated;
        })->toArray();
    }
}
