<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Fix Issue 1: Add composite unique constraint for (user_id, name)
     * This ensures product names are unique per trader, not globally.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Add composite unique constraint: user_id + name
            // This allows different traders to have products with the same name
            $table->unique(['user_id', 'name'], 'products_user_id_name_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique('products_user_id_name_unique');
        });
    }
};
