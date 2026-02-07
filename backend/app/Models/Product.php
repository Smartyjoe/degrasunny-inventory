<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'category',
        'unit_type',
        'current_stock',
        'cost_price',
        'selling_price',
        'is_retail_enabled',
        'cups_per_bag',
        'buckets_per_bag',
        'cup_price',
        'bucket_price',
        'reorder_level',
        'is_active',
    ];

    protected $casts = [
        'current_stock' => 'decimal:4',
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'cup_price' => 'decimal:2',
        'bucket_price' => 'decimal:2',
        'reorder_level' => 'decimal:4',
        'is_retail_enabled' => 'boolean',
        'is_active' => 'boolean',
        'cups_per_bag' => 'integer',
        'buckets_per_bag' => 'integer',
    ];

    // Relationships
    
    /**
     * Get the user that owns the product.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function stockLedgers()
    {
        return $this->hasMany(StockLedger::class);
    }

    public function stockAdditions()
    {
        return $this->hasMany(StockAddition::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
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
        static::creating(function ($product) {
            if (auth()->check() && !$product->user_id) {
                $product->user_id = auth()->id();
            }
        });
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereRaw('current_stock <= reorder_level');
    }

    // Accessors & Mutators
    public function getIsLowStockAttribute(): bool
    {
        return $this->current_stock <= $this->reorder_level;
    }

    public function getProfitMarginAttribute(): float
    {
        if ($this->selling_price <= 0) {
            return 0;
        }
        return (($this->selling_price - $this->cost_price) / $this->selling_price) * 100;
    }
}
