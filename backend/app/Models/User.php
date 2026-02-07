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
        'email_verified_at',
        'email_verification_otp',
        'email_verification_otp_expires_at',
        'email_verification_attempts',
        'password_reset_otp',
        'password_reset_otp_expires_at',
        'password_reset_attempts',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'email_verification_otp',
        'password_reset_otp',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'email_verification_otp_expires_at' => 'datetime',
        'password_reset_otp_expires_at' => 'datetime',
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

    /**
     * Get all email verifications for the user.
     */
    public function emailVerifications()
    {
        return $this->hasMany(EmailVerification::class);
    }

    // Email Verification Methods

    /**
     * Check if user's email is verified
     */
    public function hasVerifiedEmail(): bool
    {
        return !is_null($this->email_verified_at);
    }

    /**
     * Mark the user's email as verified
     */
    public function markEmailAsVerified(): bool
    {
        return $this->forceFill([
            'email_verified_at' => now(),
            'email_verification_otp' => null,
            'email_verification_otp_expires_at' => null,
            'email_verification_attempts' => 0,
        ])->save();
    }

    /**
     * Check if email verification OTP is valid and not expired
     */
    public function hasValidEmailVerificationOTP(): bool
    {
        return !is_null($this->email_verification_otp) 
            && !is_null($this->email_verification_otp_expires_at)
            && now()->isBefore($this->email_verification_otp_expires_at);
    }

    /**
     * Check if password reset OTP is valid and not expired
     */
    public function hasValidPasswordResetOTP(): bool
    {
        return !is_null($this->password_reset_otp) 
            && !is_null($this->password_reset_otp_expires_at)
            && now()->isBefore($this->password_reset_otp_expires_at);
    }
}
