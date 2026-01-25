<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Models\StoreSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
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

        // Create token
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
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
}
