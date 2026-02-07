<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('current_stock', 10, 4)->change();
            $table->decimal('reorder_level', 10, 4)->change();
        });

        Schema::table('stock_additions', function (Blueprint $table) {
            $table->decimal('quantity', 10, 4)->change();
        });

        Schema::table('stock_ledgers', function (Blueprint $table) {
            $table->decimal('opening_stock', 10, 4)->change();
            $table->decimal('stock_added', 10, 4)->change();
            $table->decimal('stock_sold', 10, 4)->change();
            $table->decimal('closing_stock', 10, 4)->change();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('current_stock', 10, 2)->change();
            $table->decimal('reorder_level', 10, 2)->change();
        });

        Schema::table('stock_additions', function (Blueprint $table) {
            $table->decimal('quantity', 10, 2)->change();
        });

        Schema::table('stock_ledgers', function (Blueprint $table) {
            $table->decimal('opening_stock', 10, 2)->change();
            $table->decimal('stock_added', 10, 2)->change();
            $table->decimal('stock_sold', 10, 2)->change();
            $table->decimal('closing_stock', 10, 2)->change();
        });
    }
};
