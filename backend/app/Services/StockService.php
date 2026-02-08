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
        return $this->ledgerService->getOrCreateDailyLedger($product, $date);
    }

    /**
     * Recalculate daily ledger for date
     */
    public function recalculateDailyLedger(Product $product, Carbon $date): StockLedger
    {
        return $this->ledgerService->recalculateDailyLedger($product, $date);
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

            // Recalculate ledger for the date based on transactions
            $this->ledgerService->recalculateDailyLedger($product, $date);

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

            // Recalculate ledger for the sale date based on transactions
            $this->ledgerService->recalculateDailyLedger($product, $date);
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
                $stockSoldDisplay = null;

                if ($ledger->product) {
                    $retailSales = $ledger->product->sales()
                        ->whereDate('date', $ledger->date->format('Y-m-d'))
                        ->where('unit', '!=', 'bag')
                        ->get();

                    if ($retailSales->isNotEmpty()) {
                        $grouped = $retailSales->groupBy('unit')->map(function ($sales, $unit) use ($ledger) {
                            $totalQty = $sales->sum('quantity');
                            return $ledger->product->formatRetailUnit($unit, (float) $totalQty);
                        });

                        $stockSoldDisplay = $grouped->values()->implode(', ');
                    }
                }

                return [
                    'id' => (string) $ledger->id,
                    'productId' => (string) $ledger->product_id,
                    'productName' => $ledger->product ? $ledger->product->name : 'Unknown Product',
                    'date' => $ledger->date->format('Y-m-d'),
                    'openingStock' => (float) $ledger->opening_stock,
                    'stockAdded' => (float) $ledger->stock_added,
                    'stockSold' => (float) $ledger->stock_sold,
                    'stockSoldDisplay' => $stockSoldDisplay,
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

            // Recalculate ledger for the addition date
            $this->ledgerService->recalculateDailyLedger($product, $date);

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
