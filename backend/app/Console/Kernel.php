<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        //
    ];

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Run daily stock carryforward at midnight
        $schedule->command('stock:carryforward')
            ->dailyAt('00:00')
            ->timezone('Africa/Lagos') // Adjust to your timezone
            ->withoutOverlapping()
            ->runInBackground();

        // Cleanup expired OTP codes daily at 2 AM
        $schedule->command('otp:cleanup')
            ->dailyAt('02:00')
            ->timezone('Africa/Lagos')
            ->withoutOverlapping();

        // Send weekly sales report every Saturday at 8 PM
        $schedule->command('reports:weekly-sales')
            ->weeklyOn(6, '20:00') // Saturday at 8:00 PM
            ->timezone('Africa/Lagos')
            ->withoutOverlapping()
            ->runInBackground();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
