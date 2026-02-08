<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\StockLedger;
use App\Services\StockLedgerService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RebuildStockLedgersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stock:rebuild-ledgers 
                            {--user_id= : Rebuild for a specific user}
                            {--product_id= : Rebuild for a specific product}
                            {--start_date= : Start date (YYYY-MM-DD)}
                            {--end_date= : End date (YYYY-MM-DD)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rebuild daily stock ledgers from historical stock additions and sales';

    /**
     * Execute the console command.
     */
    public function handle(StockLedgerService $ledgerService): int
    {
        $userId = $this->option('user_id');
        $productId = $this->option('product_id');
        $startDate = $this->option('start_date');
        $endDate = $this->option('end_date');

        $productsQuery = Product::query();

        if ($userId) {
            $productsQuery->where('user_id', $userId);
        }

        if ($productId) {
            $productsQuery->where('id', $productId);
        }

        $products = $productsQuery->get();

        if ($products->isEmpty()) {
            $this->warn('No products found for the given filters.');
            return Command::SUCCESS;
        }

        foreach ($products as $product) {
            $this->info("Rebuilding ledgers for product: {$product->name} (ID: {$product->id})");

            $firstStockAdditionDate = $product->stockAdditions()->min('date');
            $firstSaleDate = $product->sales()->min('date');

            $earliestDate = collect([$firstStockAdditionDate, $firstSaleDate])
                ->filter()
                ->min();

            if (!$earliestDate) {
                $this->line('  - No stock additions or sales found. Skipping.');
                continue;
            }

            $rangeStart = $startDate ? Carbon::parse($startDate) : Carbon::parse($earliestDate);
            $rangeEnd = $endDate ? Carbon::parse($endDate) : Carbon::today();

            DB::transaction(function () use ($product, $ledgerService, $rangeStart, $rangeEnd) {
                $current = $rangeStart->copy();

                while ($current->lte($rangeEnd)) {
                    // Ensure ledger exists with correct opening stock
                    $ledgerService->getOrCreateDailyLedger($product, $current);

                    // Recalculate based on transactions
                    $ledgerService->recalculateDailyLedger($product, $current);

                    $current->addDay();
                }
            });
        }

        $this->info('✅ Stock ledger rebuild completed.');

        return Command::SUCCESS;
    }
}
