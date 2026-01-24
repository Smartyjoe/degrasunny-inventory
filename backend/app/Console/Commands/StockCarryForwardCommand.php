<?php

namespace App\Console\Commands;

use App\Services\StockService;
use Illuminate\Console\Command;

class StockCarryForwardCommand extends Command
{
    protected $signature = 'stock:carryforward';
    protected $description = 'Carry forward closing stock to next day opening stock';

    public function __construct(
        protected StockService $stockService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Starting stock carryforward process...');

        try {
            $this->stockService->carryForwardStock();
            
            $this->info('Stock carryforward completed successfully!');
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Stock carryforward failed: ' . $e->getMessage());
            
            return Command::FAILURE;
        }
    }
}
