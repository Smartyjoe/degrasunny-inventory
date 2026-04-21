<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\BrevoEmailService;
use App\Services\ReportingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendWeeklySalesReportCommand extends Command
{
    protected $signature = 'reports:weekly-sales';

    protected $description = 'Send weekly sales analysis report to all users';

    public function handle(ReportingService $reportingService, BrevoEmailService $brevoService): int
    {
        $this->info('Starting weekly sales report generation...');

        $users = User::whereNotNull('email_verified_at')->get();
        
        if ($users->isEmpty()) {
            $this->warn('No verified users found to send reports to.');
            return Command::SUCCESS;
        }

        $successCount = 0;
        $failureCount = 0;

        foreach ($users as $user) {
            try {
                $this->info("Generating report for {$user->name} ({$user->email})...");

                $endDate = now()->format('Y-m-d');
                $startDate = now()->subDays(6)->format('Y-m-d');

                $salesData = $reportingService->getSalesReport($user->id, $startDate, $endDate);
                $productPerformance = $reportingService->getProductPerformance($user->id, $startDate, $endDate);

                $htmlContent = view('emails.weekly-sales-report', [
                    'user' => $user,
                    'startDate' => $startDate,
                    'endDate' => $endDate,
                    'salesData' => $salesData,
                    'productPerformance' => $productPerformance,
                    'storeName' => $user->storeSetting->store_name ?? $user->business_name,
                ])->render();

                $result = $brevoService->sendTransactionalEmail([
                    'to_email' => $user->email,
                    'to_name' => $user->name,
                    'subject' => 'Weekly Sales Report - ' . now()->format('M d, Y'),
                    'html_content' => $htmlContent,
                ]);

                if ($result['success']) {
                    $this->info("✓ Report sent to {$user->email}");
                    $successCount++;
                } else {
                    $this->error("✗ Failed to send to {$user->email}: {$result['error']}");
                    $failureCount++;
                }

            } catch (\Exception $e) {
                $this->error("✗ Error for {$user->email}: {$e->getMessage()}");
                Log::error('Weekly report failed for user', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
                $failureCount++;
            }
        }

        $this->info("\nWeekly sales report completed!");
        $this->info("Successfully sent: {$successCount}");
        if ($failureCount > 0) {
            $this->warn("Failed: {$failureCount}");
        }

        return Command::SUCCESS;
    }
}