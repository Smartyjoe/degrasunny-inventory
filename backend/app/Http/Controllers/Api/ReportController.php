<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportingService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        protected ReportingService $reportingService
    ) {}

    /**
     * Get daily summary
     */
    public function dailySummary(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $date = Carbon::parse($request->date);
        $summary = $this->reportingService->getDailySummary($date);

        return response()->json([
            'success' => true,
            'message' => 'Daily summary retrieved successfully',
            'data' => $summary,
        ]);
    }

    /**
     * Get weekly summary
     */
    public function weeklySummary(Request $request): JsonResponse
    {
        $request->validate([
            'weekStart' => 'required|date',
            'weekEnd' => 'required|date',
        ]);

        $weekStart = Carbon::parse($request->weekStart);
        $weekEnd = Carbon::parse($request->weekEnd);
        
        $summary = $this->reportingService->getWeeklySummary($weekStart, $weekEnd);

        return response()->json([
            'success' => true,
            'message' => 'Weekly summary retrieved successfully',
            'data' => $summary,
        ]);
    }

    /**
     * Get monthly summary
     */
    public function monthlySummary(Request $request): JsonResponse
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000',
        ]);

        $summary = $this->reportingService->getMonthlySummary(
            $request->month,
            $request->year
        );

        return response()->json([
            'success' => true,
            'message' => 'Monthly summary retrieved successfully',
            'data' => $summary,
        ]);
    }

    /**
     * Get product performance
     */
    public function productPerformance(Request $request): JsonResponse
    {
        $filters = [];

        if ($request->has('startDate')) {
            $filters['start_date'] = $request->startDate;
        }

        if ($request->has('endDate')) {
            $filters['end_date'] = $request->endDate;
        }

        $performance = $this->reportingService->getProductPerformance($filters);

        return response()->json([
            'success' => true,
            'message' => 'Product performance retrieved successfully',
            'data' => $performance,
        ]);
    }
}
