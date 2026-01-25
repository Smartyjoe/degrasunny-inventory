<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'business_name',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relationships
    
    /**
     * Get the store settings for the user.
     */
    public function storeSetting()
    {
        return $this->hasOne(StoreSetting::class);
    }

    /**
     * Get all products for the user.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get all sales for the user.
     */
    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    /**
     * Get all stock ledgers for the user.
     */
    public function stockLedgers()
    {
        return $this->hasMany(StockLedger::class);
    }

    /**
     * Get all stock additions for the user.
     */
    public function stockAdditions()
    {
        return $this->hasMany(StockAddition::class);
    }

    /**
     * Get all profit summaries for the user.
     */
    public function profitSummaries()
    {
        return $this->hasMany(ProfitSummary::class);
    }

    /**
     * Get all audit logs for the user.
     */
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}
