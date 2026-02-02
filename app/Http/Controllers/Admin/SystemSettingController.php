<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemSettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = SystemSetting::query();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('key', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('group', 'like', "%{$search}%");
            });
        }

        if ($request->has('group') && $request->get('group')) {
            $query->where('group', $request->get('group'));
        }

        $settings = $query->orderBy('group')
            ->orderBy('key')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/system-settings/index', [
            'settings' => $settings,
            'filters' => $request->only(['search', 'group']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255|unique:system_settings,key',
            'value' => 'nullable|string',
            'type' => 'required|in:text,number,boolean,json,array',
            'group' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_public' => 'boolean',
        ]);

        SystemSetting::create($validated);

        return redirect()->back()->with('success', 'Pengaturan Sistem berhasil ditambahkan!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SystemSetting $systemSetting)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255|unique:system_settings,key,' . $systemSetting->id,
            'value' => 'nullable|string',
            'type' => 'required|in:text,number,boolean,json,array',
            'group' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_public' => 'boolean',
        ]);

        $systemSetting->update($validated);

        return redirect()->back()->with('success', 'Pengaturan Sistem berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SystemSetting $systemSetting)
    {
        $systemSetting->delete();

        return redirect()->back()->with('success', 'Pengaturan Sistem berhasil dihapus!');
    }
}
