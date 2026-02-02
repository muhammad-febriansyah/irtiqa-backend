<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SliderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Slider::orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%")
                ->orWhere('desc', 'like', "%{$request->search}%");
        }

        $sliders = $query->paginate(10)->withQueryString();

        return Inertia::render('admin/sliders/index', [
            'sliders' => $sliders,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'desc' => 'nullable|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('sliders', 'public');
        }

        Slider::create($validated);

        return back()->with('success', 'Slider berhasil ditambahkan');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Slider $slider)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'desc' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($slider->image) {
                Storage::disk('public')->delete($slider->image);
            }
            $validated['image'] = $request->file('image')->store('sliders', 'public');
        } else {
            unset($validated['image']);
        }

        $slider->update($validated);

        return back()->with('success', 'Slider berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Slider $slider)
    {
        if ($slider->image) {
            Storage::disk('public')->delete($slider->image);
        }

        $slider->delete();

        return back()->with('success', 'Slider berhasil dihapus');
    }
}
