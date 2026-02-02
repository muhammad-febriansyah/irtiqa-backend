<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConsultantApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ConsultantApplicationController extends Controller
{
    /**
     * Submit consultant application
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'province' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'certification_type' => 'required|string|max:100',
            'certification_number' => 'nullable|string|max:100',
            'certification_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB
            'experience_years' => 'required|integer|min:0',
            'bio' => 'required|string|max:1000',
            'specializations' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Check if user already has pending or approved application
        $existingApplication = ConsultantApplication::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existingApplication) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memiliki aplikasi yang ' .
                    ($existingApplication->status === 'approved' ? 'disetujui' : 'sedang diproses'),
                'data' => $existingApplication,
            ], 400);
        }

        // Handle file upload
        $certificationFilePath = null;
        if ($request->hasFile('certification_file')) {
            $certificationFilePath = $request->file('certification_file')
                ->store('consultant-certifications', 'public');
        }

        // Create application
        $application = ConsultantApplication::create([
            'user_id' => $user->id,
            'full_name' => $request->full_name,
            'phone' => $request->phone,
            'province' => $request->province,
            'city' => $request->city,
            'certification_type' => $request->certification_type,
            'certification_number' => $request->certification_number,
            'certification_file' => $certificationFilePath,
            'experience_years' => $request->experience_years,
            'bio' => $request->bio,
            'specializations' => $request->specializations,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Aplikasi konsultan berhasil diajukan. Tim kami akan meninjau dalam 3-5 hari kerja.',
            'data' => $application,
        ], 201);
    }

    /**
     * Get application by ID
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $application = ConsultantApplication::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $application,
        ]);
    }

    /**
     * Get user's applications
     */
    public function myApplications(Request $request): JsonResponse
    {
        $user = $request->user();

        $applications = ConsultantApplication::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }

    /**
     * Get all applications (Admin only)
     */
    public function index(Request $request): JsonResponse
    {
        $query = ConsultantApplication::with(['user', 'reviewedByAdmin'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 20);
        $applications = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }

    /**
     * Approve application (Admin only)
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $application = ConsultantApplication::findOrFail($id);
        $admin = $request->user();

        if ($application->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Aplikasi sudah diproses sebelumnya',
            ], 400);
        }

        $application->approve($admin->id, $request->notes);

        return response()->json([
            'success' => true,
            'message' => 'Aplikasi konsultan disetujui. User sekarang memiliki role consultant.',
            'data' => $application->fresh(['user', 'reviewedByAdmin']),
        ]);
    }

    /**
     * Reject application (Admin only)
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $application = ConsultantApplication::findOrFail($id);
        $admin = $request->user();

        if ($application->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Aplikasi sudah diproses sebelumnya',
            ], 400);
        }

        $application->reject($admin->id, $request->reason, $request->notes);

        return response()->json([
            'success' => true,
            'message' => 'Aplikasi konsultan ditolak',
            'data' => $application->fresh(['user', 'reviewedByAdmin']),
        ]);
    }

    /**
     * Get application statistics (Admin only)
     */
    public function statistics(Request $request): JsonResponse
    {
        $stats = [
            'total' => ConsultantApplication::count(),
            'pending' => ConsultantApplication::where('status', 'pending')->count(),
            'approved' => ConsultantApplication::where('status', 'approved')->count(),
            'rejected' => ConsultantApplication::where('status', 'rejected')->count(),
            'this_month' => ConsultantApplication::whereMonth('created_at', now()->month)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
