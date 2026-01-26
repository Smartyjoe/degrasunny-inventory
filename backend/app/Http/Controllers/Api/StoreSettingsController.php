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
     * Issue 3 & 4 Fix: Proper validation, error handling, and file storage
     */
    public function uploadLogo(Request $request)
    {
        // Issue 3 Fix: Accept multiple image formats and increase size limit
        $request->validate([
            'logo' => 'required|file|mimes:jpg,jpeg,png,webp|max:25600', // 25MB max
        ], [
            'logo.required' => 'Please select a logo file to upload',
            'logo.file' => 'The logo must be a valid file',
            'logo.mimes' => 'The logo must be a JPG, JPEG, PNG, or WEBP image',
            'logo.max' => 'The logo file size must not exceed 25MB',
        ]);

        try {
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

            // Issue 4 Fix: Store with unique filename to prevent overwrites
            $file = $request->file('logo');
            $filename = time() . '_' . $user->id . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $logoPath = $file->storeAs('store_logos', $filename, 'public');
            
            $storeSetting->update(['store_logo' => $logoPath]);

            return response()->json([
                'success' => true,
                'message' => 'Logo uploaded successfully',
                'data' => [
                    'storeLogo' => asset('storage/' . $logoPath),
                ],
            ]);
        } catch (\Exception $e) {
            // Issue 4 Fix: Proper error handling with logging
            \Log::error('Logo upload failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to upload logo. Please try again or contact support.',
                'error' => config('app.debug') ? $e->getMessage() : 'Upload error',
            ], 500);
        }
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

        // Handle logo upload (with error handling)
        if ($request->hasFile('store_logo')) {
            try {
                $file = $request->file('store_logo');
                $filename = time() . '_' . $user->id . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $logoPath = $file->storeAs('store_logos', $filename, 'public');
                $data['store_logo'] = $logoPath;
            } catch (\Exception $e) {
                \Log::error('Logo upload failed in store()', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
                // Continue without logo if upload fails
            }
        } elseif ($request->has('store_logo')) {
            // If it's a base64 string or URL
            $data['store_logo'] = $request->store_logo;
        }

        $storeSetting = StoreSetting::updateOrCreate(
            ['user_id' => $user->id],
            $data
        );

        // IMPORTANT: Also update the user's business_name to keep them in sync
        $user->update(['business_name' => $request->store_name]);

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

        // Handle logo upload (with error handling)
        if ($request->hasFile('store_logo')) {
            try {
                // Delete old logo if exists
                if ($storeSetting->store_logo && \Storage::disk('public')->exists($storeSetting->store_logo)) {
                    \Storage::disk('public')->delete($storeSetting->store_logo);
                }
                
                $file = $request->file('store_logo');
                $filename = time() . '_' . $user->id . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $logoPath = $file->storeAs('store_logos', $filename, 'public');
                $data['store_logo'] = $logoPath;
            } catch (\Exception $e) {
                \Log::error('Logo upload failed in update()', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
                // Continue without logo update if upload fails
            }
        } elseif ($request->has('store_logo') && $request->store_logo !== null) {
            // If it's a base64 string or URL
            $data['store_logo'] = $request->store_logo;
        }

        $storeSetting->update($data);

        // IMPORTANT: Also update the user's business_name to keep them in sync
        $user->update(['business_name' => $request->store_name]);

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
