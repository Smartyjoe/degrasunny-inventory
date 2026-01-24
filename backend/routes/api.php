<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\SalesController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;

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
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
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
    });

    // Sales
    Route::prefix('sales')->group(function () {
        Route::get('/', [SalesController::class, 'index']);
        Route::post('/', [SalesController::class, 'store']);
        Route::get('/{sale}', [SalesController::class, 'show']);
        Route::delete('/{sale}', [SalesController::class, 'destroy']);
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
