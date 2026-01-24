<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockLedger extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'date',
        'opening_stock',
        'stock_added',
        'stock_sold',
        'closing_stock',
        'manually_edited',
    ];

    protected $casts = [
        'date' => 'date',
        'opening_stock' => 'decimal:2',
        'stock_added' => 'decimal:2',
        'stock_sold' => 'decimal:2',
        'closing_stock' => 'decimal:2',
        'manually_edited' => 'boolean',
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Business Logic
    public function calculateClosingStock(): float
    {
        return $this->opening_stock + $this->stock_added - $this->stock_sold;
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($ledger) {
            if (!$ledger->manually_edited) {
                $ledger->closing_stock = $ledger->calculateClosingStock();
            }
        });
    }
}
