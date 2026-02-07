<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\SendEmailVerificationRequest;
use App\Http\Requests\VerifyEmailRequest;
use App\Http\Requests\SendPasswordResetOTPRequest;
use App\Http\Requests\VerifyPasswordResetOTPRequest;
use App\Http\Requests\ResetPasswordWithOTPRequest;
use App\Models\User;
use App\Models\StoreSetting;
use App\Services\OTPService;
use App\Services\BrevoEmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected $otpService;
    protected $brevoService;

    public function __construct(OTPService $otpService, BrevoEmailService $brevoService)
    {
        $this->otpService = $otpService;
        $this->brevoService = $brevoService;
    }
    /**
     * Login user
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Create token
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'businessName' => $user->business_name,
                    'createdAt' => $user->created_at->toIso8601String(),
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Register new user
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'business_name' => $request->business_name,
            'role' => 'trader',
        ]);

        // Auto-create store settings with user's business name
        StoreSetting::create([
            'user_id' => $user->id,
            'store_name' => $request->business_name ?? $request->name . "'s Store",
            'store_logo' => null,
        ]);

        // Generate and send email verification OTP
        try {
            $otp = $this->otpService->generateEmailVerificationOTP($user);
            $this->brevoService->sendEmailVerificationOTP($user->email, $user->name, $otp);
        } catch (\Exception $e) {
            Log::error('Failed to send verification email', ['error' => $e->getMessage()]);
        }

        // Create token
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful. Please verify your email.',
            'data' => [
                'user' => [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'businessName' => $user->business_name,
                    'emailVerified' => $user->hasVerifiedEmail(),
                    'createdAt' => $user->created_at->toIso8601String(),
                ],
                'token' => $token,
                'emailVerificationRequired' => true,
            ],
        ], 201);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful',
            'data' => null,
        ]);
    }

    /**
     * Get current user
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'message' => 'User retrieved successfully',
            'data' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'businessName' => $user->business_name,
                'createdAt' => $user->created_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'success' => true,
                'message' => 'Password reset link sent to your email',
                'data' => [
                    'message' => 'Password reset link sent to your email',
                ],
            ]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    /**
     * Update user account name
     */
    public function updateAccount(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user = $request->user();
        $user->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Account updated successfully',
            'data' => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'businessName' => $user->business_name,
                'createdAt' => $user->created_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Reset user password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        // Validate password strength
        if (strlen($request->new_password) < 8) {
            throw ValidationException::withMessages([
                'new_password' => ['Password must be at least 8 characters long.'],
            ]);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        // Revoke all existing tokens
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully. Please login with your new password.',
            'data' => [
                'token' => $token,
            ],
        ]);
    }

    /**
     * Send email verification OTP
     */
    public function sendEmailVerificationOTP(SendEmailVerificationRequest $request): JsonResponse
    {
        try {
            $user = User::where('email', $request->email)->first();

            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email is already verified.',
                ], 400);
            }

            $canRequest = $this->otpService->canRequestOTP($user->email, 'email_verification');
            if (!$canRequest['can_request']) {
                return response()->json([
                    'success' => false,
                    'message' => $canRequest['message'],
                    'data' => ['waitTime' => $canRequest['wait_time']],
                ], 429);
            }

            $otp = $this->otpService->generateEmailVerificationOTP($user);
            $result = $this->brevoService->sendEmailVerificationOTP($user->email, $user->name, $otp);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send verification email. Please try again.',
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Verification code sent to your email.',
                'data' => ['expiresInMinutes' => config('app.otp_expiry_minutes', 10)],
            ]);
        } catch (\Exception $e) {
            Log::error('Send email verification OTP failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification code',
            ], 500);
        }
    }

    /**
     * Verify email with OTP
     */
    public function verifyEmail(VerifyEmailRequest $request): JsonResponse
    {
        try {
            $user = User::where('email', $request->email)->first();

            $result = $this->otpService->validateEmailVerificationOTP($user, $request->otp);

            if (!$result['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                ], 400);
            }

            // Send welcome email
            try {
                $this->brevoService->sendWelcomeEmail($user->email, $user->name);
            } catch (\Exception $e) {
                Log::error('Failed to send welcome email', ['error' => $e->getMessage()]);
            }

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => [
                    'user' => [
                        'id' => (string) $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'businessName' => $user->business_name,
                        'emailVerified' => $user->hasVerifiedEmail(),
                        'createdAt' => $user->created_at->toIso8601String(),
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Email verification failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Email verification failed',
            ], 500);
        }
    }

    /**
     * Send password reset OTP
     */
    public function sendPasswordResetOTP(SendPasswordResetOTPRequest $request): JsonResponse
    {
        try {
            $user = User::where('email', $request->email)->first();

            $canRequest = $this->otpService->canRequestOTP($user->email, 'password_reset');
            if (!$canRequest['can_request']) {
                return response()->json([
                    'success' => false,
                    'message' => $canRequest['message'],
                    'data' => ['waitTime' => $canRequest['wait_time']],
                ], 429);
            }

            $otp = $this->otpService->generatePasswordResetOTP($user);
            $result = $this->brevoService->sendPasswordResetOTP($user->email, $user->name, $otp);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send password reset email. Please try again.',
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Password reset code sent to your email.',
                'data' => ['expiresInMinutes' => config('app.otp_expiry_minutes', 10)],
            ]);
        } catch (\Exception $e) {
            Log::error('Send password reset OTP failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to send password reset code',
            ], 500);
        }
    }

    /**
     * Verify password reset OTP
     */
    public function verifyPasswordResetOTP(VerifyPasswordResetOTPRequest $request): JsonResponse
    {
        try {
            $user = User::where('email', $request->email)->first();

            $result = $this->otpService->validatePasswordResetOTP($user, $request->otp);

            if (!$result['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => ['verified' => true],
            ]);
        } catch (\Exception $e) {
            Log::error('Password reset OTP verification failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'OTP verification failed',
            ], 500);
        }
    }

    /**
     * Reset password with verified OTP
     */
    public function resetPasswordWithOTP(ResetPasswordWithOTPRequest $request): JsonResponse
    {
        try {
            $user = User::where('email', $request->email)->first();

            $result = $this->otpService->validatePasswordResetOTP($user, $request->otp);

            if (!$result['valid']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                ], 400);
            }

            $user->update([
                'password' => Hash::make($request->password),
            ]);

            $this->otpService->clearPasswordResetOTP($user);
            $user->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully. Please login with your new password.',
            ]);
        } catch (\Exception $e) {
            Log::error('Password reset failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Password reset failed',
            ], 500);
        }
    }

    /**
     * Resend OTP
     */
    public function resendOTP(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email',
                'type' => 'required|in:email_verification,password_reset',
            ]);

            $user = User::where('email', $request->email)->first();

            $canRequest = $this->otpService->canRequestOTP($user->email, $request->type);
            if (!$canRequest['can_request']) {
                return response()->json([
                    'success' => false,
                    'message' => $canRequest['message'],
                    'data' => ['waitTime' => $canRequest['wait_time']],
                ], 429);
            }

            if ($request->type === 'email_verification') {
                if ($user->hasVerifiedEmail()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Email is already verified.',
                    ], 400);
                }

                $otp = $this->otpService->generateEmailVerificationOTP($user);
                $result = $this->brevoService->sendEmailVerificationOTP($user->email, $user->name, $otp);
            } else {
                $otp = $this->otpService->generatePasswordResetOTP($user);
                $result = $this->brevoService->sendPasswordResetOTP($user->email, $user->name, $otp);
            }

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to resend code. Please try again.',
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'New code sent to your email.',
                'data' => ['expiresInMinutes' => config('app.otp_expiry_minutes', 10)],
            ]);
        } catch (\Exception $e) {
            Log::error('Resend OTP failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to resend code',
            ], 500);
        }
    }
}
