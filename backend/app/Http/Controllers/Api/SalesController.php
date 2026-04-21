<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaleRequest;
use App\Models\Sale;
use App\Services\SalesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SalesController extends Controller
{
    public function __construct(
        protected SalesService $salesService
    ) {}

    /**
     * Get all sales
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = [];

            if ($request->has('productId')) {
                $filters['product_id'] = $request->productId;
            }

            if ($request->has('startDate')) {
                $filters['start_date'] = $request->startDate;
            }

            if ($request->has('endDate')) {
                $filters['end_date'] = $request->endDate;
            }

            $sales = $this->salesService->getSales($filters);

            return response()->json([
                'success' => true,
                'message' => 'Sales retrieved successfully',
                'data' => $sales,
            ]);
        } catch (\Exception $e) {
            Log::error('SalesController@index error: ' . $e->getMessage(), [
                'user_id' => $request->user()->id ?? 'guest',
                'filters' => $filters ?? [],
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to load sales data',
            ], 500);
        }
    }

    /**
     * Get single sale
     */
    public function show(Request $request, Sale $sale): JsonResponse
    {
        // Verify ownership - cast both to string to avoid type mismatch
        if ((string) $sale->user_id !== (string) $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Sale not found or access denied',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Sale retrieved successfully',
            'data' => [
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
            ],
        ]);
    }

    /**
     * Create sale
     */
    public function store(SaleRequest $request): JsonResponse
    {
        try {
            $sale = $this->salesService->createSale($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Sale created successfully',
                'data' => [
                    'id' => (string) $sale->id,
                    'productId' => (string) $sale->product_id,
                    'productName' => $sale->product ? $sale->product->name : 'Unknown Product',
                    'unit' => $sale->unit,
                    'quantity' => (float) $sale->quantity,
                    'pricePerUnit' => (float) $sale->unit_price,
                    'totalAmount' => (float) $sale->total_amount,
                    'profit' => (float) $sale->profit,
                    'paymentMethod' => $sale->payment_method,
                    'date' => $sale->date->format('Y-m-d'),
                    'createdAt' => $sale->created_at->toIso8601String(),
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null,
            ], 400);
        }
    }

    /**
     * Delete sale
     */
    public function destroy(Request $request, Sale $sale): JsonResponse
    {
        // Verify ownership - cast both to string to avoid type mismatch
        if ((string) $sale->user_id !== (string) $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Sale not found or access denied',
            ], 404);
        }

        // Check if sale is within edit window (1.5 hours)
        $editWindowMinutes = 90; // 1.5 hours
        if (now()->diffInMinutes($sale->created_at) > $editWindowMinutes) {
            return response()->json([
                'success' => false,
                'message' => 'Sale can no longer be edited. Edit window has expired (1.5 hours).',
            ], 403);
        }

        try {
            $this->salesService->deleteSale($sale);

            return response()->json([
                'success' => true,
                'message' => 'Sale deleted successfully',
                'data' => null,
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
     * Update sale (within 1.5 hours)
     */
    public function update(SaleRequest $request, Sale $sale): JsonResponse
    {
        // Verify ownership
        if ((string) $sale->user_id !== (string) $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Sale not found or access denied',
            ], 404);
        }

        // Check if sale is within edit window (1.5 hours = 90 minutes)
        $editWindowMinutes = 90;
        if (now()->diffInMinutes($sale->created_at) > $editWindowMinutes) {
            return response()->json([
                'success' => false,
                'message' => 'Sale can no longer be edited. Edit window has expired (1.5 hours).',
                'data' => [
                    'editable' => false,
                    'expires_at' => $sale->created_at->addMinutes($editWindowMinutes)->toIso8601String(),
                ]
            ], 403);
        }

        try {
            $updatedSale = $this->salesService->updateSale($sale, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Sale updated successfully',
                'data' => [
                    'id' => (string) $updatedSale->id,
                    'productId' => (string) $updatedSale->product_id,
                    'productName' => $updatedSale->product ? $updatedSale->product->name : 'Unknown Product',
                    'unit' => $updatedSale->unit,
                    'quantity' => (float) $updatedSale->quantity,
                    'pricePerUnit' => (float) $updatedSale->unit_price,
                    'totalAmount' => (float) $updatedSale->total_amount,
                    'profit' => (float) $updatedSale->profit,
                    'paymentMethod' => $updatedSale->payment_method,
                    'description' => $updatedSale->description,
                    'date' => $updatedSale->date->format('Y-m-d'),
                    'createdAt' => $updatedSale->created_at->toIso8601String(),
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
     * Check if sale is editable
     */
    public function checkEditable(Request $request, Sale $sale): JsonResponse
    {
        if ((string) $sale->user_id !== (string) $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Sale not found or access denied',
            ], 404);
        }

        $editWindowMinutes = 90;
        $minutesRemaining = $editWindowMinutes - now()->diffInMinutes($sale->created_at);
        $isEditable = $minutesRemaining > 0;

        return response()->json([
            'success' => true,
            'data' => [
                'editable' => $isEditable,
                'minutes_remaining' => max(0, $minutesRemaining),
                'expires_at' => $sale->created_at->addMinutes($editWindowMinutes)->toIso8601String(),
            ],
        ]);
    }
}
