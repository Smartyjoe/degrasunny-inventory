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
        protected StockService $stockService
    ) {}

    /**
     * Create a new sale
     */
    public function createSale(array $data): Sale
    {
        return DB::transaction(function () use ($data) {
            $product = Product::findOrFail($data['product_id']);
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
     */
    protected function updateProfitSummary(Carbon $date, Sale $sale): void
    {
        $summary = ProfitSummary::firstOrCreate(
            ['date' => $date],
            [
                'total_sales' => 0,
                'total_cost' => 0,
                'total_profit' => 0,
                'sales_count' => 0,
            ]
        );

        $summary->increment('total_sales', $sale->total_amount);
        $summary->increment('total_cost', $sale->cost_equivalent);
        $summary->increment('total_profit', $sale->profit);
        $summary->increment('sales_count');
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

            // Update stock ledger
            $ledger = $this->stockService->initializeDailyStock($product, $date);
            $ledger->decrement('stock_sold', $bagsToRestore);

            // Update profit summary
            $summary = ProfitSummary::where('date', $date)->first();
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
            return [
                'id' => (string) $sale->id,
                'productId' => (string) $sale->product_id,
                'productName' => $sale->product->name,
                'unit' => $sale->unit,
                'quantity' => (float) $sale->quantity,
                'pricePerUnit' => (float) $sale->unit_price,
                'totalAmount' => (float) $sale->total_amount,
                'profit' => (float) $sale->profit,
                'date' => $sale->date->format('Y-m-d'),
                'createdAt' => $sale->created_at->toIso8601String(),
            ];
        })->toArray();
    }
}
