<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockAddition extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'quantity',
        'cost_price',
        'total_cost',
        'supplier',
        'date',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'date' => 'date',
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($addition) {
            $addition->total_cost = $addition->quantity * $addition->cost_price;
        });
    }
}
