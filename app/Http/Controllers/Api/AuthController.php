<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\UserProfile;
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
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Create user profile
        UserProfile::create([
            'user_id' => $user->id,
        ]);

        // Assign default client role
        $user->assignRole('client');

        // Load relationships
        $user->load(['roles', 'profile']);

        // Create token
        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login user
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
        $user->load(['roles', 'profile', 'consultant']);

        // Create token
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
        // Revoke current token
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

        // Delete old avatar if exists
        if ($user->avatar && !filter_var($user->avatar, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Store new avatar
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
     */
    public function acceptDisclaimer(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->profile ?? UserProfile::create(['user_id' => $user->id]);

        $profile->update([
            'disclaimer_accepted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Disclaimer accepted successfully',
        ]);
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
