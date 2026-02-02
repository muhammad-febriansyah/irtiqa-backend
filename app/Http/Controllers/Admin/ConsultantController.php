<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Consultant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConsultantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Consultant::with('user');

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('specialist_category', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('province', 'like', "%{$search}%")
                  ->orWhere('certificate_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('level') && $request->get('level')) {
            $query->where('level', $request->get('level'));
        }

        if ($request->has('is_verified') && $request->get('is_verified') !== '') {
            $query->where('is_verified', $request->get('is_verified'));
        }

        $consultants = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/consultants/index', [
            'consultants' => $consultants,
            'filters' => $request->only(['search', 'level', 'is_verified']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get all users who don't have consultant profile yet
        $users = User::whereDoesntHave('consultant')->get();

        return Inertia::render('admin/consultants/create', [
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:consultants,user_id',
            'specialist_category' => 'nullable|string|max:255',
            'level' => 'required|in:junior,senior,expert',
            'city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
            'certificate_number' => 'nullable|string|max:255',
            'verified_at' => 'nullable|date',
            'bio' => 'nullable|string',
            'working_hours' => 'nullable|array',
        ]);

        $consultant = Consultant::create($validated);

        // Auto-assign consultant role to the user
        $user = User::find($validated['user_id']);
        $consultantRole = \App\Models\Role::where('name', 'consultant')->first();
        if ($consultantRole && !$user->roles->contains($consultantRole->id)) {
            $user->roles()->attach($consultantRole->id);
        }

        return redirect()->route('admin.consultants.index')->with('success', 'Konsultan berhasil ditambahkan!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Consultant $consultant)
    {
        $consultant->load('user');

        // Get all users who don't have consultant profile (plus the current user)
        $users = User::whereDoesntHave('consultant')
            ->orWhere('id', $consultant->user_id)
            ->get();

        return Inertia::render('admin/consultants/edit', [
            'consultant' => $consultant,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Consultant $consultant)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:consultants,user_id,' . $consultant->id,
            'specialist_category' => 'nullable|string|max:255',
            'level' => 'required|in:junior,senior,expert',
            'city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
            'certificate_number' => 'nullable|string|max:255',
            'verified_at' => 'nullable|date',
            'bio' => 'nullable|string',
            'working_hours' => 'nullable|array',
        ]);

        $consultant->update($validated);

        return redirect()->route('admin.consultants.index')->with('success', 'Konsultan berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Consultant $consultant)
    {
        $consultant->delete();

        return redirect()->back()->with('success', 'Konsultan berhasil dihapus!');
    }
}
