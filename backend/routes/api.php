<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\SalesController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\StoreSettingsController;
use App\Http\Controllers\Api\ReceiptController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    
    // Email verification OTP routes
    Route::post('/send-email-verification-otp', [AuthController::class, 'sendEmailVerificationOTP']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    
    // Password reset OTP routes
    Route::post('/send-password-reset-otp', [AuthController::class, 'sendPasswordResetOTP']);
    Route::post('/verify-password-reset-otp', [AuthController::class, 'verifyPasswordResetOTP']);
    Route::post('/reset-password-with-otp', [AuthController::class, 'resetPasswordWithOTP']);
    
    // Resend OTP
    Route::post('/resend-otp', [AuthController::class, 'resendOTP']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/account', [AuthController::class, 'updateAccount']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    // Store Settings
    Route::prefix('store-settings')->group(function () {
        Route::get('/', [StoreSettingsController::class, 'index']);
        Route::post('/', [StoreSettingsController::class, 'store']);
        Route::put('/', [StoreSettingsController::class, 'update']);
        Route::post('/upload-logo', [StoreSettingsController::class, 'uploadLogo']);
        Route::delete('/logo', [StoreSettingsController::class, 'deleteLogo']);
    });

    // Products
    Route::apiResource('products', ProductController::class);
    Route::patch('products/{product}/stock', [ProductController::class, 'updateStock']);

    // Stock Management
    Route::prefix('stock')->group(function () {
        Route::get('/daily', [StockController::class, 'getDailyStock']);
        Route::put('/daily/{dailyStock}', [StockController::class, 'updateDailyStock']);
        Route::post('/add', [StockController::class, 'addStock']);
        Route::get('/additions', [StockController::class, 'getStockAdditions']);
        Route::put('/additions/{stockAddition}', [StockController::class, 'updateStockAddition']);
        Route::patch('/additions/{stockAddition}', [StockController::class, 'updateStockAddition']);
    });

    // Sales
    Route::prefix('sales')->group(function () {
        Route::get('/', [SalesController::class, 'index']);
        Route::post('/', [SalesController::class, 'store']);
        Route::get('/{sale}', [SalesController::class, 'show']);
        Route::put('/{sale}', [SalesController::class, 'update']);
        Route::patch('/{sale}', [SalesController::class, 'update']);
        Route::delete('/{sale}', [SalesController::class, 'destroy']);
    });

    // Receipts
    Route::prefix('receipts')->group(function () {
        Route::get('/{sale}', [ReceiptController::class, 'show']);
        Route::get('/{sale}/download', [ReceiptController::class, 'download']);
    });

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('/daily', [ReportController::class, 'dailySummary']);
        Route::get('/weekly', [ReportController::class, 'weeklySummary']);
        Route::get('/monthly', [ReportController::class, 'monthlySummary']);
        Route::get('/products', [ReportController::class, 'productPerformance']);
        Route::get('/summary', [ReportController::class, 'dateRangeSummary']);
    });
});
