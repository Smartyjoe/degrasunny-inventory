<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportingService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        protected ReportingService $reportingService
    ) {}

    /**
     * Get dashboard statistics
     */
    public function getStats(): JsonResponse
    {
        $stats = $this->reportingService->getDashboardStats();

        return response()->json([
            'success' => true,
            'message' => 'Dashboard stats retrieved successfully',
            'data' => $stats,
        ]);
    }
}
