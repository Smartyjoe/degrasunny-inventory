<?php

namespace App\Services;

use App\Models\Sale;
use App\Models\ProfitSummary;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportingService
{
    /**
     * Get daily summary report
     */
    public function getDailySummary(Carbon $date): array
    {
        $summary = ProfitSummary::where('date', $date)->first();

        if (!$summary) {
            $summary = $this->calculateDailySummary($date);
        }

        // Get top selling product
        $topProduct = Sale::where('date', $date)
            ->select('product_id', DB::raw('SUM(total_amount) as total'))
            ->groupBy('product_id')
            ->orderByDesc('total')
            ->with('product')
            ->first();

        return [
            'date' => $date->format('Y-m-d'),
            'totalSales' => (float) $summary->total_sales,
            'totalProfit' => (float) $summary->total_profit,
            'salesCount' => $summary->sales_count,
            'topProduct' => ($topProduct && $topProduct->product) ? $topProduct->product->name : 'N/A',
        ];
    }

    /**
     * Calculate daily summary from sales data
     */
    protected function calculateDailySummary(Carbon $date): object
    {
        $sales = Sale::where('date', $date)->get();

        return (object) [
            'total_sales' => $sales->sum('total_amount'),
            'total_cost' => $sales->sum('cost_equivalent'),
            'total_profit' => $sales->sum('profit'),
            'sales_count' => $sales->count(),
        ];
    }

    /**
     * Get weekly summary report
     */
    public function getWeeklySummary(Carbon $weekStart, Carbon $weekEnd): array
    {
        $summaries = ProfitSummary::whereBetween('date', [$weekStart, $weekEnd])->get();

        $dailyBreakdown = [];
        $currentDate = $weekStart->copy();

        while ($currentDate->lte($weekEnd)) {
            $dailyBreakdown[] = $this->getDailySummary($currentDate);
            $currentDate->addDay();
        }

        return [
            'weekStart' => $weekStart->format('Y-m-d'),
            'weekEnd' => $weekEnd->format('Y-m-d'),
            'totalSales' => (float) $summaries->sum('total_sales'),
            'totalProfit' => (float) $summaries->sum('total_profit'),
            'salesCount' => $summaries->sum('sales_count'),
            'dailyBreakdown' => $dailyBreakdown,
        ];
    }

    /**
     * Get monthly summary report
     */
    public function getMonthlySummary(int $month, int $year): array
    {
        $startDate = Carbon::create($year, $month, 1);
        $endDate = $startDate->copy()->endOfMonth();

        $summaries = ProfitSummary::whereBetween('date', [$startDate, $endDate])->get();

        // Calculate weekly breakdown
        $weeklyBreakdown = [];
        $currentWeekStart = $startDate->copy()->startOfWeek();

        while ($currentWeekStart->lte($endDate)) {
            $currentWeekEnd = $currentWeekStart->copy()->endOfWeek();
            
            if ($currentWeekEnd->gt($endDate)) {
                $currentWeekEnd = $endDate->copy();
            }

            $weeklyBreakdown[] = $this->getWeeklySummary($currentWeekStart, $currentWeekEnd);
            $currentWeekStart->addWeek();
        }

        return [
            'month' => $startDate->format('m'),
            'year' => $year,
            'totalSales' => (float) $summaries->sum('total_sales'),
            'totalProfit' => (float) $summaries->sum('total_profit'),
            'salesCount' => $summaries->sum('sales_count'),
            'weeklyBreakdown' => $weeklyBreakdown,
        ];
    }

    /**
     * Get product performance report
     */
    public function getProductPerformance($userId = null, $startDate = null, $endDate = null): array
    {
        $query = Sale::select(
            'product_id',
            DB::raw('SUM(total_amount) as total_sales'),
            DB::raw('SUM(profit) as total_profit'),
            DB::raw('SUM(quantity) as quantity_sold'),
            DB::raw('COUNT(*) as sales_count')
        )
        ->with('product')
        ->groupBy('product_id')
        ->orderByDesc('total_sales');

        // Handle both new signature and old filters array
        if (is_array($userId)) {
            $filters = $userId;
            if (isset($filters['start_date'])) {
                $query->where('date', '>=', $filters['start_date']);
            }
            if (isset($filters['end_date'])) {
                $query->where('date', '<=', $filters['end_date']);
            }
        } else {
            if ($userId) {
                $query->where('user_id', $userId);
            }
            if ($startDate) {
                $query->where('date', '>=', $startDate);
            }
            if ($endDate) {
                $query->where('date', '<=', $endDate);
            }
        }

        return $query->get()->map(function ($item) {
            return [
                'product_id' => (string) $item->product_id,
                'product_name' => $item->product ? $item->product->name : 'Unknown Product',
                'total_sales' => (float) $item->total_sales,
                'total_profit' => (float) $item->total_profit,
                'total_quantity' => (float) $item->quantity_sold,
                'total_revenue' => (float) $item->total_sales,
                'sales_count' => $item->sales_count,
                // Legacy keys for backward compatibility
                'productId' => (string) $item->product_id,
                'productName' => $item->product ? $item->product->name : 'Unknown Product',
                'totalSales' => (float) $item->total_sales,
                'totalProfit' => (float) $item->total_profit,
                'quantitySold' => (float) $item->quantity_sold,
                'salesCount' => $item->sales_count,
            ];
        })->toArray();
    }

    /**
     * Get sales report for a specific user and date range
     */
    public function getSalesReport($userId, $startDate, $endDate): array
    {
        $sales = Sale::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        $totalSales = $sales->sum('total_amount');
        $totalProfit = $sales->sum('profit');
        $totalTransactions = $sales->count();
        $totalItemsSold = $sales->sum('quantity');

        // Payment breakdown
        $paymentBreakdown = $sales->groupBy('payment_method')->map(function ($items) {
            return $items->sum('total_amount');
        })->toArray();

        // Calculate metrics
        $averageTransactionValue = $totalTransactions > 0 ? $totalSales / $totalTransactions : 0;
        $profitMargin = $totalSales > 0 ? ($totalProfit / $totalSales) * 100 : 0;

        return [
            'total_sales' => (float) $totalSales,
            'total_profit' => (float) $totalProfit,
            'total_transactions' => $totalTransactions,
            'total_items_sold' => (float) $totalItemsSold,
            'average_transaction_value' => (float) $averageTransactionValue,
            'profit_margin' => (float) $profitMargin,
            'payment_breakdown' => $paymentBreakdown,
        ];
    }

    /**
     * Get dashboard statistics
     */
    public function getDashboardStats(): array
    {
        $today = Carbon::today();

        // Today's sales and profit
        $todaySummary = ProfitSummary::where('date', $today)->first();
        
        if (!$todaySummary) {
            $todaySummary = $this->calculateDailySummary($today);
        }

        // Payment method breakdown for today
        $paymentBreakdown = $this->getPaymentMethodBreakdown($today, $today);

        // Product counts
        $totalProducts = Product::count();
        $activeProducts = Product::active()->count();
        $lowStockProducts = Product::active()->lowStock()->count();

        return [
            'todaySales' => (float) $todaySummary->total_sales,
            'todayProfit' => (float) $todaySummary->total_profit,
            'todaySalesCount' => $todaySummary->sales_count,
            'cashSales' => (float) $paymentBreakdown['cash'],
            'posSales' => (float) $paymentBreakdown['pos'],
            'bankTransferSales' => (float) $paymentBreakdown['bank_transfer'],
            'lowStockCount' => $lowStockProducts,
            'totalProducts' => $totalProducts,
            'activeProducts' => $activeProducts,
        ];
    }

    /**
     * Get payment method breakdown for a date range
     */
    public function getPaymentMethodBreakdown(Carbon $startDate, Carbon $endDate): array
    {
        $sales = Sale::whereBetween('date', [$startDate, $endDate])
            ->select('payment_method', DB::raw('SUM(total_amount) as total'))
            ->groupBy('payment_method')
            ->get()
            ->pluck('total', 'payment_method')
            ->toArray();

        return [
            'cash' => $sales['cash'] ?? 0,
            'pos' => $sales['pos'] ?? 0,
            'bank_transfer' => $sales['bank_transfer'] ?? 0,
        ];
    }

    /**
     * Get comprehensive date range summary
     * Backend-driven aggregation for Reports page
     * 
     * @param string $startDate
     * @param string $endDate
     * @param string $period
     * @return array
     */
    public function getDateRangeSummary(string $startDate, string $endDate, string $period = 'daily'): array
    {
        // Get all sales in date range
        $sales = Sale::with('product')
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get();

        // Calculate totals
        $totalSales = $sales->sum('total_amount');
        $totalProfit = $sales->sum('profit');
        $salesCount = $sales->count();

        // Group by date for chart data
        $chartData = [];
        $salesByDate = $sales->groupBy(function ($sale) {
            return $sale->date->format('Y-m-d');
        });

        foreach ($salesByDate as $date => $dateSales) {
            $chartData[] = [
                'date' => $date,
                'sales' => (float) $dateSales->sum('total_amount'),
                'profit' => (float) $dateSales->sum('profit'),
                'count' => $dateSales->count(),
            ];
        }

        // Unit distribution
        $unitDistribution = [];
        $salesByUnit = $sales->groupBy('unit');
        
        foreach ($salesByUnit as $unit => $unitSales) {
            $unitDistribution[] = [
                'unit' => $unit,
                'count' => $unitSales->sum('quantity'),
                'value' => (float) $unitSales->sum('total_amount'),
            ];
        }

        // Top products (already have from product performance endpoint)
        $topProducts = $this->getProductPerformance([
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);

        // Payment method breakdown
        $paymentBreakdown = $this->getPaymentMethodBreakdown(
            Carbon::parse($startDate),
            Carbon::parse($endDate)
        );

        return [
            'totalSales' => (float) $totalSales,
            'totalProfit' => (float) $totalProfit,
            'salesCount' => $salesCount,
            'paymentBreakdown' => [
                'cash' => (float) $paymentBreakdown['cash'],
                'pos' => (float) $paymentBreakdown['pos'],
                'bankTransfer' => (float) $paymentBreakdown['bank_transfer'],
            ],
            'chartData' => $chartData,
            'unitDistribution' => $unitDistribution,
            'topProducts' => array_slice($topProducts, 0, 5),
            'allProducts' => $topProducts,
        ];
    }
}
