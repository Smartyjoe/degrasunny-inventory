<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfitSummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
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

    // Relationships
    
    /**
     * Get the user that owns the profit summary.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
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
        static::creating(function ($summary) {
            if (auth()->check() && !$summary->user_id) {
                $summary->user_id = auth()->id();
            }
        });
    }

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
