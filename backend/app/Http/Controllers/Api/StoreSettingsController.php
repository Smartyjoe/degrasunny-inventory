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
                'storeLogo' => $storeSetting->store_logo ? asset('storage/' . $storeSetting->store_logo) : null,
                'createdAt' => $storeSetting->created_at->toIso8601String(),
                'updatedAt' => $storeSetting->updated_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Upload store logo
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg|max:2048', // 2MB max
        ]);

        $user = $request->user();
        $storeSetting = $user->storeSetting;

        if (!$storeSetting) {
            $storeSetting = StoreSetting::create([
                'user_id' => $user->id,
                'store_name' => $user->business_name ?? $user->name . "'s Store",
            ]);
        }

        // Delete old logo if exists
        if ($storeSetting->store_logo && \Storage::disk('public')->exists($storeSetting->store_logo)) {
            \Storage::disk('public')->delete($storeSetting->store_logo);
        }

        // Store new logo
        $logoPath = $request->file('logo')->store('store_logos', 'public');
        $storeSetting->update(['store_logo' => $logoPath]);

        return response()->json([
            'success' => true,
            'message' => 'Logo uploaded successfully',
            'data' => [
                'storeLogo' => asset('storage/' . $logoPath),
            ],
        ]);
    }

    /**
     * Delete store logo
     */
    public function deleteLogo(Request $request)
    {
        $user = $request->user();
        $storeSetting = $user->storeSetting;

        if (!$storeSetting || !$storeSetting->store_logo) {
            return response()->json([
                'success' => false,
                'message' => 'No logo to delete',
            ], 404);
        }

        // Delete the file
        if (\Storage::disk('public')->exists($storeSetting->store_logo)) {
            \Storage::disk('public')->delete($storeSetting->store_logo);
        }

        $storeSetting->update(['store_logo' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Logo deleted successfully',
            'data' => null,
        ]);
    }

    /**
     * Create or update the authenticated user's store settings.
     */
    public function store(StoreSettingRequest $request)
    {
        $user = $request->user();

        $data = [
            'store_name' => $request->store_name,
        ];

        // Handle logo upload
        if ($request->hasFile('store_logo')) {
            $logoPath = $request->file('store_logo')->store('store_logos', 'public');
            $data['store_logo'] = $logoPath;
        } elseif ($request->has('store_logo')) {
            // If it's a base64 string or URL
            $data['store_logo'] = $request->store_logo;
        }

        $storeSetting = StoreSetting::updateOrCreate(
            ['user_id' => $user->id],
            $data
        );

        return response()->json([
            'success' => true,
            'message' => 'Store settings saved successfully',
            'data' => [
                'id' => (string) $storeSetting->id,
                'storeName' => $storeSetting->store_name,
                'storeLogo' => $storeSetting->store_logo ? asset('storage/' . $storeSetting->store_logo) : null,
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

        $data = [
            'store_name' => $request->store_name,
        ];

        // Handle logo upload
        if ($request->hasFile('store_logo')) {
            // Delete old logo if exists
            if ($storeSetting->store_logo && \Storage::disk('public')->exists($storeSetting->store_logo)) {
                \Storage::disk('public')->delete($storeSetting->store_logo);
            }
            
            $logoPath = $request->file('store_logo')->store('store_logos', 'public');
            $data['store_logo'] = $logoPath;
        } elseif ($request->has('store_logo') && $request->store_logo !== null) {
            // If it's a base64 string or URL
            $data['store_logo'] = $request->store_logo;
        }

        $storeSetting->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Store settings updated successfully',
            'data' => [
                'id' => (string) $storeSetting->id,
                'storeName' => $storeSetting->store_name,
                'storeLogo' => $storeSetting->store_logo ? asset('storage/' . $storeSetting->store_logo) : null,
                'createdAt' => $storeSetting->created_at->toIso8601String(),
                'updatedAt' => $storeSetting->updated_at->toIso8601String(),
            ],
        ]);
    }
}
