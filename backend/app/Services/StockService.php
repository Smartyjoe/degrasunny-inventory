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

            // Create stock addition record
            $addition = StockAddition::create([
                'user_id' => auth()->id(),
                'product_id' => $product->id,
                'quantity' => $data['quantity'],
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
     */
    public function getDailyStock(Carbon $date): array
    {
        return StockLedger::with('product')
            ->where('date', $date)
            ->get()
            ->map(function ($ledger) {
                return [
                    'id' => (string) $ledger->id,
                    'productId' => (string) $ledger->product_id,
                    'productName' => $ledger->product ? $ledger->product->name : 'Unknown Product',
                    'date' => $ledger->date->format('Y-m-d'),
                    'openingStock' => (float) $ledger->opening_stock,
                    'stockAdded' => (float) $ledger->stock_added,
                    'stockSold' => (float) $ledger->stock_sold,
                    'closingStock' => (float) $ledger->closing_stock,
                ];
            })
            ->toArray();
    }

    public function updateStockAddition(StockAddition $stockAddition, array $data): StockAddition
    {
        // Enforce same-day edit window (until midnight)
        $additionDate = $stockAddition->created_at->startOfDay();
        $todayDate = now()->startOfDay();

        if (!$additionDate->equalTo($todayDate)) {
            throw new \Exception('Stock additions can only be edited on the same day before midnight.');
        }

        return DB::transaction(function () use ($stockAddition, $data) {
            $product = Product::findOrFail($stockAddition->product_id);
            $oldQuantity = $stockAddition->quantity;
            $newQuantity = $data['quantity'];
            $quantityDiff = $newQuantity - $oldQuantity;
            $date = $stockAddition->date;

            // Update product current stock
            $product->current_stock += $quantityDiff;
            $product->save();

            // Update stock addition
            $stockAddition->update([
                'quantity' => $newQuantity,
                'cost_price' => $data['cost_price'] ?? $stockAddition->cost_price,
                'supplier' => $data['supplier'] ?? $stockAddition->supplier,
                'notes' => $data['notes'] ?? $stockAddition->notes,
            ]);

            // Update stock ledger for the addition date
            $ledger = $this->ledgerService->getOrCreateDailyLedger($product, $date);
            $ledger->stock_added += $quantityDiff;
            $ledger->closing_stock = $ledger->opening_stock + $ledger->stock_added - $ledger->stock_sold;
            $ledger->save();

            // Log the update
            AuditLog::log('updated', 'stock_addition', $stockAddition->id, ['old' => $oldQuantity], ['new' => $newQuantity]);

            return $stockAddition->fresh();
        });
    }

    /**
     * Get stock additions with edit window check
     */
    public function getStockAdditions(array $filters = []): array
    {
        $query = StockAddition::with('product')->orderBy('created_at', 'desc');

        if (isset($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (isset($filters['start_date'])) {
            $query->where('date', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->where('date', '<=', $filters['end_date']);
        }

        return $query->get()->map(function ($addition) {
            $additionDate = $addition->created_at->startOfDay();
            $todayDate = now()->startOfDay();
            $canEdit = $additionDate->equalTo($todayDate);

            return [
                'id' => (string) $addition->id,
                'productId' => (string) $addition->product_id,
                'productName' => $addition->product ? $addition->product->name : 'Unknown Product',
                'quantity' => (float) $addition->quantity,
                'costPrice' => (float) $addition->cost_price,
                'supplier' => $addition->supplier,
                'notes' => $addition->notes,
                'date' => $addition->date->format('Y-m-d'),
                'createdAt' => $addition->created_at->toIso8601String(),
                'canEdit' => $canEdit,
            ];
        })->toArray();
    }
}
