<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            if (!Schema::hasColumn('sales', 'description')) {
                $table->text('description')->nullable()->after('payment_method');
            }
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->decimal('quantity', 10, 4)->change();
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            if (Schema::hasColumn('sales', 'description')) {
                $table->dropColumn('description');
            }
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->decimal('quantity', 10, 2)->change();
        });
    }
};
