<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\UserProfile;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     *
     * Note: User will NOT be logged in until email is verified via OTP
     * Flow sesuai IRTIQA: Register → OTP Verification → Disclaimer → Age Verification → Complete
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
            'phone' => ['required', 'string', 'max:20'], // Required untuk WA verification

            'birth_date' => ['required', 'date', 'before:today'],
            'gender' => ['required', 'in:male,female'],
            'province' => ['required', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],

            'district' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],

            'role' => ['nullable', 'in:consultant,client'],
        ]);

        $birthDate = \Carbon\Carbon::parse($request->birth_date);
        $age = $birthDate->age;

        if ($age < 17) {
            return response()->json([
                'success' => false,
                'message' => 'Anda harus berusia minimal 17 tahun untuk mendaftar.',
                'error_code' => 'AGE_REQUIREMENT_NOT_MET',
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        UserProfile::create([
            'user_id' => $user->id,
            'phone' => $request->phone,
            'birth_date' => $request->birth_date,
            'gender' => $request->gender,
            'province' => $request->province,
            'city' => $request->city,
            'district' => $request->district,
            'address' => $request->address,
        ]);

        $role = $request->role ?? 'client';
        $user->assignRole($role);

        // Send OTP to both email and WhatsApp with same code
        $otpService = new OtpService();
        $otpResult = $otpService->sendOtpMultiChannel(
            identifier: $request->email,
            phone: $request->phone,
            purpose: 'registration'
        );

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil. Silakan verifikasi dengan kode OTP yang telah dikirim.',
            'data' => [
                'user_id' => $user->id,
                'email' => $user->email,
                'phone' => $request->phone,
                'role' => $role,
                'otp_sent' => $otpResult['success'],
                'otp_sent_via' => $otpResult['sent_via'] ?? [],
                'expires_at' => $otpResult['expires_at'] ?? null,
            ],
        ], 201);
    }

    /**
     * Send OTP for email verification
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'type' => ['sometimes', 'in:email,whatsapp'],
            'purpose' => ['sometimes', 'in:registration,login,forgot_password'],
        ]);

        $user = User::where('email', $request->email)->with('profile')->first();
        if ($user && $user->email_verified_at && ($request->purpose ?? 'registration') === 'registration') {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified. Please login.',
            ], 422);
        }

        $type = $request->type ?? 'email';

        $recipient = null;
        if ($type === 'whatsapp') {
            $phone = $user?->profile?->phone;
            if (!$phone) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nomor WhatsApp tidak ditemukan. Gunakan OTP via email.',
                ], 422);
            }
            $recipient = $phone;
        }

        $otpService = new OtpService();
        $result = $otpService->sendOtp(
            identifier: $request->email,
            type: $type,
            purpose: $request->purpose ?? 'registration',
            recipient: $recipient
        );

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    /**
     * Verify OTP and mark email as verified
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        // Debug log incoming request
        \Log::info('OTP Verification Request', [
            'email' => $request->email,
            'otp_code' => $request->otp_code,
            'purpose' => $request->purpose ?? 'registration',
            'request_time' => now()->toISOString(),
        ]);

        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'otp_code' => ['required', 'string', 'size:6'],
            'purpose' => ['sometimes', 'in:registration,login,forgot_password'],
        ]);

        $otpService = new OtpService();
        $result = $otpService->verifyOtp(
            identifier: $request->email,
            otpCode: $request->otp_code,
            purpose: $request->purpose ?? 'registration'
        );

        // Debug log result
        \Log::info('OTP Verification Result', [
            'email' => $request->email,
            'success' => $result['success'],
            'message' => $result['message'],
        ]);

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        $user = User::where('email', $request->email)->first();
        if ($user && !$user->email_verified_at) {
            $user->update([
                'email_verified_at' => now(),
            ]);
        }

        $user->load(['roles', 'profile', 'consultant']);

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully. You can now login.',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ]);
    }

    /**
     * Login user
     *
     * Note: Email must be verified before login
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();

        if (!$user->email_verified_at) {
            Auth::logout();

            $otpService = new OtpService();
            $otpResult = $otpService->sendOtp(
                identifier: $user->email,
                type: 'email',
                purpose: 'registration'
            );

            return response()->json([
                'success' => false,
                'message' => 'Email not verified. Please verify your email first.',
                'error_code' => 'EMAIL_NOT_VERIFIED',
                'data' => [
                    'email' => $user->email,
                    'otp_sent' => $otpResult['success'] ?? false,
                    'expires_at' => $otpResult['expires_at'] ?? null,
                ],
            ], 403);
        }

        $user->load(['roles', 'profile', 'consultant']);

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['roles', 'profile', 'consultant']);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Update user profile (name, email)
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        $user->update($request->only(['name', 'email']));
        $user->load(['roles', 'profile', 'consultant']);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Update user avatar
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ]);

        $user = $request->user();

        if ($user->avatar && !filter_var($user->avatar, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        $user->load(['roles', 'profile', 'consultant']);

        return response()->json([
            'success' => true,
            'message' => 'Avatar updated successfully',
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    }

    /**
     * Update user extended profile
     */
    public function updateUserProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'birth_date' => ['sometimes', 'date', 'before:today'],
            'gender' => ['sometimes', 'in:male,female'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'address' => ['sometimes', 'string', 'max:500'],
            'province' => ['sometimes', 'string', 'max:100'],
            'city' => ['sometimes', 'string', 'max:100'],
            'district' => ['sometimes', 'string', 'max:100'],
            'postal_code' => ['sometimes', 'string', 'max:10'],
            'bio' => ['sometimes', 'string', 'max:1000'],
        ]);

        $profile = $user->profile ?? UserProfile::create(['user_id' => $user->id]);
        $profile->update($request->only([
            'birth_date',
            'gender',
            'phone',
            'address',
            'province',
            'city',
            'district',
            'postal_code',
            'bio',
        ]));

        $user->load(['roles', 'profile', 'consultant']);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Get disclaimer acceptance status
     */
    public function getDisclaimerStatus(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        return response()->json([
            'success' => true,
            'data' => [
                'accepted' => $profile && $profile->disclaimer_accepted_at !== null,
                'accepted_at' => $profile?->disclaimer_accepted_at?->toISOString(),
            ],
        ]);
    }

    /**
     * Accept disclaimer
     * FLOW IRTIQA: Step 3 - Persetujuan wajib disclaimer
     */
    public function acceptDisclaimer(Request $request): JsonResponse
    {
        $request->validate([
            'disclaimer_types' => ['required', 'array'],
            'disclaimer_types.*' => ['in:syari,health,privacy,ethics'],
        ]);

        $user = $request->user();
        $profile = $user->profile ?? UserProfile::create(['user_id' => $user->id]);

        $profile->update([
            'disclaimer_accepted_at' => now(),
        ]);

        \Log::info('Disclaimer accepted', [
            'user_id' => $user->id,
            'email' => $user->email,
            'types' => $request->disclaimer_types,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Disclaimer diterima dengan sukses',
            'data' => [
                'accepted_at' => $profile->disclaimer_accepted_at->toISOString(),
            ],
        ]);
    }

    /**
     * Verify age
     * FLOW IRTIQA: Step 4 - Age Verification (minimal 17 tahun)
     */
    public function verifyAge(Request $request): JsonResponse
    {
        $request->validate([
            'birth_date' => ['required', 'date', 'before:today'],
        ]);

        $user = $request->user();
        $profile = $user->profile ?? UserProfile::create(['user_id' => $user->id]);

        $birthDate = \Carbon\Carbon::parse($request->birth_date);
        $age = $birthDate->age;

        if ($age < 17) {
            return response()->json([
                'success' => false,
                'message' => 'Anda harus berusia minimal 17 tahun untuk menggunakan aplikasi ini.',
                'error_code' => 'AGE_REQUIREMENT_NOT_MET',
                'data' => [
                    'current_age' => $age,
                    'required_age' => 17,
                ],
            ], 422);
        }

        $profile->update([
            'birth_date' => $request->birth_date,
            'age_verified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Verifikasi usia berhasil',
            'data' => [
                'age' => $age,
                'verified_at' => $profile->age_verified_at->toISOString(),
            ],
        ]);
    }

    /**
     * Complete onboarding
     * FLOW IRTIQA: Step 5 - Menyelesaikan semua tahap onboarding
     */
    public function completeOnboarding(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->profile;

        if (!$user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Email belum diverifikasi',
                'error_code' => 'EMAIL_NOT_VERIFIED',
            ], 422);
        }

        if (!$profile || !$profile->disclaimer_accepted_at) {
            return response()->json([
                'success' => false,
                'message' => 'Disclaimer belum diterima',
                'error_code' => 'DISCLAIMER_NOT_ACCEPTED',
            ], 422);
        }

        if (!$profile->age_verified_at && !$profile->birth_date) {
            return response()->json([
                'success' => false,
                'message' => 'Usia belum diverifikasi',
                'error_code' => 'AGE_NOT_VERIFIED',
            ], 422);
        }

        $profile->update([
            'onboarding_completed' => true,
            'onboarding_completed_at' => now(),
        ]);

        $user->load(['roles', 'profile', 'consultant']);

        return response()->json([
            'success' => true,
            'message' => 'Onboarding selesai. Selamat datang di IRTIQA!',
            'data' => [
                'user' => new UserResource($user),
                'completed_at' => $profile->onboarding_completed_at->toISOString(),
            ],
        ]);
    }

    /**
     * Get onboarding status
     * Check which steps are completed
     */
    public function getOnboardingStatus(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->profile;

        $status = [
            'email_verified' => !is_null($user->email_verified_at),
            'disclaimer_accepted' => $profile ? !is_null($profile->disclaimer_accepted_at) : false,
            'age_verified' => $profile ? !is_null($profile->age_verified_at) : false,
            'onboarding_completed' => $profile ? (bool) $profile->onboarding_completed : false,
        ];

        $allComplete = $status['email_verified']
            && $status['disclaimer_accepted']
            && $status['age_verified'];

        return response()->json([
            'success' => true,
            'data' => [
                'status' => $status,
                'all_steps_completed' => $allComplete,
                'next_step' => $this->getNextOnboardingStep($status),
            ],
        ]);
    }

    /**
     * Helper: Determine next onboarding step
     */
    private function getNextOnboardingStep(array $status): ?string
    {
        if (!$status['email_verified']) {
            return 'verify_email';
        }
        if (!$status['disclaimer_accepted']) {
            return 'accept_disclaimer';
        }
        if (!$status['age_verified']) {
            return 'verify_age';
        }
        if (!$status['onboarding_completed']) {
            return 'complete_onboarding';
        }

        return null; // All done
    }

    /**
     * Forgot password
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'success' => true,
                'message' => 'Password reset link sent to your email',
            ]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Password reset successful',
            ]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }
}
