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
}
