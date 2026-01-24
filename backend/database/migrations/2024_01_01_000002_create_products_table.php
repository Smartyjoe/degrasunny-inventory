<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->default('general');
            $table->string('unit_type')->default('bag');
            $table->decimal('current_stock', 10, 2)->default(0);
            $table->decimal('cost_price', 10, 2)->default(0);
            $table->decimal('selling_price', 10, 2)->default(0);
            $table->boolean('is_retail_enabled')->default(false);
            $table->integer('cups_per_bag')->nullable();
            $table->integer('buckets_per_bag')->nullable();
            $table->decimal('cup_price', 10, 2)->nullable();
            $table->decimal('bucket_price', 10, 2)->nullable();
            $table->decimal('reorder_level', 10, 2)->default(10);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
