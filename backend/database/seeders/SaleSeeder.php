<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Sale;
use App\Models\ProfitSummary;
use App\Services\PricingService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class SaleSeeder extends Seeder
{
    public function run(): void
    {
        $pricingService = app(PricingService::class);
        
        $yesterday = Carbon::yesterday();
        $today = Carbon::today();
        
        // Get products with retail enabled
        $rice = Product::where('name', 'like', '%Rice%')->first();
        $beans = Product::where('name', 'like', '%Beans%')->first();
        $garri = Product::where('name', 'like', '%Garri%')->first();

        $sales = [];

        // Create yesterday's sales
        if ($rice) {
            $sales[] = $this->createSale($rice, 'bag', 5, $yesterday, $pricingService);
            $sales[] = $this->createSale($rice, 'cup', 50, $yesterday, $pricingService);
            $sales[] = $this->createSale($rice, 'bucket', 10, $yesterday, $pricingService);
        }

        if ($beans) {
            $sales[] = $this->createSale($beans, 'bag', 3, $yesterday, $pricingService);
            $sales[] = $this->createSale($beans, 'cup', 30, $yesterday, $pricingService);
        }

        if ($garri) {
            $sales[] = $this->createSale($garri, 'bag', 8, $yesterday, $pricingService);
            $sales[] = $this->createSale($garri, 'bucket', 15, $yesterday, $pricingService);
        }

        // Create today's sales
        if ($rice) {
            $sales[] = $this->createSale($rice, 'bag', 2, $today, $pricingService);
            $sales[] = $this->createSale($rice, 'cup', 25, $today, $pricingService);
        }

        if ($beans) {
            $sales[] = $this->createSale($beans, 'bag', 1, $today, $pricingService);
        }

        // Calculate and create profit summaries
        $this->createProfitSummaries($sales);

        $this->command->info('Sales data seeded successfully!');
    }

    private function createSale(Product $product, string $unit, float $quantity, Carbon $date, PricingService $pricingService): array
    {
        $pricing = $pricingService->calculateProfit($product, $unit, $quantity);

        $sale = Sale::create([
            'product_id' => $product->id,
            'quantity' => $quantity,
            'unit' => $unit,
            'unit_price' => $pricing['unit_price'],
            'total_amount' => $pricing['total_amount'],
            'cost_equivalent' => $pricing['cost_equivalent'],
            'profit' => $pricing['profit'],
            'date' => $date,
            'user_id' => 1,
        ]);

        return [
            'date' => $date->format('Y-m-d'),
            'total_amount' => $pricing['total_amount'],
            'cost_equivalent' => $pricing['cost_equivalent'],
            'profit' => $pricing['profit'],
        ];
    }

    private function createProfitSummaries(array $sales): void
    {
        $grouped = collect($sales)->groupBy('date');

        foreach ($grouped as $date => $daySales) {
            ProfitSummary::create([
                'date' => $date,
                'total_sales' => $daySales->sum('total_amount'),
                'total_cost' => $daySales->sum('cost_equivalent'),
                'total_profit' => $daySales->sum('profit'),
                'sales_count' => $daySales->count(),
            ]);
        }
    }
}
