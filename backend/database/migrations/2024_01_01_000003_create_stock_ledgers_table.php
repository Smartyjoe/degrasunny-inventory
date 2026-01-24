<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_ledgers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->decimal('opening_stock', 10, 2)->default(0);
            $table->decimal('stock_added', 10, 2)->default(0);
            $table->decimal('stock_sold', 10, 2)->default(0);
            $table->decimal('closing_stock', 10, 2)->default(0);
            $table->boolean('manually_edited')->default(false);
            $table->timestamps();
            
            $table->unique(['product_id', 'date']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_ledgers');
    }
};
