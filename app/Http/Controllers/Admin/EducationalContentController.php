<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EducationalContent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EducationalContentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = EducationalContent::with('author');

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->has('type') && $request->get('type')) {
            $query->where('type', $request->get('type'));
        }

        if ($request->has('level') && $request->get('level')) {
            $query->where('level', $request->get('level'));
        }

        $contents = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/educational-contents/index', [
            'contents' => $contents,
            'filters' => $request->only(['search', 'type', 'level']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $authors = User::orderBy('name')->get();

        return Inertia::render('admin/educational-contents/create', [
            'authors' => $authors,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'type' => 'required|in:article,video,audio,infographic,guide',
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'media_url' => 'nullable|string|max:255',
            'duration_minutes' => 'nullable|integer|min:1',
            'level' => 'required|in:beginner,intermediate,advanced',
            'reading_time_minutes' => 'nullable|integer|min:1',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'published_at' => 'nullable|date',
            'author_id' => 'required|exists:users,id',
            'seo_meta' => 'nullable|array',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail'] = $request->file('thumbnail')->store('educational-contents', 'public');
        } else {
            unset($validated['thumbnail']);
        }

        EducationalContent::create($validated);

        return redirect()->route('admin.educational-contents.index')->with('success', 'Konten Edukasi berhasil ditambahkan!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EducationalContent $educationalContent)
    {
        $authors = User::orderBy('name')->get();

        return Inertia::render('admin/educational-contents/edit', [
            'content' => $educationalContent,
            'authors' => $authors,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EducationalContent $educationalContent)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'type' => 'required|in:article,video,audio,infographic,guide',
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'media_url' => 'nullable|string|max:255',
            'duration_minutes' => 'nullable|integer|min:1',
            'level' => 'required|in:beginner,intermediate,advanced',
            'reading_time_minutes' => 'nullable|integer|min:1',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'published_at' => 'nullable|date',
            'author_id' => 'required|exists:users,id',
            'seo_meta' => 'nullable|array',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail
            if ($educationalContent->thumbnail) {
                Storage::disk('public')->delete($educationalContent->thumbnail);
            }
            $validated['thumbnail'] = $request->file('thumbnail')->store('educational-contents', 'public');
        } else {
            unset($validated['thumbnail']);
        }

        $educationalContent->update($validated);

        return redirect()->route('admin.educational-contents.index')->with('success', 'Konten Edukasi berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EducationalContent $educationalContent)
    {
        $educationalContent->delete();

        return redirect()->back()->with('success', 'Konten Edukasi berhasil dihapus!');
    }
}
