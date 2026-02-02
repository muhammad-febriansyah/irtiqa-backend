<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConsultantApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConsultantApplicationController extends Controller
{
    /**
     * Display a listing of consultant applications
     */
    public function index(Request $request)
    {
        $query = ConsultantApplication::with(['user', 'reviewedByAdmin'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by certification type
        if ($request->filled('certification_type')) {
            $query->where('certification_type', $request->certification_type);
        }

        // Search by name or institution
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $applications = $query->paginate($request->get('per_page', 20));

        // Transform data for frontend
        $applications->getCollection()->transform(function ($application) {
            return [
                'id' => $application->id,
                'user_name' => $application->user->name ?? 'Unknown',
                'full_name' => $application->full_name,
                'phone' => $application->phone,
                'province' => $application->province,
                'city' => $application->city,
                'certification_type' => $application->certification_type,
                'certification_type_label' => $this->getCertificationTypeLabel($application->certification_type),
                'certification_number' => $application->certification_number,
                'certification_file_url' => $application->certification_file
                    ? asset('storage/' . $application->certification_file)
                    : null,
                'experience_years' => $application->experience_years,
                'bio' => $application->bio,
                'specializations' => $application->specializations,
                'status' => $application->status,
                'status_label' => ucfirst($application->status),
                'reviewed_by_admin_name' => $application->reviewedByAdmin->name ?? null,
                'reviewed_at' => $application->reviewed_at?->format('d M Y H:i'),
                'rejection_reason' => $application->rejection_reason,
                'admin_notes' => $application->admin_notes,
                'created_at' => $application->created_at->format('d M Y H:i'),
            ];
        });

        return Inertia::render('admin/consultant-applications/index', [
            'applications' => $applications,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'certification_type' => $request->certification_type,
            ],
        ]);
    }

    /**
     * Display the specified consultant application
     */
    public function show(ConsultantApplication $consultantApplication)
    {
        $consultantApplication->load(['user', 'reviewedByAdmin']);

        return Inertia::render('admin/consultant-applications/show', [
            'application' => [
                'id' => $consultantApplication->id,
                'user_name' => $consultantApplication->user->name ?? 'Unknown',
                'user_email' => $consultantApplication->user->email ?? null,
                'full_name' => $consultantApplication->full_name,
                'phone' => $consultantApplication->phone,
                'province' => $consultantApplication->province,
                'city' => $consultantApplication->city,
                'certification_type' => $consultantApplication->certification_type,
                'certification_type_label' => $this->getCertificationTypeLabel($consultantApplication->certification_type),
                'certification_number' => $consultantApplication->certification_number,
                'certification_file_url' => $consultantApplication->certification_file
                    ? asset('storage/' . $consultantApplication->certification_file)
                    : null,
                'experience_years' => $consultantApplication->experience_years,
                'bio' => $consultantApplication->bio,
                'specializations' => $consultantApplication->specializations,
                'status' => $consultantApplication->status,
                'status_label' => ucfirst($consultantApplication->status),
                'reviewed_by_admin_name' => $consultantApplication->reviewedByAdmin->name ?? null,
                'reviewed_at' => $consultantApplication->reviewed_at?->format('d M Y H:i'),
                'rejection_reason' => $consultantApplication->rejection_reason,
                'admin_notes' => $consultantApplication->admin_notes,
                'created_at' => $consultantApplication->created_at->format('d M Y H:i'),
            ],
        ]);
    }

    /**
     * Approve a consultant application
     */
    public function approve(Request $request, ConsultantApplication $consultantApplication)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($consultantApplication->status !== 'pending') {
            return back()->with('error', 'Aplikasi sudah diproses sebelumnya');
        }

        try {
            $consultantApplication->approve($request->user()->id, $request->notes);

            return back()->with('success', 'Aplikasi konsultan berhasil disetujui. User sekarang memiliki role consultant.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal approve aplikasi: ' . $e->getMessage());
        }
    }

    /**
     * Reject a consultant application
     */
    public function reject(Request $request, ConsultantApplication $consultantApplication)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($consultantApplication->status !== 'pending') {
            return back()->with('error', 'Aplikasi sudah diproses sebelumnya');
        }

        $consultantApplication->reject(
            $request->user()->id,
            $request->reason,
            $request->notes
        );

        return back()->with('success', 'Aplikasi konsultan berhasil ditolak');
    }

    /**
     * Get certification type label
     */
    private function getCertificationTypeLabel(string $type): string
    {
        return match ($type) {
            'psikolog' => 'Psikolog',
            'konselor' => 'Konselor',
            'kyai' => 'Kyai/Ustadz',
            'therapist' => 'Therapist',
            'other' => 'Lainnya',
            default => ucfirst($type),
        };
    }
}
