<?php

namespace App\Services;

use App\Models\Product;

class PricingService
{
    /**
     * Calculate profit per unit based on unit type
     */
    public function calculateProfit(Product $product, string $unit, float $quantity): array
    {
        $unitPrice = $this->getUnitPrice($product, $unit);
        $costPerUnit = $this->getCostPerUnit($product, $unit);
        
        $totalAmount = $unitPrice * $quantity;
        $costEquivalent = $costPerUnit * $quantity;
        $profit = $totalAmount - $costEquivalent;
        
        return [
            'unit_price' => $unitPrice,
            'cost_equivalent' => $costEquivalent,
            'total_amount' => $totalAmount,
            'profit' => $profit,
        ];
    }

    /**
     * Get selling price per unit
     */
    public function getUnitPrice(Product $product, string $unit): float
    {
        return match ($unit) {
            'bag' => (float) $product->selling_price,
            'cup' => (float) $product->cup_price,
            'bucket' => (float) $product->bucket_price,
            default => throw new \InvalidArgumentException("Invalid unit: $unit"),
        };
    }

    /**
     * Get cost price per unit
     */
    public function getCostPerUnit(Product $product, string $unit): float
    {
        return match ($unit) {
            'bag' => (float) $product->cost_price,
            'cup' => $product->cups_per_bag > 0 
                ? (float) $product->cost_price / $product->cups_per_bag 
                : 0,
            'bucket' => $product->buckets_per_bag > 0 
                ? (float) $product->cost_price / $product->buckets_per_bag 
                : 0,
            default => throw new \InvalidArgumentException("Invalid unit: $unit"),
        };
    }

    /**
     * Convert quantity to bags for stock calculation
     */
    public function convertToBags(Product $product, string $unit, float $quantity): float
    {
        return match ($unit) {
            'bag' => $quantity,
            'cup' => $product->cups_per_bag > 0 
                ? $quantity / $product->cups_per_bag 
                : 0,
            'bucket' => $product->buckets_per_bag > 0 
                ? $quantity / $product->buckets_per_bag 
                : 0,
            default => throw new \InvalidArgumentException("Invalid unit: $unit"),
        };
    }

    /**
     * Validate if retail unit is enabled for product
     */
    public function validateRetailUnit(Product $product, string $unit): void
    {
        if ($unit === 'bag') {
            return;
        }

        if (!$product->is_retail_enabled) {
            throw new \InvalidArgumentException('Retail sales are not enabled for this product');
        }

        if ($unit === 'cup' && (!$product->cup_price || !$product->cups_per_bag)) {
            throw new \InvalidArgumentException('Cup pricing is not configured for this product');
        }

        if ($unit === 'bucket' && (!$product->bucket_price || !$product->buckets_per_bag)) {
            throw new \InvalidArgumentException('Bucket pricing is not configured for this product');
        }
    }

    /**
     * Calculate profit margin percentage
     */
    public function calculateMargin(float $sellingPrice, float $costPrice): float
    {
        if ($sellingPrice <= 0) {
            return 0;
        }

        return (($sellingPrice - $costPrice) / $sellingPrice) * 100;
    }
}
