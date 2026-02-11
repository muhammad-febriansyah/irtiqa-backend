<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultant;
use App\Models\ConsultationCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ConsultantProfileApiController extends Controller
{
    /**
     * Get consultant profile data
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();

        if (!$user->hasRole('consultant') && !$user->hasRole('kyai')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses sebagai konsultan',
            ], 403);
        }

        $consultant = Consultant::where('user_id', $user->id)->first();

        if (!$consultant) {
            return response()->json([
                'success' => false,
                'message' => 'Data konsultan tidak ditemukan',
            ], 404);
        }

        $selectedCategories = [];
        if ($consultant->specialist_category) {
            $categoriesArray = is_array($consultant->specialist_category)
                ? $consultant->specialist_category
                : [$consultant->specialist_category];

            $selectedCategories = ConsultationCategory::whereIn('name', $categoriesArray)
                ->pluck('id')
                ->toArray();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'consultant' => [
                    'id' => $consultant->id,
                    'user_id' => $consultant->user_id,
                    'specialization' => $consultant->specialist_category ?? [],
                    'bio' => $consultant->bio ?? '',
                    'certification' => $consultant->certificate_number ?? '',
                    'is_verified' => $consultant->is_verified,
                    'rating' => (float) $consultant->rating_average,
                    'total_consultations' => $consultant->total_cases,
                    'level' => $consultant->level ?? '',
                    'city' => $consultant->city ?? '',
                    'province' => $consultant->province ?? '',
                ],
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'avatar_url' => $user->avatar ? Storage::url($user->avatar) : null,
                ],
                'selected_categories' => $selectedCategories,
            ],
        ]);
    }

    /**
     * Update consultant profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if (!$user->hasRole('consultant') && !$user->hasRole('kyai')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses sebagai konsultan',
            ], 403);
        }

        $consultant = Consultant::where('user_id', $user->id)->first();

        if (!$consultant) {
            return response()->json([
                'success' => false,
                'message' => 'Data konsultan tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'certification' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($request->has('name')) {
            $user->update(['name' => $request->name]);
        }

        $consultant->update([
            'bio' => $request->bio ?? $consultant->bio,
            'certificate_number' => $request->certification ?? $consultant->certificate_number,
            'city' => $request->city ?? $consultant->city,
            'province' => $request->province ?? $consultant->province,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui',
            'data' => [
                'consultant' => [
                    'id' => $consultant->id,
                    'bio' => $consultant->bio,
                    'certification' => $consultant->certificate_number,
                    'city' => $consultant->city,
                    'province' => $consultant->province,
                ],
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                ],
            ],
        ]);
    }

    /**
     * Update consultant avatar
     */
    public function updateAvatar(Request $request)
    {
        $user = $request->user();

        if (!$user->hasRole('consultant') && !$user->hasRole('kyai')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses sebagai konsultan',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $avatarPath = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $avatarPath]);

        return response()->json([
            'success' => true,
            'message' => 'Avatar berhasil diperbarui',
            'data' => [
                'avatar' => $avatarPath,
                'avatar_url' => Storage::url($avatarPath),
            ],
        ]);
    }

    /**
     * Update consultant specializations
     */
    public function updateSpecializations(Request $request)
    {
        $user = $request->user();

        if (!$user->hasRole('consultant') && !$user->hasRole('kyai')) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses sebagai konsultan',
            ], 403);
        }

        $consultant = Consultant::where('user_id', $user->id)->first();

        if (!$consultant) {
            return response()->json([
                'success' => false,
                'message' => 'Data konsultan tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'categories' => 'required|array',
            'categories.*' => 'exists:consultation_categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        if (!empty($request->categories)) {
            $categoryNames = ConsultationCategory::whereIn('id', $request->categories)
                ->pluck('name')
                ->toArray();

            $consultant->update([
                'specialist_category' => $categoryNames,
            ]);
        } else {
            $consultant->update([
                'specialist_category' => [],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Spesialisasi berhasil diperbarui',
            'data' => [
                'specialization' => $consultant->specialist_category,
            ],
        ]);
    }

    /**
     * Get all consultation categories
     */
    public function getCategories(Request $request)
    {
        $categories = ConsultationCategory::active()
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'icon' => $category->icon,
                    'color' => $category->color,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
