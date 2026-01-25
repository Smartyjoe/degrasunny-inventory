<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\StockLedger;
use App\Models\StockAddition;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class StockSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $userId = \App\Models\User::first()->id;
        
        // Disable global scope to get all products for seeding
        $products = Product::withoutGlobalScope('user')->get();

        foreach ($products as $product) {
            // Create yesterday's stock ledger
            StockLedger::create([
                'user_id' => $userId,
                'product_id' => $product->id,
                'date' => $yesterday,
                'opening_stock' => $product->current_stock * 0.7,
                'stock_added' => $product->current_stock * 0.35,
                'stock_sold' => $product->current_stock * 0.05,
                'closing_stock' => $product->current_stock,
            ]);

            // Create today's stock ledger
            StockLedger::create([
                'user_id' => $userId,
                'product_id' => $product->id,
                'date' => $today,
                'opening_stock' => $product->current_stock,
                'stock_added' => 0,
                'stock_sold' => 0,
                'closing_stock' => $product->current_stock,
            ]);

            // Create a stock addition record
            StockAddition::create([
                'user_id' => $userId,
                'product_id' => $product->id,
                'quantity' => $product->current_stock * 0.35,
                'cost_price' => $product->cost_price,
                'supplier' => 'ABC Suppliers Ltd',
                'date' => $yesterday,
                'notes' => 'Initial stock addition',
            ]);
        }

        $this->command->info('Stock data seeded successfully!');
    }
}
