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
                    'stockBefore' => (float) $addition->stock_before,
                    'stockAfter' => (float) $addition->stock_after,
                    'costPrice' => (float) $addition->cost_price,
                    'totalCost' => (float) $addition->total_cost,
                    'supplier' => $addition->supplier,
                    'date' => $addition->date->format('Y-m-d'),
                    'notes' => $addition->notes,
                    'createdAt' => $addition->created_at->toIso8601String(),
                    'editable' => now()->diffInMinutes($addition->created_at) < 120,
                ];
            })->values(),
        ]);
    }

    /**
     * Update stock addition (within 2 hours)
     */
    public function updateStockAddition(StockAdditionRequest $request, StockAddition $addition): JsonResponse
    {
        // Verify ownership
        $product = $addition->product;
        if ((string) $product->user_id !== (string) $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Stock addition not found or access denied',
            ], 404);
        }

        // Check if within edit window (2 hours = 120 minutes)
        $editWindowMinutes = 120;
        if (now()->diffInMinutes($addition->created_at) > $editWindowMinutes) {
            return response()->json([
                'success' => false,
                'message' => 'Stock addition can no longer be edited. Edit window has expired (2 hours).',
                'data' => [
                    'editable' => false,
                    'expires_at' => $addition->created_at->addMinutes($editWindowMinutes)->toIso8601String(),
                ]
            ], 403);
        }

        try {
            $updatedAddition = $this->stockService->updateStockAddition($addition, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Stock addition updated successfully',
                'data' => [
                    'id' => (string) $updatedAddition->id,
                    'productId' => (string) $updatedAddition->product_id,
                    'quantity' => (float) $updatedAddition->quantity,
                    'stockBefore' => (float) $updatedAddition->stock_before,
                    'stockAfter' => (float) $updatedAddition->stock_after,
                    'costPrice' => (float) $updatedAddition->cost_price,
                    'totalCost' => (float) $updatedAddition->total_cost,
                    'supplier' => $updatedAddition->supplier,
                    'date' => $updatedAddition->date->format('Y-m-d'),
                    'notes' => $updatedAddition->notes,
                    'createdAt' => $updatedAddition->created_at->toIso8601String(),
                    'editable' => true,
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

    /**
     * Check if stock addition is editable
     */
    public function checkStockAdditionEditable(Request $request, StockAddition $addition): JsonResponse
    {
        $product = $addition->product;
        if ((string) $product->user_id !== (string) $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Stock addition not found or access denied',
            ], 404);
        }

        $editWindowMinutes = 120;
        $minutesRemaining = $editWindowMinutes - now()->diffInMinutes($addition->created_at);
        $isEditable = $minutesRemaining > 0;

        return response()->json([
            'success' => true,
            'data' => [
                'editable' => $isEditable,
                'minutes_remaining' => max(0, $minutesRemaining),
                'expires_at' => $addition->created_at->addMinutes($editWindowMinutes)->toIso8601String(),
            ],
        ]);
    }
}
