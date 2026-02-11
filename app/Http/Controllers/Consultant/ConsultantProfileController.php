<?php

namespace App\Http\Controllers\Consultant;

use App\Http\Controllers\Controller;
use App\Models\Consultant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ConsultantProfileController extends Controller
{
    public function edit(Request $request)
    {
        $user = $request->user();
        $consultant = Consultant::where('user_id', $user->id)->firstOrFail();

        $categories = \App\Models\ConsultationCategory::all()->map(function ($cat) {
            return [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
            ];
        });

        $selectedCategories = [];
        if ($consultant->specialist_category) {
            $categoriesArray = is_array($consultant->specialist_category)
                ? $consultant->specialist_category
                : [$consultant->specialist_category];

            $selectedCategories = \App\Models\ConsultationCategory::whereIn('name', $categoriesArray)
                ->pluck('id')
                ->toArray();
        }

        return Inertia::render('consultant/profile/index', [
            'consultant' => [
                'id' => $consultant->id,
                'user_id' => $consultant->user_id,
                'specialization' => is_array($consultant->specialist_category) ? implode(', ', $consultant->specialist_category) : ($consultant->specialist_category ?? ''),
                'bio' => $consultant->bio ?? '',
                'experience_years' => 0, // Not in current schema
                'certification' => $consultant->certificate_number ?? '',
                'phone' => '', // Phone is in user table, not consultant table
                'is_verified' => $consultant->is_verified,
                'rating' => (float) $consultant->rating_average,
                'total_consultations' => $consultant->total_cases,
            ],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
            ],
            'categories' => $categories,
            'selectedCategories' => $selectedCategories,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $consultant = Consultant::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'specialization' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'experience_years' => 'nullable|integer|min:0',
            'certification' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->update(['avatar' => $avatarPath]);
        }

        $consultant->update([
            'specialist_category' => $validated['specialization'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'certificate_number' => $validated['certification'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Profil berhasil diperbarui');
    }

    public function updateSpecializations(Request $request)
    {
        $user = $request->user();
        $consultant = Consultant::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'categories' => 'required|array',
            'categories.*' => 'exists:consultation_categories,id',
        ]);

        if (!empty($validated['categories'])) {
            $categoryNames = \App\Models\ConsultationCategory::whereIn('id', $validated['categories'])
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

        return redirect()->back()->with('success', 'Spesialisasi berhasil diperbarui');
    }
}
