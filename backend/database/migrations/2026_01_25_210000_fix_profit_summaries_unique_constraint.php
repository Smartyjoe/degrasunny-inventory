<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('profit_summaries', function (Blueprint $table) {
            // Drop the old unique constraint on date only
            $table->dropUnique(['date']);
            
            // Add composite unique constraint on user_id and date
            $table->unique(['user_id', 'date'], 'profit_summaries_user_date_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profit_summaries', function (Blueprint $table) {
            // Drop the composite unique constraint
            $table->dropUnique('profit_summaries_user_date_unique');
            
            // Restore the old unique constraint on date only
            $table->unique('date');
        });
    }
};
