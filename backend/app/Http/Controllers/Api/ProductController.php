<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Models\Product;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Get all products
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query();

        // Apply filters
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('isActive')) {
            $query->where('is_active', filter_var($request->isActive, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('lowStock') && filter_var($request->lowStock, FILTER_VALIDATE_BOOLEAN)) {
            $query->lowStock();
        }

        $products = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Products retrieved successfully',
            'data' => $products->map(fn($p) => $this->formatProduct($p))->values(),
        ]);
    }

    /**
     * Get single product
     */
    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Product retrieved successfully',
            'data' => $this->formatProduct($product),
        ]);
    }

    /**
     * Create product
     */
    public function store(ProductRequest $request): JsonResponse
    {
        $product = Product::create($request->validated());

        AuditLog::log('created', 'product', $product->id, null, $product->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $this->formatProduct($product),
        ], 201);
    }

    /**
     * Update product
     */
    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        $oldValue = $product->toArray();
        
        $product->update($request->validated());

        AuditLog::log('updated', 'product', $product->id, $oldValue, $product->toArray());

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $this->formatProduct($product),
        ]);
    }

    /**
     * Delete (soft delete) product
     */
    public function destroy(Product $product): JsonResponse
    {
        AuditLog::log('deleted', 'product', $product->id, $product->toArray(), null);

        $product->update(['is_active' => false]);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
            'data' => null,
        ]);
    }

    /**
     * Update product stock
     */
    public function updateStock(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|numeric|min:0',
        ]);

        $oldStock = $product->current_stock;
        $product->update(['current_stock' => $request->quantity]);

        AuditLog::log('updated', 'product_stock', $product->id, 
            ['current_stock' => $oldStock], 
            ['current_stock' => $request->quantity]
        );

        return response()->json([
            'success' => true,
            'message' => 'Stock updated successfully',
            'data' => $this->formatProduct($product),
        ]);
    }

    /**
     * Format product for API response
     */
    protected function formatProduct(Product $product): array
    {
        return [
            'id' => (string) $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'currentStock' => (float) $product->current_stock,
            'costPrice' => (float) $product->cost_price,
            'sellingPrice' => (float) $product->selling_price,
            'isRetailEnabled' => $product->is_retail_enabled,
            'cupsPerBag' => $product->cups_per_bag,
            'bucketsPerBag' => $product->buckets_per_bag,
            'cupPrice' => $product->cup_price ? (float) $product->cup_price : null,
            'bucketPrice' => $product->bucket_price ? (float) $product->bucket_price : null,
            'reorderLevel' => (float) $product->reorder_level,
            'isActive' => $product->is_active,
            'createdAt' => $product->created_at->toIso8601String(),
            'updatedAt' => $product->updated_at->toIso8601String(),
        ];
    }
}
