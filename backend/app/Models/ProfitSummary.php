<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfitSummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'total_sales',
        'total_cost',
        'total_profit',
        'sales_count',
    ];

    protected $casts = [
        'date' => 'date',
        'total_sales' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'total_profit' => 'decimal:2',
        'sales_count' => 'integer',
    ];

    // Scopes
    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }

    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    // Accessors
    public function getProfitMarginAttribute(): float
    {
        if ($this->total_sales <= 0) {
            return 0;
        }
        return ($this->total_profit / $this->total_sales) * 100;
    }
}
