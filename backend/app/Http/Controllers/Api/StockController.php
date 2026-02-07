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

        $date = Carbon::parse($request->date);
        $stocks = $this->stockService->getDailyStock($date);

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
                'productName' => $addition->product ? $addition->product->name : 'Unknown Product',
                'quantity' => (float) $addition->quantity,
                'costPrice' => (float) $addition->cost_price,
                'totalCost' => (float) $addition->total_cost,
                'date' => $addition->date->format('Y-m-d'),
                'notes' => $addition->notes,
                'createdAt' => $addition->created_at->toIso8601String(),
                'canEdit' => true, // Newly created stock additions can be edited (same-day only)
            ],
        ], 201);
    }

    /**
     * Get stock additions
     */
    public function getStockAdditions(Request $request): JsonResponse
    {
        $filters = [];
        
        if ($request->has('productId')) {
            $filters['product_id'] = $request->query('productId');
        }

        if ($request->has('startDate')) {
            $filters['start_date'] = $request->query('startDate');
        }

        if ($request->has('endDate')) {
            $filters['end_date'] = $request->query('endDate');
        }

        $additions = $this->stockService->getStockAdditions($filters);

        return response()->json([
            'success' => true,
            'message' => 'Stock additions retrieved successfully',
            'data' => $additions,
        ]);
    }

    /**
     * Update stock addition
     */
    public function updateStockAddition(Request $request, StockAddition $stockAddition): JsonResponse
    {
        // Verify ownership
        if ($stockAddition->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Stock addition not found or access denied',
            ], 404);
        }

        try {
            $validated = $request->validate([
                'quantity' => 'sometimes|required|numeric|min:0.01',
                'costPrice' => 'sometimes|required|numeric|min:0',
                'supplier' => 'nullable|string|max:255',
                'notes' => 'nullable|string|max:1000',
            ]);

            $data = [
                'quantity' => $validated['quantity'] ?? $stockAddition->quantity,
                'cost_price' => $validated['costPrice'] ?? $stockAddition->cost_price,
                'supplier' => $validated['supplier'] ?? $stockAddition->supplier,
                'notes' => $validated['notes'] ?? $stockAddition->notes,
            ];

            $updatedAddition = $this->stockService->updateStockAddition($stockAddition, $data);

            return response()->json([
                'success' => true,
                'message' => 'Stock addition updated successfully',
                'data' => [
                    'id' => (string) $updatedAddition->id,
                    'productId' => (string) $updatedAddition->product_id,
                    'quantity' => (float) $updatedAddition->quantity,
                    'costPrice' => (float) $updatedAddition->cost_price,
                    'supplier' => $updatedAddition->supplier,
                    'notes' => $updatedAddition->notes,
                    'date' => $updatedAddition->date->format('Y-m-d'),
                    'createdAt' => $updatedAddition->created_at->toIso8601String(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null,
            ], 400);
        }
    }
}
