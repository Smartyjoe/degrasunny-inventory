<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockAdditionRequest;
use App\Http\Requests\StockOverrideRequest;
use App\Models\StockLedger;
use App\Models\StockAddition;
use App\Services\StockService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function __construct(
        protected StockService $stockService
    ) {}

    /**
     * Get daily stock
     */
    public function getDailyStock(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $dateString = Carbon::parse($request->date)->toDateString();
        $stocks = $this->stockService->getDailyStock($dateString);

        return response()->json([
            'success' => true,
            'message' => 'Daily stock retrieved successfully',
            'data' => $stocks,
        ]);
    }

    /**
     * Update daily stock (manual override)
     */
    public function updateDailyStock(StockOverrideRequest $request, StockLedger $dailyStock): JsonResponse
    {
        $ledger = $this->stockService->overrideStock($dailyStock, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Stock updated successfully',
            'data' => [
                'id' => (string) $ledger->id,
                'productId' => (string) $ledger->product_id,
                'date' => $ledger->date->format('Y-m-d'),
                'openingStock' => (float) $ledger->opening_stock,
                'stockAdded' => (float) $ledger->stock_added,
                'stockSold' => (float) $ledger->stock_sold,
                'closingStock' => (float) $ledger->closing_stock,
            ],
        ]);
    }

    /**
     * Add stock
     */
    public function addStock(StockAdditionRequest $request): JsonResponse
    {
        $addition = $this->stockService->addStock($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Stock added successfully',
            'data' => [
                'id' => (string) $addition->id,
                'productId' => (string) $addition->product_id,
                'quantity' => (float) $addition->quantity,
                'costPrice' => (float) $addition->cost_price,
                'totalCost' => (float) $addition->total_cost,
                'date' => $addition->date->format('Y-m-d'),
                'notes' => $addition->notes,
            ],
        ], 201);
    }

    /**
     * Get stock additions
     */
    public function getStockAdditions(Request $request): JsonResponse
    {
        $query = StockAddition::with('product')->orderBy('date', 'desc');

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }

        $additions = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Stock additions retrieved successfully',
            'data' => $additions->map(function ($addition) {
                return [
                    'id' => (string) $addition->id,
                    'productId' => (string) $addition->product_id,
                    'productName' => $addition->product ? $addition->product->name : 'Unknown Product',
                    'quantity' => (float) $addition->quantity,
                    'costPrice' => (float) $addition->cost_price,
                    'totalCost' => (float) $addition->total_cost,
                    'supplier' => $addition->supplier,
                    'date' => $addition->date->format('Y-m-d'),
                    'notes' => $addition->notes,
                ];
            })->values(),
        ]);
    }
}
