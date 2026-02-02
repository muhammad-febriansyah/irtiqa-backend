<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConsultantResource;
use App\Http\Resources\ConsultationTicketResource;
use App\Http\Resources\ProgramResource;
use App\Models\Consultant;
use App\Models\ConsultationTicket;
use App\Models\Program;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConsultantController extends Controller
{
    /**
     * Get list of consultants
     */
    public function index(Request $request): JsonResponse
    {
        $query = Consultant::with(['user', 'schedules'])
            ->where('is_verified', true)
            ->where('is_active', true);

        // Filter by specialist category
        if ($request->has('specialist_category')) {
            $query->where('specialist_category', $request->specialist_category);
        }

        // Filter by level
        if ($request->has('level')) {
            $query->where('level', $request->level);
        }

        // Search by name
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'average_rating');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $consultants = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => ConsultantResource::collection($consultants),
            'meta' => [
                'current_page' => $consultants->currentPage(),
                'last_page' => $consultants->lastPage(),
                'per_page' => $consultants->perPage(),
                'total' => $consultants->total(),
            ],
        ]);
    }

    /**
     * Get consultant details
     */
    public function show(int $id): JsonResponse
    {
        $consultant = Consultant::with(['user', 'schedules'])
            ->where('is_verified', true)
            ->where('is_active', true)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new ConsultantResource($consultant),
        ]);
    }

    /**
     * Get consultant dashboard (for consultants only)
     */
    public function dashboard(Request $request): JsonResponse
    {
        $consultant = $request->user()->consultant;

        if (!$consultant) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a consultant',
            ], 403);
        }

        $stats = [
            'total_consultations' => ConsultationTicket::where('consultant_id', $consultant->id)->count(),
            'active_consultations' => ConsultationTicket::where('consultant_id', $consultant->id)
                ->where('status', 'in_progress')
                ->count(),
            'completed_consultations' => ConsultationTicket::where('consultant_id', $consultant->id)
                ->where('status', 'completed')
                ->count(),
            'total_programs' => Program::where('consultant_id', $consultant->id)->count(),
            'active_programs' => Program::where('consultant_id', $consultant->id)
                ->where('status', 'in_progress')
                ->count(),
            'average_rating' => $consultant->average_rating,
            'total_earnings' => Transaction::where('consultant_id', $consultant->id)
                ->where('payment_status', 'paid')
                ->sum('amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get consultant's consultations
     */
    public function consultations(Request $request): JsonResponse
    {
        $consultant = $request->user()->consultant;

        if (!$consultant) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a consultant',
            ], 403);
        }

        $consultations = ConsultationTicket::with(['user', 'category'])
            ->where('consultant_id', $consultant->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => ConsultationTicketResource::collection($consultations),
            'meta' => [
                'current_page' => $consultations->currentPage(),
                'last_page' => $consultations->lastPage(),
                'per_page' => $consultations->perPage(),
                'total' => $consultations->total(),
            ],
        ]);
    }

    /**
     * Get consultant's programs
     */
    public function programs(Request $request): JsonResponse
    {
        $consultant = $request->user()->consultant;

        if (!$consultant) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a consultant',
            ], 403);
        }

        $programs = Program::with(['user', 'package'])
            ->where('consultant_id', $consultant->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => ProgramResource::collection($programs),
            'meta' => [
                'current_page' => $programs->currentPage(),
                'last_page' => $programs->lastPage(),
                'per_page' => $programs->perPage(),
                'total' => $programs->total(),
            ],
        ]);
    }

    /**
     * Get consultant schedule
     */
    public function getSchedule(Request $request): JsonResponse
    {
        $consultant = $request->user()->consultant;

        if (!$consultant) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a consultant',
            ], 403);
        }

        $consultant->load('schedules');

        return response()->json([
            'success' => true,
            'data' => new ConsultantResource($consultant),
        ]);
    }

    /**
     * Update consultant schedule
     */
    public function updateSchedule(Request $request): JsonResponse
    {
        $consultant = $request->user()->consultant;

        if (!$consultant) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a consultant',
            ], 403);
        }

        $request->validate([
            'schedules' => ['required', 'array'],
            'schedules.*.day_of_week' => ['required', 'integer', 'min:0', 'max:6'],
            'schedules.*.start_time' => ['required', 'date_format:H:i'],
            'schedules.*.end_time' => ['required', 'date_format:H:i', 'after:schedules.*.start_time'],
            'schedules.*.is_available' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($consultant, $request) {
            // Delete existing schedules
            $consultant->schedules()->delete();

            // Create new schedules
            foreach ($request->schedules as $schedule) {
                $consultant->schedules()->create($schedule);
            }
        });

        $consultant->load('schedules');

        return response()->json([
            'success' => true,
            'message' => 'Schedule updated successfully',
            'data' => new ConsultantResource($consultant),
        ]);
    }

    /**
     * Get consultant earnings
     */
    public function earnings(Request $request): JsonResponse
    {
        $consultant = $request->user()->consultant;

        if (!$consultant) {
            return response()->json([
                'success' => false,
                'message' => 'You are not a consultant',
            ], 403);
        }

        $earnings = [
            'total' => Transaction::where('consultant_id', $consultant->id)
                ->where('payment_status', 'paid')
                ->sum('amount'),
            'this_month' => Transaction::where('consultant_id', $consultant->id)
                ->where('payment_status', 'paid')
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->sum('amount'),
            'last_month' => Transaction::where('consultant_id', $consultant->id)
                ->where('payment_status', 'paid')
                ->whereMonth('paid_at', now()->subMonth()->month)
                ->whereYear('paid_at', now()->subMonth()->year)
                ->sum('amount'),
            'pending' => Transaction::where('consultant_id', $consultant->id)
                ->where('payment_status', 'pending')
                ->sum('amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $earnings,
        ]);
    }
}
