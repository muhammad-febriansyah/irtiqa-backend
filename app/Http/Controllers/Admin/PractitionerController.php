<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Practitioner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PractitionerController extends Controller
{
    public function index(Request $request)
    {
        $query = Practitioner::with('verifier')->orderByDesc('created_at');

        // Filter by verification status
        if ($request->filled('verification_status')) {
            $query->where('verification_status', $request->verification_status);
        }

        // Filter by province
        if ($request->filled('province')) {
            $query->where('province', $request->province);
        }

        // Filter by city
        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        // Filter by active status
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('title', 'like', "%{$request->search}%")
                    ->orWhere('phone', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $practitioners = $query->paginate(15)->through(function ($practitioner) {
            return [
                'id' => $practitioner->id,
                'name' => $practitioner->name,
                'title' => $practitioner->title,
                'province' => $practitioner->province,
                'city' => $practitioner->city,
                'phone' => $practitioner->phone,
                'whatsapp' => $practitioner->whatsapp,
                'specialties' => $practitioner->specialties,
                'verification_status' => $practitioner->verification_status,
                'is_active' => $practitioner->is_active,
                'accepting_referrals' => $practitioner->accepting_referrals,
                'referral_count' => $practitioner->referral_count,
                'average_rating' => $practitioner->average_rating,
                'verified_at' => $practitioner->verified_at?->format('d M Y'),
                'verifier_name' => $practitioner->verifier?->name,
                'created_at' => $practitioner->created_at->format('d M Y H:i'),
            ];
        });

        // Get unique provinces and cities
        $provinces = Practitioner::distinct()->pluck('province')->filter()->toArray();
        $cities = Practitioner::distinct()->pluck('city')->filter()->toArray();

        return Inertia::render('admin/practitioners/index', [
            'practitioners' => $practitioners,
            'provinces' => $provinces,
            'cities' => $cities,
            'filters' => $request->only(['search', 'verification_status', 'province', 'city', 'is_active']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'title' => 'nullable|string|max:100',
            'bio' => 'nullable|string',
            'photo' => 'nullable|image|max:2048',
            'specialties' => 'nullable|array',
            'description' => 'nullable|string',
            'province' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('practitioners', 'public');
        }

        Practitioner::create($validated);

        return back()->with('success', 'Praktisi berhasil ditambahkan');
    }

    public function update(Request $request, Practitioner $practitioner)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'title' => 'nullable|string|max:100',
            'bio' => 'nullable|string',
            'photo' => 'nullable|image|max:2048',
            'specialties' => 'nullable|array',
            'description' => 'nullable|string',
            'province' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'nullable|boolean',
            'accepting_referrals' => 'nullable|boolean',
        ]);

        if ($request->hasFile('photo')) {
            if ($practitioner->photo) {
                Storage::disk('public')->delete($practitioner->photo);
            }
            $validated['photo'] = $request->file('photo')->store('practitioners', 'public');
        }

        $practitioner->update($validated);

        return back()->with('success', 'Praktisi berhasil diperbarui');
    }

    public function destroy(Practitioner $practitioner)
    {
        if ($practitioner->photo) {
            Storage::disk('public')->delete($practitioner->photo);
        }

        $practitioner->delete();

        return back()->with('success', 'Praktisi berhasil dihapus');
    }

    public function verify(Request $request, Practitioner $practitioner)
    {
        $request->validate([
            'verification_notes' => 'nullable|string|max:1000',
        ]);

        $practitioner->markAsVerified(auth()->id());

        if ($request->filled('verification_notes')) {
            $practitioner->update(['verification_notes' => $request->verification_notes]);
        }

        return back()->with('success', 'Praktisi berhasil diverifikasi');
    }

    public function reject(Request $request, Practitioner $practitioner)
    {
        $request->validate([
            'verification_notes' => 'required|string|max:1000',
        ]);

        $practitioner->update([
            'verification_status' => 'rejected',
            'verification_notes' => $request->verification_notes,
        ]);

        return back()->with('success', 'Praktisi ditolak');
    }

    public function toggleActive(Practitioner $practitioner)
    {
        $practitioner->update([
            'is_active' => !$practitioner->is_active,
        ]);

        $status = $practitioner->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Praktisi berhasil {$status}");
    }
}
