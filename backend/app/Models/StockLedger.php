<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockLedger extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
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
        'opening_stock' => 'decimal:4',
        'stock_added' => 'decimal:4',
        'stock_sold' => 'decimal:4',
        'closing_stock' => 'decimal:4',
        'manually_edited' => 'boolean',
    ];

    // Relationships
    
    /**
     * Get the user that owns the stock ledger.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product for the stock ledger (including soft-deleted products).
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

        // Automatically set user_id on create
        static::creating(function ($ledger) {
            if (auth()->check() && !$ledger->user_id) {
                $ledger->user_id = auth()->id();
            }
        });
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
