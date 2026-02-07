<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockAddition extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
        'cost_price',
        'total_cost',
        'supplier',
        'date',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'cost_price' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'date' => 'date',
    ];

    // Relationships
    
    /**
     * Get the user that owns the stock addition.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product for the stock addition (including soft-deleted products).
     */
    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed()->withoutGlobalScope('user');
    }

    /**
     * Boot the model and add global scope for multi-tenancy.
     */
    protected static function booted()
    {
        // Automatically scope queries to current user
        static::addGlobalScope('user', function ($builder) {
            if (auth()->check()) {
                $builder->where('user_id', auth()->id());
            }
        });

        // Automatically set user_id and calculate total_cost on create
        static::creating(function ($addition) {
            if (auth()->check() && !$addition->user_id) {
                $addition->user_id = auth()->id();
            }
            $addition->total_cost = $addition->quantity * $addition->cost_price;
        });
    }
}
