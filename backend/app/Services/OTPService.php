<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class OTPService
{
    /**
     * Generate a secure OTP code
     */
    public function generate(int $length = 6): string
    {
        $otp = '';
        for ($i = 0; $i < $length; $i++) {
            $otp .= random_int(0, 9);
        }
        return $otp;
    }

    /**
     * Generate and store email verification OTP for user
     */
    public function generateEmailVerificationOTP(User $user): string
    {
        $otp = $this->generate(config('app.otp_length', 6));
        $expiryMinutes = config('app.otp_expiry_minutes', 10);

        $user->update([
            'email_verification_otp' => $otp,
            'email_verification_otp_expires_at' => now()->addMinutes($expiryMinutes),
            'email_verification_attempts' => 0,
        ]);

        return $otp;
    }

    /**
     * Generate and store password reset OTP for user
     */
    public function generatePasswordResetOTP(User $user): string
    {
        $otp = $this->generate(config('app.otp_length', 6));
        $expiryMinutes = config('app.otp_expiry_minutes', 10);

        $user->update([
            'password_reset_otp' => $otp,
            'password_reset_otp_expires_at' => now()->addMinutes($expiryMinutes),
            'password_reset_attempts' => 0,
        ]);

        return $otp;
    }

    /**
     * Validate email verification OTP
     */
    public function validateEmailVerificationOTP(User $user, string $otp): array
    {
        // Check if OTP exists
        if (!$user->email_verification_otp) {
            return ['valid' => false, 'message' => 'No OTP found. Please request a new one.'];
        }

        // Check if OTP has expired
        if (now()->isAfter($user->email_verification_otp_expires_at)) {
            return ['valid' => false, 'message' => 'OTP has expired. Please request a new one.'];
        }

        // Check max attempts
        $maxAttempts = config('app.otp_max_attempts', 5);
        if ($user->email_verification_attempts >= $maxAttempts) {
            return ['valid' => false, 'message' => 'Maximum attempts exceeded. Please request a new OTP.'];
        }

        // Increment attempts
        $user->increment('email_verification_attempts');

        // Validate OTP
        if ($user->email_verification_otp !== $otp) {
            $remainingAttempts = $maxAttempts - $user->email_verification_attempts;
            return [
                'valid' => false,
                'message' => "Invalid OTP. You have {$remainingAttempts} attempt(s) remaining.",
            ];
        }

        // OTP is valid - mark email as verified and clear OTP data
        $user->update([
            'email_verified_at' => now(),
            'email_verification_otp' => null,
            'email_verification_otp_expires_at' => null,
            'email_verification_attempts' => 0,
        ]);

        return ['valid' => true, 'message' => 'Email verified successfully.'];
    }

    /**
     * Validate password reset OTP
     */
    public function validatePasswordResetOTP(User $user, string $otp): array
    {
        // Check if OTP exists
        if (!$user->password_reset_otp) {
            return ['valid' => false, 'message' => 'No OTP found. Please request a new one.'];
        }

        // Check if OTP has expired
        if (now()->isAfter($user->password_reset_otp_expires_at)) {
            return ['valid' => false, 'message' => 'OTP has expired. Please request a new one.'];
        }

        // Check max attempts
        $maxAttempts = config('app.otp_max_attempts', 5);
        if ($user->password_reset_attempts >= $maxAttempts) {
            return ['valid' => false, 'message' => 'Maximum attempts exceeded. Please request a new OTP.'];
        }

        // Increment attempts
        $user->increment('password_reset_attempts');

        // Validate OTP
        if ($user->password_reset_otp !== $otp) {
            $remainingAttempts = $maxAttempts - $user->password_reset_attempts;
            return [
                'valid' => false,
                'message' => "Invalid OTP. You have {$remainingAttempts} attempt(s) remaining.",
            ];
        }

        return ['valid' => true, 'message' => 'OTP verified successfully.'];
    }

    /**
     * Clear password reset OTP after successful password reset
     */
    public function clearPasswordResetOTP(User $user): void
    {
        $user->update([
            'password_reset_otp' => null,
            'password_reset_otp_expires_at' => null,
            'password_reset_attempts' => 0,
        ]);
    }

    /**
     * Check if user can request a new OTP (rate limiting)
     */
    public function canRequestOTP(string $identifier, string $type = 'email_verification'): array
    {
        $cacheKey = "otp_request:{$type}:{$identifier}";
        $lastRequest = Cache::get($cacheKey);

        if ($lastRequest) {
            $waitTime = 60 - now()->diffInSeconds($lastRequest);
            if ($waitTime > 0) {
                return [
                    'can_request' => false,
                    'message' => "Please wait {$waitTime} seconds before requesting a new OTP.",
                    'wait_time' => $waitTime,
                ];
            }
        }

        // Update cache with current timestamp
        Cache::put($cacheKey, now(), now()->addMinutes(1));

        return ['can_request' => true];
    }

    /**
     * Cleanup expired OTPs
     */
    public function cleanupExpiredOTPs(): int
    {
        $count = User::where(function ($query) {
            $query->where('email_verification_otp_expires_at', '<', now())
                  ->whereNotNull('email_verification_otp');
        })->orWhere(function ($query) {
            $query->where('password_reset_otp_expires_at', '<', now())
                  ->whereNotNull('password_reset_otp');
        })->update([
            'email_verification_otp' => null,
            'email_verification_otp_expires_at' => null,
            'email_verification_attempts' => 0,
            'password_reset_otp' => null,
            'password_reset_otp_expires_at' => null,
            'password_reset_attempts' => 0,
        ]);

        return $count;
    }
}
