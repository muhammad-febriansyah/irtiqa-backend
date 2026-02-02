<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AboutUs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AboutUsController extends Controller
{
    /**
     * Display the form for editing the about us content.
     */
    public function edit()
    {
        $aboutUs = AboutUs::first();

        return Inertia::render('admin/about-us/edit', [
            'aboutUs' => $aboutUs,
        ]);
    }

    /**
     * Update the about us content.
     */
    public function update(Request $request)
    {
        $aboutUs = AboutUs::first();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'desc' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($aboutUs->image) {
                Storage::disk('public')->delete($aboutUs->image);
            }
            $validated['image'] = $request->file('image')->store('about-us', 'public');
        } else {
            // Keep existing image if no new one is uploaded
            unset($validated['image']);
        }

        $aboutUs->update($validated);

        return back()->with('success', 'Tentang Kami berhasil diperbarui');
    }
}
