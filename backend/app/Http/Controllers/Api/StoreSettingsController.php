<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSettingRequest;
use App\Models\StoreSetting;
use Illuminate\Http\Request;

class StoreSettingsController extends Controller
{
    /**
     * Get the authenticated user's store settings.
     */
    public function index(Request $request)
    {
        $storeSetting = $request->user()->storeSetting;

        if (!$storeSetting) {
            return response()->json([
                'success' => true,
                'message' => 'No store settings found',
                'data' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Store settings retrieved successfully',
            'data' => [
                'id' => (string) $storeSetting->id,
                'storeName' => $storeSetting->store_name,
                'storeLogo' => $storeSetting->store_logo,
                'createdAt' => $storeSetting->created_at->toIso8601String(),
                'updatedAt' => $storeSetting->updated_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Create or update the authenticated user's store settings.
     */
    public function store(StoreSettingRequest $request)
    {
        $user = $request->user();

        $storeSetting = StoreSetting::updateOrCreate(
            ['user_id' => $user->id],
            [
                'store_name' => $request->store_name,
                'store_logo' => $request->store_logo,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Store settings saved successfully',
            'data' => [
                'id' => (string) $storeSetting->id,
                'storeName' => $storeSetting->store_name,
                'storeLogo' => $storeSetting->store_logo,
                'createdAt' => $storeSetting->created_at->toIso8601String(),
                'updatedAt' => $storeSetting->updated_at->toIso8601String(),
            ],
        ], $storeSetting->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Update the authenticated user's store settings.
     */
    public function update(StoreSettingRequest $request)
    {
        $user = $request->user();
        $storeSetting = $user->storeSetting;

        if (!$storeSetting) {
            return response()->json([
                'success' => false,
                'message' => 'Store settings not found. Please create settings first.',
            ], 404);
        }

        $storeSetting->update([
            'store_name' => $request->store_name,
            'store_logo' => $request->store_logo,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Store settings updated successfully',
            'data' => [
                'id' => (string) $storeSetting->id,
                'storeName' => $storeSetting->store_name,
                'storeLogo' => $storeSetting->store_logo,
                'createdAt' => $storeSetting->created_at->toIso8601String(),
                'updatedAt' => $storeSetting->updated_at->toIso8601String(),
            ],
        ]);
    }
}
