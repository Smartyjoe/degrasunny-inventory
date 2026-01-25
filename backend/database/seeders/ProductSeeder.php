<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Get the first user to assign products to
        $userId = \App\Models\User::first()->id;
        
        $products = [
            [
                'name' => 'Rice (50kg)',
                'description' => 'Premium quality rice in 50kg bags',
                'category' => 'grains',
                'current_stock' => 100,
                'cost_price' => 25000,
                'selling_price' => 32000,
                'is_retail_enabled' => true,
                'cups_per_bag' => 200,
                'buckets_per_bag' => 20,
                'cup_price' => 200,
                'bucket_price' => 1800,
                'reorder_level' => 20,
                'is_active' => true,
            ],
            [
                'name' => 'Beans (50kg)',
                'description' => 'High quality beans in 50kg bags',
                'category' => 'grains',
                'current_stock' => 75,
                'cost_price' => 30000,
                'selling_price' => 38000,
                'is_retail_enabled' => true,
                'cups_per_bag' => 180,
                'buckets_per_bag' => 18,
                'cup_price' => 250,
                'bucket_price' => 2200,
                'reorder_level' => 15,
                'is_active' => true,
            ],
            [
                'name' => 'Garri (25kg)',
                'description' => 'White garri in 25kg bags',
                'category' => 'grains',
                'current_stock' => 50,
                'cost_price' => 8000,
                'selling_price' => 11000,
                'is_retail_enabled' => true,
                'cups_per_bag' => 100,
                'buckets_per_bag' => 10,
                'cup_price' => 130,
                'bucket_price' => 1200,
                'reorder_level' => 10,
                'is_active' => true,
            ],
            [
                'name' => 'Palm Oil (25L)',
                'description' => 'Pure red palm oil in 25L containers',
                'category' => 'oil',
                'current_stock' => 30,
                'cost_price' => 15000,
                'selling_price' => 20000,
                'is_retail_enabled' => true,
                'cups_per_bag' => 50,
                'buckets_per_bag' => 5,
                'cup_price' => 450,
                'bucket_price' => 4200,
                'reorder_level' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Groundnut Oil (25L)',
                'description' => 'Pure groundnut oil in 25L containers',
                'category' => 'oil',
                'current_stock' => 8,
                'cost_price' => 22000,
                'selling_price' => 28000,
                'is_retail_enabled' => false,
                'cups_per_bag' => null,
                'buckets_per_bag' => null,
                'cup_price' => null,
                'bucket_price' => null,
                'reorder_level' => 10,
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::create(array_merge($product, ['user_id' => $userId]));
        }

        $this->command->info('Products seeded successfully!');
    }
}
