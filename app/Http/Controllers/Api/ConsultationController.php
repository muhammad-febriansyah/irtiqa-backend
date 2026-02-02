<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConsultationTicketResource;
use App\Http\Resources\MessageResource;
use App\Models\ConsultationTicket;
use App\Models\Message;
use App\Models\Rating;
use App\Models\Program;
use App\Models\User;
use App\Notifications\CrisisAlertNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConsultationController extends Controller
{
    /**
     * Get list of user's consultations
     */
    public function index(Request $request): JsonResponse
    {
        $consultations = ConsultationTicket::with(['user', 'consultant.user', 'category'])
            ->where('user_id', $request->user()->id)
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
     * Create new consultation
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'category_id' => ['required', 'exists:consultation_categories,id'],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'screening_answers' => ['sometimes', 'array'],
            'is_anonymous' => ['sometimes', 'boolean'],
            'urgency' => ['sometimes', 'string', 'in:rendah,sedang,tinggi'],
        ]);

        $consultation = DB::transaction(function () use ($request) {
            // Assess risk using RiskAssessmentService
            $riskService = app(\App\Services\RiskAssessmentService::class);
            $riskAssessment = $riskService->assess($request->description);

            if ($riskAssessment['requires_escalation']) {
                // We'll call this after consultation is created to have the ID
                $shouldEscalate = true;
            } else {
                $shouldEscalate = false;
            }

            $consultation = ConsultationTicket::create([
                'user_id' => $request->user()->id,
                'category_id' => $request->category_id,
                'subject' => $request->subject,
                'problem_description' => $request->description,
                'screening_answers' => $request->screening_answers ?? [],
                'is_anonymous' => $request->is_anonymous ?? false,
                'status' => 'waiting',
                'type' => ConsultationTicket::TYPE_INITIAL_FREE,
                'urgency' => $this->mapUrgency($request->urgency ?? 'rendah'),
                'risk_level' => $riskAssessment['risk_level'],
            ]);

            // If high risk, trigger escalation notification
            if ($riskAssessment['requires_escalation']) {
                $this->escalateHighRiskCase($consultation, $riskAssessment);
            }

            return $consultation;
        });

        $consultation->load(['user', 'consultant', 'category']);

        return response()->json([
            'success' => true,
            'message' => 'Consultation created successfully',
            'data' => new ConsultationTicketResource($consultation),
        ], 201);
    }

    /**
     * Get consultation details
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $consultation = ConsultationTicket::with(['user', 'consultant.user', 'category', 'practitioner'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new ConsultationTicketResource($consultation),
        ]);
    }

    /**
     * Update consultation
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $consultation = ConsultationTicket::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $request->validate([
            'subject' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
        ]);

        $consultation->update([
            'subject' => $request->subject ?? $consultation->subject,
            'problem_description' => $request->description ?? $consultation->problem_description,
        ]);

        $consultation->load(['user', 'consultant', 'category']);

        return response()->json([
            'success' => true,
            'message' => 'Consultation updated successfully',
            'data' => new ConsultationTicketResource($consultation),
        ]);
    }

    /**
     * Send message in consultation
     */
    public function sendMessage(Request $request, int $id): JsonResponse
    {
        $consultation = ConsultationTicket::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $request->validate([
            'content' => ['required', 'string'],
        ]);

        $message = Message::create([
            'messageable_type' => ConsultationTicket::class,
            'messageable_id' => $consultation->id,
            'sender_id' => $request->user()->id,
            'recipient_id' => $consultation->consultant_id,
            'content' => $request->input('content'),
        ]);

        $message->load(['sender', 'recipient']);

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => new MessageResource($message),
        ], 201);
    }

    /**
     * Get consultation messages
     */
    public function getMessages(Request $request, int $id): JsonResponse
    {
        $consultation = ConsultationTicket::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $messages = Message::with(['sender', 'recipient'])
            ->where('messageable_type', ConsultationTicket::class)
            ->where('messageable_id', $consultation->id)
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark messages as read
        Message::where('messageable_type', ConsultationTicket::class)
            ->where('messageable_id', $consultation->id)
            ->where('recipient_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'data' => MessageResource::collection($messages),
        ]);
    }

    /**
     * Rate consultation
     */
    public function rate(Request $request, int $id): JsonResponse
    {
        $consultation = ConsultationTicket::where('user_id', $request->user()->id)
            ->where('status', 'completed')
            ->findOrFail($id);

        $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'communication_rating' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'professionalism_rating' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'knowledge_rating' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'helpfulness_rating' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'review' => ['sometimes', 'string', 'max:1000'],
        ]);

        $rating = Rating::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'rateable_type' => ConsultationTicket::class,
                'rateable_id' => $consultation->id,
            ],
            [
                'consultant_id' => $consultation->consultant_id,
                'rating' => $request->rating,
                'communication_rating' => $request->communication_rating ?? $request->rating,
                'professionalism_rating' => $request->professionalism_rating ?? $request->rating,
                'knowledge_rating' => $request->knowledge_rating ?? $request->rating,
                'helpfulness_rating' => $request->helpfulness_rating ?? $request->rating,
                'review' => $request->review,
            ]
        );

        // Update consultant average rating
        $this->updateConsultantRating($consultation->consultant_id);

        return response()->json([
            'success' => true,
            'message' => 'Rating submitted successfully',
        ]);
    }

    /**
     * Cancel consultation
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $consultation = ConsultationTicket::where('user_id', $request->user()->id)
            ->whereIn('status', ['waiting', 'in_progress'])
            ->findOrFail($id);

        $request->validate([
            'reason' => ['sometimes', 'string', 'max:500'],
        ]);

        $consultation->update([
            'status' => 'cancelled',
            'cancellation_reason' => $request->reason,
            'cancelled_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Consultation cancelled successfully',
        ]);
    }

    /**
     * Calculate urgency based on screening answers
     */
    private function calculateUrgency(array $answers): string
    {
        $score = 0;
        foreach ($answers as $answer) {
            if (isset($answer['risk_score'])) {
                $score += $answer['risk_score'];
            }
        }

        if ($score >= 7) {
            return 'emergency';
        } elseif ($score >= 4) {
            return 'urgent';
        }

        return 'normal';
    }

    /**
     * Calculate risk level based on screening answers
     */
    private function calculateRiskLevel(array $answers): string
    {
        $score = 0;
        foreach ($answers as $answer) {
            if (isset($answer['risk_score'])) {
                $score += $answer['risk_score'];
            }
        }

        if ($score >= 8) {
            return 'critical';
        } elseif ($score >= 5) {
            return 'high';
        } elseif ($score >= 3) {
            return 'medium';
        }

        return 'low';
    }

    /**
     * Update consultant average rating
     */
    private function updateConsultantRating(int $consultantId): void
    {
        $avgRating = Rating::where('consultant_id', $consultantId)->avg('rating');
        $totalConsultations = ConsultationTicket::where('consultant_id', $consultantId)
            ->where('status', 'completed')
            ->count();

        DB::table('consultants')
            ->where('id', $consultantId)
            ->update([
                'average_rating' => round($avgRating, 2),
                'total_consultations' => $totalConsultations,
            ]);
    }

    /**
     * Map Indonesian urgency to English
     */
    private function mapUrgency(string $urgency): string
    {
        $mapping = [
            'rendah' => 'normal',
            'sedang' => 'urgent',
            'tinggi' => 'emergency',
        ];

        return $mapping[$urgency] ?? 'normal';
    }

    /**
     * Escalate high-risk case to admin/supervisor
     */
    private function escalateHighRiskCase(ConsultationTicket $consultation, array $riskAssessment): void
    {
        // Log the escalation
        \Log::warning('High-risk consultation detected', [
            'consultation_id' => $consultation->id,
            'user_id' => $consultation->user_id,
            'risk_level' => $riskAssessment['risk_level'],
            'risk_flags' => $riskAssessment['risk_flags'] ?? [],
            'risk_score' => $riskAssessment['risk_score'] ?? 0,
        ]);

        // Create CrisisAlert
        $alert = \App\Models\CrisisAlert::create([
            'user_id' => $consultation->user_id,
            'ticket_id' => $consultation->id,
            'alert_type' => 'system_assessment',
            'severity' => $riskAssessment['risk_level'],
            'status' => 'pending',
            'context' => 'Terdeteksi oleh sistem asesmen risiko: ' . implode(', ', $riskAssessment['risk_flags'] ?? []),
            'notes' => 'Otomatis dibuat oleh sistem karena skor risiko: ' . ($riskAssessment['risk_score'] ?? 'N/A'),
        ]);

        // Notify all admins
        $admins = User::whereHas('roles', function ($query) {
            $query->where('name', 'admin');
        })->get();

        foreach ($admins as $admin) {
            $admin->notify(new CrisisAlertNotification($alert));
        }

        // Also notify the assigned consultant if any
        if ($consultation->consultant && $consultation->consultant->user) {
            $consultation->consultant->user->notify(new CrisisAlertNotification($alert));
        }
    }
}
