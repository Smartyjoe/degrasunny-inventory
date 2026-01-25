<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'quantity',
        'unit',
        'unit_price',
        'total_amount',
        'cost_equivalent',
        'profit',
        'date',
        'user_id',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'cost_equivalent' => 'decimal:2',
        'profit' => 'decimal:2',
        'date' => 'date',
    ];

    protected $with = ['product'];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
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
