<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SystemSettingResource;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    /**
     * Get public settings (for mobile app)
     * No authentication required
     */
    public function public()
    {
        $settings = SystemSetting::public()
            ->orderBy('group')
            ->orderBy('key')
            ->get();

        // Format as key-value pairs for easier consumption
        $formatted = $settings->mapWithKeys(function ($setting) {
            $value = match ($setting->type) {
                'boolean' => (bool) $setting->value,
                'number' => is_numeric($setting->value) ? (strpos($setting->value, '.') !== false ? (float) $setting->value : (int) $setting->value) : $setting->value,
                'json', 'array' => is_string($setting->value) ? json_decode($setting->value, true) : $setting->value,
                default => $setting->value,
            };
            return [$setting->key => $value];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ]);
    }

    /**
     * Get all settings (admin only)
     */
    public function index(Request $request)
    {
        // Check if user is admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $query = SystemSetting::query();

        // Filter by group
        if ($request->has('group')) {
            $query->forGroup($request->group);
        }

        // Search by key
        if ($request->has('search')) {
            $query->where('key', 'like', '%' . $request->search . '%');
        }

        $settings = $query->orderBy('group')
            ->orderBy('key')
            ->get();

        return SystemSettingResource::collection($settings);
    }

    /**
     * Get setting by key
     */
    public function show(Request $request, $key)
    {
        $setting = SystemSetting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Setting not found',
            ], 404);
        }

        // Check if setting is public or user is admin
        if (!$setting->is_public && !$request->user()?->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => new SystemSettingResource($setting),
        ]);
    }

    /**
     * Get settings by group
     */
    public function byGroup(Request $request, $group)
    {
        $query = SystemSetting::forGroup($group);

        // Only public settings if not admin
        if (!$request->user()?->hasRole('admin')) {
            $query->public();
        }

        $settings = $query->orderBy('key')->get();

        // Format as key-value pairs
        $formatted = $settings->mapWithKeys(function ($setting) {
            $value = match ($setting->type) {
                'boolean' => (bool) $setting->value,
                'number' => is_numeric($setting->value) ? (strpos($setting->value, '.') !== false ? (float) $setting->value : (int) $setting->value) : $setting->value,
                'json', 'array' => is_string($setting->value) ? json_decode($setting->value, true) : $setting->value,
                default => $setting->value,
            };
            return [$setting->key => $value];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
        ]);
    }

    /**
     * Update single setting (admin only)
     */
    public function update(Request $request, $key)
    {
        // Check if user is admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'value' => 'required',
            'type' => 'sometimes|in:string,boolean,number,json,array',
            'group' => 'sometimes|string',
            'description' => 'sometimes|string',
            'is_public' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $setting = SystemSetting::where('key', $key)->first();

        if (!$setting) {
            // Create new setting
            $setting = SystemSetting::create([
                'key' => $key,
                'value' => is_array($request->value) ? json_encode($request->value) : $request->value,
                'type' => $request->type ?? 'string',
                'group' => $request->group ?? 'general',
                'description' => $request->description,
                'is_public' => $request->boolean('is_public', false),
            ]);
        } else {
            // Update existing setting
            $setting->update([
                'value' => is_array($request->value) ? json_encode($request->value) : $request->value,
                'type' => $request->type ?? $setting->type,
                'group' => $request->group ?? $setting->group,
                'description' => $request->description ?? $setting->description,
                'is_public' => $request->has('is_public') ? $request->boolean('is_public') : $setting->is_public,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Setting updated successfully',
            'data' => new SystemSettingResource($setting),
        ]);
    }

    /**
     * Bulk update settings (admin only)
     */
    public function bulkUpdate(Request $request)
    {
        // Check if user is admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required',
            'settings.*.type' => 'sometimes|in:string,boolean,number,json,array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $updated = [];

        foreach ($request->settings as $settingData) {
            $setting = SystemSetting::where('key', $settingData['key'])->first();

            $value = is_array($settingData['value']) ? json_encode($settingData['value']) : $settingData['value'];

            if ($setting) {
                $setting->update([
                    'value' => $value,
                    'type' => $settingData['type'] ?? $setting->type,
                ]);
            } else {
                $setting = SystemSetting::create([
                    'key' => $settingData['key'],
                    'value' => $value,
                    'type' => $settingData['type'] ?? 'string',
                    'group' => $settingData['group'] ?? 'general',
                    'is_public' => $settingData['is_public'] ?? false,
                ]);
            }

            $updated[] = $setting;
        }

        return response()->json([
            'success' => true,
            'message' => count($updated) . ' settings updated successfully',
            'data' => SystemSettingResource::collection(collect($updated)),
        ]);
    }

    /**
     * Delete setting (admin only)
     */
    public function destroy(Request $request, $key)
    {
        // Check if user is admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $setting = SystemSetting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Setting not found',
            ], 404);
        }

        $setting->delete();

        return response()->json([
            'success' => true,
            'message' => 'Setting deleted successfully',
        ]);
    }

    /**
     * Get available groups
     */
    public function groups(Request $request)
    {
        // Check if user is admin
        if (!$request->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $groups = SystemSetting::select('group')
            ->distinct()
            ->orderBy('group')
            ->pluck('group');

        return response()->json([
            'success' => true,
            'data' => $groups,
        ]);
    }
}
