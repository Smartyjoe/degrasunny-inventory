<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaleRequest;
use App\Models\Sale;
use App\Services\SalesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
    }

    /**
     * Get single sale
     */
    public function show(Request $request, Sale $sale): JsonResponse
    {
        // Verify ownership
        if ($sale->user_id !== $request->user()->id) {
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
                    'description' => $sale->description,
                    'date' => $sale->date->format('Y-m-d'),
                    'createdAt' => $sale->created_at->toIso8601String(),
                    'canEdit' => true, // Newly created sales can always be edited (within 3-hour window)
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
     * Update sale
     */
    public function update(Request $request, Sale $sale): JsonResponse
    {
        // Verify ownership
        if ($sale->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Sale not found or access denied',
            ], 404);
        }

        try {
            $validated = $request->validate([
                'productId' => 'sometimes|required|exists:products,id',
                'quantity' => 'sometimes|required|numeric|min:0.01',
                'unit' => 'sometimes|required|in:bag,retail',
                'paymentMethod' => 'sometimes|required|in:cash,pos,bank_transfer',
                'description' => 'nullable|string|max:1000',
            ]);

            $data = [
                'product_id' => $validated['productId'] ?? $sale->product_id,
                'quantity' => $validated['quantity'] ?? $sale->quantity,
                'unit' => $validated['unit'] ?? $sale->unit,
                'payment_method' => $validated['paymentMethod'] ?? $sale->payment_method,
                'description' => $validated['description'] ?? $sale->description,
            ];

            $updatedSale = $this->salesService->updateSale($sale, $data);

            return response()->json([
                'success' => true,
                'message' => 'Sale updated successfully',
                'data' => [
                    'id' => (string) $updatedSale->id,
                    'productId' => (string) $updatedSale->product_id,
                    'productName' => $updatedSale->product->name,
                    'quantity' => (float) $updatedSale->quantity,
                    'unit' => $updatedSale->unit,
                    'pricePerUnit' => (float) $updatedSale->unit_price,
                    'totalAmount' => (float) $updatedSale->total_amount,
                    'profit' => (float) $updatedSale->profit,
                    'paymentMethod' => $updatedSale->payment_method,
                    'description' => $updatedSale->description,
                    'date' => $updatedSale->date->format('Y-m-d'),
                    'createdAt' => $updatedSale->created_at->toIso8601String(),
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
     * Delete sale
     */
    public function destroy(Request $request, Sale $sale): JsonResponse
    {
        // Verify ownership
        if ($sale->user_id !== $request->user()->id) {
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
