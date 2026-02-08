<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Backfill any existing null current_stock values
        DB::table('products')->whereNull('current_stock')->update(['current_stock' => 0]);

        // Ensure current_stock has a default value
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('current_stock', 10, 2)->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('current_stock', 10, 2)->default(null)->change();
        });
    }
};
