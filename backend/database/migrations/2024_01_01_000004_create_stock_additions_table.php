<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_additions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity', 10, 2);
            $table->decimal('cost_price', 10, 2);
            $table->decimal('total_cost', 10, 2);
            $table->string('supplier')->nullable();
            $table->date('date');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['product_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_additions');
    }
};
