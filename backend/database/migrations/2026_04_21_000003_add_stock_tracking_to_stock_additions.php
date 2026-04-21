<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_additions', function (Blueprint $table) {
            $table->decimal('stock_before', 12, 2)->nullable()->after('quantity');
            $table->decimal('stock_after', 12, 2)->nullable()->after('stock_before');
        });
    }

    public function down(): void
    {
        Schema::table('stock_additions', function (Blueprint $table) {
            $table->dropColumn(['stock_before', 'stock_after']);
        });
    }
};