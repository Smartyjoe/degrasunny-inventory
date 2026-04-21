<?php

namespace App\Console\Commands;

use App\Services\OTPService;
use Illuminate\Console\Command;

class CleanupExpiredOTPsCommand extends Command
{
    protected $signature = 'otp:cleanup';

    protected $description = 'Cleanup expired OTP codes from the database';

    public function handle(OTPService $otpService): int
    {
        $this->info('Cleaning up expired OTP codes...');

        $count = $otpService->cleanupExpiredOTPs();

        $this->info("Successfully cleaned up {$count} expired OTP code(s).");

        return Command::SUCCESS;
    }
}