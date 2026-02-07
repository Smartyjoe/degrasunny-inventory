<?php

namespace App\Console\Commands;

use App\Services\OTPService;
use Illuminate\Console\Command;

class CleanupExpiredOTPsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'otp:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cleanup expired OTP codes from the database';

    /**
     * Execute the console command.
     */
    public function handle(OTPService $otpService): int
    {
        $this->info('Cleaning up expired OTP codes...');

        $count = $otpService->cleanupExpiredOTPs();

        $this->info("Successfully cleaned up {$count} expired OTP code(s).");

        return Command::SUCCESS;
    }
}
