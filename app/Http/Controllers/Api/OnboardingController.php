<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DisclaimerAcceptance;
use App\Models\UserProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OnboardingController extends Controller
{
    /**
     * Accept disclaimer
     */
    public function acceptDisclaimer(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'disclaimer_type' => 'required|in:onboarding,dream,crisis',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Check if already accepted
        $existing = DisclaimerAcceptance::where('user_id', $user->id)
            ->where('disclaimer_type', $request->disclaimer_type)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => true,
                'message' => 'Disclaimer already accepted',
                'data' => $existing,
            ]);
        }

        // Create new acceptance record
        $acceptance = DisclaimerAcceptance::create([
            'user_id' => $user->id,
            'disclaimer_type' => $request->disclaimer_type,
            'accepted_at' => now(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Disclaimer accepted successfully',
            'data' => $acceptance,
        ], 201);
    }

    /**
     * Get disclaimer status for current user
     */
    public function disclaimerStatus(Request $request): JsonResponse
    {
        $user = $request->user();

        $acceptances = DisclaimerAcceptance::where('user_id', $user->id)
            ->get()
            ->keyBy('disclaimer_type');

        $status = [
            'onboarding' => $acceptances->has('onboarding'),
            'dream' => $acceptances->has('dream'),
            'crisis' => $acceptances->has('crisis'),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'status' => $status,
                'acceptances' => $acceptances->values(),
            ],
        ]);
    }

    /**
     * Verify user age
     */
    public function verifyAge(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'birth_date' => 'required|date|before:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $birthDate = \Carbon\Carbon::parse($request->birth_date);
        $age = $birthDate->age;

        // Get minimum age from settings
        $minAge = \App\Models\SystemSetting::where('key', 'policy.min_age')->value('value') ?? 17;

        if ($age < $minAge) {
            return response()->json([
                'success' => false,
                'message' => "Maaf, usia minimal untuk menggunakan IRTIQA adalah {$minAge} tahun.",
                'data' => [
                    'age' => $age,
                    'min_age' => $minAge,
                    'is_eligible' => false,
                ],
            ], 403);
        }

        // Update user profile with birth date
        $profile = UserProfile::updateOrCreate(
            ['user_id' => $user->id],
            ['birth_date' => $request->birth_date]
        );

        return response()->json([
            'success' => true,
            'message' => 'Verifikasi usia berhasil',
            'data' => [
                'age' => $age,
                'min_age' => $minAge,
                'is_eligible' => true,
                'profile' => $profile,
            ],
        ]);
    }

    /**
     * Complete onboarding
     */
    public function completeOnboarding(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'pseudonym' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'age' => 'nullable|integer|min:17',
            'primary_concern' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Check if onboarding disclaimer is accepted
        $hasAcceptedDisclaimer = DisclaimerAcceptance::hasAccepted($user->id, 'onboarding');

        if (!$hasAcceptedDisclaimer) {
            return response()->json([
                'success' => false,
                'message' => 'Harap setujui disclaimer terlebih dahulu',
            ], 400);
        }

        // Update user profile
        $profile = UserProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'pseudonym' => $request->pseudonym,
                'province' => $request->province,
                'city' => $request->city,
                'age' => $request->age,
                'primary_concern' => $request->primary_concern,
                'onboarding_completed' => true,
                'onboarding_completed_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Onboarding selesai. Selamat datang di IRTIQA!',
            'data' => [
                'user' => $user,
                'profile' => $profile,
            ],
        ]);
    }
}
