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
    /**
     * Initialize daily stock for a product
     */
    public function initializeDailyStock(Product $product, Carbon $date): StockLedger
    {
        // Check if already exists
        $existing = StockLedger::where('product_id', $product->id)
            ->where('date', $date)
            ->first();

        if ($existing) {
            return $existing;
        }

        // Get previous day's closing stock
        $previousDay = $date->copy()->subDay();
        $previousLedger = StockLedger::where('product_id', $product->id)
            ->where('date', $previousDay)
            ->first();

        $openingStock = $previousLedger ? $previousLedger->closing_stock : $product->current_stock;

        return StockLedger::create([
            'product_id' => $product->id,
            'date' => $date,
            'opening_stock' => $openingStock,
            'stock_added' => 0,
            'stock_sold' => 0,
            'closing_stock' => $openingStock,
        ]);
    }

    /**
     * Carry forward closing stock to next day
     */
    public function carryForwardStock(): void
    {
        $today = Carbon::today();
        $products = Product::active()->get();

        foreach ($products as $product) {
            $this->initializeDailyStock($product, $today);
        }
    }

    /**
     * Add stock to product
     */
    public function addStock(array $data): StockAddition
    {
        return DB::transaction(function () use ($data) {
            $product = Product::findOrFail($data['product_id']);
            $date = Carbon::parse($data['date']);

            // Create stock addition record
            $addition = StockAddition::create([
                'product_id' => $product->id,
                'quantity' => $data['quantity'],
                'cost_price' => $data['cost_price'],
                'supplier' => $data['supplier'] ?? null,
                'date' => $date,
                'notes' => $data['notes'] ?? null,
            ]);

            // Update product current stock
            $product->increment('current_stock', $data['quantity']);

            // Update or create daily stock ledger
            $ledger = $this->initializeDailyStock($product, $date);
            $ledger->increment('stock_added', $data['quantity']);

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
    public function deductStock(Product $product, float $quantity, Carbon $date): void
    {
        DB::transaction(function () use ($product, $quantity, $date) {
            // Check if sufficient stock
            if ($product->current_stock < $quantity) {
                throw new \Exception('Insufficient stock. Available: ' . $product->current_stock . ' bags');
            }

            // Update product stock
            $product->decrement('current_stock', $quantity);

            // Update daily ledger
            $ledger = $this->initializeDailyStock($product, $date);
            $ledger->increment('stock_sold', $quantity);
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
                    'productName' => $ledger->product->name,
                    'date' => $ledger->date->format('Y-m-d'),
                    'openingStock' => (float) $ledger->opening_stock,
                    'stockAdded' => (float) $ledger->stock_added,
                    'stockSold' => (float) $ledger->stock_sold,
                    'closingStock' => (float) $ledger->closing_stock,
                ];
            })
            ->toArray();
    }
}
