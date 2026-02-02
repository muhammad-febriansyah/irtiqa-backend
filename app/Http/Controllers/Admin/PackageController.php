<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PackageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Package::query();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $packages = $query->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/packages/index', [
            'packages' => $packages,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/packages/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:session,period,unlimited',
            'sessions_count' => 'nullable|integer|min:1',
            'duration_days' => 'nullable|integer|min:1',
            'price' => 'required|numeric|min:0',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        Package::create($validated);

        return redirect()->route('admin.packages.index')->with('success', 'Paket berhasil ditambahkan!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Package $package)
    {
        // Load related data if needed (e.g., transactions using this package)
        return Inertia::render('admin/packages/show', [
            'package' => $package,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Package $package)
    {
        return Inertia::render('admin/packages/edit', [
            'package' => $package,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Package $package)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:session,period,unlimited',
            'sessions_count' => 'nullable|integer|min:1',
            'duration_days' => 'nullable|integer|min:1',
            'price' => 'required|numeric|min:0',
            'features' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $package->update($validated);

        return redirect()->route('admin.packages.index')->with('success', 'Paket berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Package $package)
    {
        $package->delete();

        return redirect()->back()->with('success', 'Paket berhasil dihapus!');
    }
}
