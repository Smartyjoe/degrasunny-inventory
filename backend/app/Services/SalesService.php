<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Sale;
use App\Models\ProfitSummary;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SalesService
{
    public function __construct(
        protected PricingService $pricingService,
        protected StockService $stockService,
        protected StockLedgerService $ledgerService
    ) {}

    /**
     * Create a new sale
     */
    public function createSale(array $data): Sale
    {
        return DB::transaction(function () use ($data) {
            // Ensure product belongs to authenticated user
            $product = Product::where('id', $data['product_id'])
                ->where('user_id', auth()->id())
                ->firstOrFail();
            $date = Carbon::parse($data['date'] ?? now());

            // Validate retail unit if applicable
            $this->pricingService->validateRetailUnit($product, $data['unit']);

            // Calculate pricing
            $pricing = $this->pricingService->calculateProfit(
                $product,
                $data['unit'],
                $data['quantity']
            );

            // Convert to bags for stock deduction
            $bagsToDeduct = $this->pricingService->convertToBags(
                $product,
                $data['unit'],
                $data['quantity']
            );

            // Validate stock availability
            $this->stockService->validateStockAvailability($product, $bagsToDeduct);

            // Create sale record
            $sale = Sale::create([
                'product_id' => $product->id,
                'quantity' => $data['quantity'],
                'unit' => $data['unit'],
                'unit_price' => $pricing['unit_price'],
                'total_amount' => $pricing['total_amount'],
                'cost_equivalent' => $pricing['cost_equivalent'],
                'profit' => $pricing['profit'],
                'payment_method' => $data['payment_method'] ?? 'cash',
                'date' => $date,
                'user_id' => auth()->id(),
            ]);

            // Deduct stock
            $this->stockService->deductStock($product, $bagsToDeduct, $date);

            // Update profit summary
            $this->updateProfitSummary($date, $sale);

            // Log the sale
            AuditLog::log('created', 'sale', $sale->id, null, $sale->toArray());

            return $sale;
        });
    }

    /**
     * Update daily profit summary
     * Uses INSERT ... ON DUPLICATE KEY UPDATE for atomic operation
     */
    protected function updateProfitSummary(Carbon $date, Sale $sale): void
    {
        $userId = auth()->id();
        $dateStr = $date->format('Y-m-d');
        
        // Use raw SQL for INSERT ... ON DUPLICATE KEY UPDATE
        // This is atomic and handles both first sale and subsequent sales correctly
        DB::statement(
            "INSERT INTO profit_summaries 
                (user_id, date, total_sales, total_cost, total_profit, sales_count, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                total_sales = total_sales + VALUES(total_sales),
                total_cost = total_cost + VALUES(total_cost),
                total_profit = total_profit + VALUES(total_profit),
                sales_count = sales_count + VALUES(sales_count),
                updated_at = VALUES(updated_at)",
            [
                $userId,
                $dateStr,
                $sale->total_amount,
                $sale->cost_equivalent,
                $sale->profit,
                1, // sales_count increment
                now(),
                now()
            ]
        );
    }

    /**
     * Delete a sale and reverse stock
     */
    public function deleteSale(Sale $sale): void
    {
        DB::transaction(function () use ($sale) {
            $product = $sale->product;
            $date = $sale->date;

            // Convert sale quantity back to bags
            $bagsToRestore = $this->pricingService->convertToBags(
                $product,
                $sale->unit,
                $sale->quantity
            );

            // Restore stock
            $product->increment('current_stock', $bagsToRestore);

            // Update stock ledger (use centralized service)
            $ledger = $this->ledgerService->getOrCreateDailyLedger($product, $date);
            $ledger->stock_sold -= $bagsToRestore;
            $ledger->closing_stock = $ledger->opening_stock + $ledger->stock_added - $ledger->stock_sold;
            $ledger->save();

            // Update profit summary
            $summary = ProfitSummary::where('user_id', auth()->id())
                ->where('date', $date)
                ->first();
            if ($summary) {
                $summary->decrement('total_sales', $sale->total_amount);
                $summary->decrement('total_cost', $sale->cost_equivalent);
                $summary->decrement('total_profit', $sale->profit);
                $summary->decrement('sales_count');
            }

            // Log deletion
            AuditLog::log('deleted', 'sale', $sale->id, $sale->toArray(), null);

            // Delete the sale
            $sale->delete();
        });
    }

    /**
     * Get sales with filters
     */
    public function getSales(array $filters = []): array
    {
        $query = Sale::with('product')->orderBy('created_at', 'desc');

        if (isset($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (isset($filters['start_date'])) {
            $query->where('date', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->where('date', '<=', $filters['end_date']);
        }

        return $query->get()->map(function ($sale) {
            $createdAt = $sale->created_at;
            $now = now();
            $hoursDiff = $createdAt->diffInHours($now);
            $canEdit = $hoursDiff < 3;

            return [
                'id' => (string) $sale->id,
                'productId' => (string) $sale->product_id,
                'productName' => $sale->product ? $sale->product->name : 'Unknown Product',
                'unit' => $sale->unit,
                'quantity' => (float) $sale->quantity,
                'pricePerUnit' => (float) $sale->unit_price,
                'totalAmount' => (float) $sale->total_amount,
                'profit' => (float) $sale->profit,
                'paymentMethod' => $sale->payment_method,
                'description' => $sale->description,
                'date' => $sale->date->format('Y-m-d'),
                'createdAt' => $sale->created_at->toIso8601String(),
                'canEdit' => $canEdit,
            ];
        })->toArray();
    }

    public function updateSale(Sale $sale, array $data): Sale
    {
        // Enforce 3-hour edit window
        $createdAt = $sale->created_at;
        $now = now();
        $hoursDiff = $createdAt->diffInHours($now);

        if ($hoursDiff >= 3) {
            throw new \Exception('Sales can only be edited within 3 hours of creation.');
        }

        return DB::transaction(function () use ($sale, $data) {
            $product = $sale->product;
            $oldQuantity = $sale->quantity;
            $oldUnit = $sale->unit;
            $newQuantity = $data['quantity'];
            $newUnit = $data['unit'];
            $date = $sale->date;

            // Convert old and new quantities to bags
            $oldBags = $this->pricingService->convertToBags($product, $oldUnit, $oldQuantity);
            $newBags = $this->pricingService->convertToBags($product, $newUnit, $newQuantity);
            $bagsDiff = $newBags - $oldBags;

            // Validate retail unit if applicable
            $this->pricingService->validateRetailUnit($product, $newUnit);

            // Recalculate pricing
            $pricing = $this->pricingService->calculateProfit($product, $newUnit, $newQuantity);

            // Check if we have enough stock for the update
            $currentAvailable = $product->current_stock + $oldBags; // Add back old stock
            if ($currentAvailable < $newBags) {
                throw new \Exception('Insufficient stock for this update.');
            }

            // Revert old stock impact and apply new
            $product->current_stock += $oldBags;
            $product->current_stock -= $newBags;
            $product->save();

            // Store old values for profit summary update
            $oldProfit = $sale->profit;
            $oldTotalAmount = $sale->total_amount;
            $oldCostEquivalent = $sale->cost_equivalent;

            // Update sale
            $sale->update([
                'quantity' => $newQuantity,
                'unit' => $newUnit,
                'unit_price' => $pricing['unit_price'],
                'total_amount' => $pricing['total_amount'],
                'cost_equivalent' => $pricing['cost_equivalent'],
                'profit' => $pricing['profit'],
                'payment_method' => $data['payment_method'] ?? $sale->payment_method,
                'description' => $data['description'] ?? $sale->description,
            ]);

            // Update stock ledger for the sale date
            $ledger = $this->ledgerService->getOrCreateDailyLedger($product, $date);
            $ledger->stock_sold += $bagsDiff;
            $ledger->closing_stock = $ledger->opening_stock + $ledger->stock_added - $ledger->stock_sold;
            $ledger->save();

            // Update profit summary
            $summary = ProfitSummary::where('user_id', auth()->id())
                ->where('date', $date)
                ->first();
            if ($summary) {
                $summary->total_sales += ($pricing['total_amount'] - $oldTotalAmount);
                $summary->total_cost += ($pricing['cost_equivalent'] - $oldCostEquivalent);
                $summary->total_profit += ($pricing['profit'] - $oldProfit);
                $summary->save();
            }

            // Log the update
            AuditLog::log('updated', 'sale', $sale->id, ['old' => $oldQuantity], ['new' => $newQuantity]);

            return $sale->fresh();
        });
    }
}
