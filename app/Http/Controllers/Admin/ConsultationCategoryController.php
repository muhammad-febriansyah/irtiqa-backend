<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConsultationCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ConsultationCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = ConsultationCategory::query();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $categories = $query->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/consultation-categories/index', [
            'categories' => $categories,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        ConsultationCategory::create($validated);

        return redirect()->back()->with('success', 'Kategori berhasil ditambahkan!');
    }

    public function update(Request $request, ConsultationCategory $consultationCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $consultationCategory->update($validated);

        return redirect()->back()->with('success', 'Kategori berhasil diperbarui!');
    }

    public function destroy(ConsultationCategory $consultationCategory)
    {
        $consultationCategory->delete();

        return redirect()->back()->with('success', 'Kategori berhasil dihapus!');
    }
}
