<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
        'unit',
        'unit_price',
        'total_amount',
        'cost_equivalent',
        'profit',
        'date',
        'payment_method',
        'description',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'cost_equivalent' => 'decimal:2',
        'profit' => 'decimal:2',
        'date' => 'date',
    ];

    protected $with = ['product'];

    // Relationships
    
    /**
     * Get the user that owns the sale.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product for the sale (including soft-deleted products).
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
        static::creating(function ($sale) {
            if (auth()->check() && !$sale->user_id) {
                $sale->user_id = auth()->id();
            }
        });
    }

    // Scopes
    public function scopeToday($query)
    {
        return $query->whereDate('date', today());
    }

    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    // Accessors
    public function getProductNameAttribute(): string
    {
        return $this->product->name ?? 'Unknown Product';
    }

    public function getProfitMarginAttribute(): float
    {
        if ($this->total_amount <= 0) {
            return 0;
        }
        return ($this->profit / $this->total_amount) * 100;
    }
}
