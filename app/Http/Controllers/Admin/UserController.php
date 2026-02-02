<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['roles'])->orderByDesc('created_at');

        // Filter by role
        if ($request->filled('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        // Filter by verification status
        if ($request->filled('verified')) {
            if ($request->verified === 'yes') {
                $query->whereNotNull('email_verified_at');
            } else if ($request->verified === 'no') {
                $query->whereNull('email_verified_at');
            }
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $users = $query->paginate(15)->through(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'email_verified_at' => $user->email_verified_at?->format('d M Y H:i'),
                'is_verified' => $user->email_verified_at !== null,
                'roles' => $user->roles->pluck('display_name')->toArray(),
                'role_names' => $user->roles->pluck('name')->toArray(),
                'created_at' => $user->created_at->format('d M Y H:i'),
            ];
        });

        $roles = Role::all()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name,
            ];
        });

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role', 'verified']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'avatar' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:2048',
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
            'email_verified' => 'boolean',
        ]);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => $request->boolean('email_verified') ? now() : null,
        ];

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $avatarPath;
        }

        $user = User::create($data);

        if (!empty($validated['roles'])) {
            $user->roles()->attach($validated['roles']);
        }

        return back()->with('success', 'Pengguna berhasil ditambahkan');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'avatar' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:2048',
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
            'email_verified' => 'boolean',
        ]);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'email_verified_at' => $request->boolean('email_verified') ? now() : null,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($validated['password']);
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                \Storage::disk('public')->delete($user->avatar);
            }
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $avatarPath;
        }

        $user->update($data);

        // Sync roles
        if (isset($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        return back()->with('success', 'Pengguna berhasil diperbarui');
    }

    public function destroy(User $user)
    {
        // Prevent deleting self
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Tidak dapat menghapus akun sendiri');
        }

        $user->delete();

        return back()->with('success', 'Pengguna berhasil dihapus');
    }

    public function toggleVerification(User $user)
    {
        $user->update([
            'email_verified_at' => $user->email_verified_at ? null : now(),
        ]);

        $status = $user->email_verified_at ? 'diverifikasi' : 'dibatalkan verifikasinya';
        return back()->with('success', "Email pengguna berhasil {$status}");
    }
}
