<?php

namespace App\Services;

use App\Models\Consultant;
use App\Models\ConsultationTicket;
use App\Models\FormSubmission;
use Illuminate\Support\Collection;

class ConsultantRoutingService
{
    /**
     * Assign the best consultant for a consultation ticket
     */
    public function assignConsultant(ConsultationTicket $ticket, ?FormSubmission $submission = null): ?Consultant
    {
        if (!$submission && $ticket->form_submission_id) {
            $submission = $ticket->formSubmission;
        }

        $candidates = $this->buildCandidateList($ticket, $submission);

        if ($candidates->isEmpty()) {
            return null;
        }

        $scoredCandidants = $candidates->map(function ($consultant) use ($ticket, $submission) {
            $score = $this->calculateScore($consultant, $ticket, $submission);
            $consultant->routing_score = $score;
            return $consultant;
        });

        $topConsultant = $scoredCandidants->sortByDesc('routing_score')->first();

        if (!$this->checkAvailability($topConsultant)) {
            foreach ($scoredCandidants->sortByDesc('routing_score') as $consultant) {
                if ($this->checkAvailability($consultant)) {
                    $topConsultant = $consultant;
                    break;
                }
            }
        }

        $metadata = $this->buildRoutingMetadata($topConsultant, $scoredCandidants);

        $ticket->update([
            'consultant_id' => $topConsultant->id,
            'assigned_by_id' => null,
            'assigned_by_type' => 'system',
            'routing_score' => $topConsultant->routing_score,
            'routing_metadata' => $metadata,
            'assigned_at' => now(),
        ]);

        $ticket->team()->create([
            'consultant_id' => $topConsultant->id,
            'role' => 'primary',
            'invited_at' => now(),
        ]);

        return $topConsultant;
    }

    /**
     * Build list of candidate consultants
     */
    private function buildCandidateList(ConsultationTicket $ticket, ?FormSubmission $submission): Collection
    {
        $query = Consultant::where('is_verified', true)
            ->where('is_active', true);

        if ($ticket->category_id) {
            $query->where('specialist_category', $ticket->category_id);
        }

        if ($submission && $submission->isCritical()) {
            $query->where('level', 'expert');
        }

        $userProvince = $ticket->user->profile?->province;
        if ($userProvince) {
            $query->addSelect(['*', \DB::raw("IF(province = '$userProvince', 1, 0) as is_same_region")]);
        }

        return $query->get();
    }

    /**
     * Calculate routing score for consultant
     */
    private function calculateScore(Consultant $consultant, ConsultationTicket $ticket, ?FormSubmission $submission): int
    {
        $score = 0;

        $score += match($consultant->level) {
            'expert' => 30,
            'senior' => 20,
            'junior' => 10,
            default => 0,
        };

        $activeTickets = $consultant->consultationTickets()
            ->whereIn('status', ['waiting', 'in_progress'])
            ->count();
        $workloadScore = max(0, 25 - ($activeTickets * 2));
        $score += $workloadScore;

        $ratingScore = ($consultant->average_rating ?? 0) * 5;
        $score += $ratingScore;

        $avgResponseTime = $this->calculateAverageResponseTime($consultant);
        $responseScore = max(0, 20 - ($avgResponseTime / 2));
        $score += $responseScore;

        if (isset($consultant->is_same_region) && $consultant->is_same_region) {
            $score += 10;
        }

        if ($submission && $submission->isCritical() && $consultant->level === 'expert') {
            $score += 15; // Extra bonus for expert on critical case
        }

        return (int) $score;
    }

    /**
     * Calculate average response time in hours
     */
    private function calculateAverageResponseTime(Consultant $consultant): float
    {
        $recentTickets = ConsultationTicket::where('consultant_id', $consultant->id)
            ->whereNotNull('assigned_at')
            ->where('created_at', '>=', now()->subDays(30))
            ->get();

        if ($recentTickets->isEmpty()) {
            return 24; // Default 24 hours if no history
        }

        $totalHours = 0;
        $count = 0;

        foreach ($recentTickets as $ticket) {
            $firstMessage = $ticket->messages()
                ->where('sender_id', $consultant->user_id)
                ->orderBy('created_at')
                ->first();

            if ($firstMessage) {
                $responseTime = $ticket->assigned_at->diffInHours($firstMessage->created_at);
                $totalHours += $responseTime;
                $count++;
            }
        }

        return $count > 0 ? $totalHours / $count : 24;
    }

    /**
     * Check if consultant is available
     */
    private function checkAvailability(Consultant $consultant): bool
    {
        $maxActiveTickets = match($consultant->level) {
            'expert' => 15,
            'senior' => 10,
            'junior' => 5,
            default => 5,
        };

        $activeTickets = $consultant->consultationTickets()
            ->whereIn('status', ['waiting', 'in_progress'])
            ->count();

        if ($activeTickets >= $maxActiveTickets) {
            return false;
        }

        $currentDay = now()->dayOfWeek; // 0 = Sunday, 6 = Saturday
        $currentTime = now()->format('H:i');

        $schedule = $consultant->schedules()
            ->where('day_of_week', $currentDay)
            ->where('is_available', true)
            ->where('start_time', '<=', $currentTime)
            ->where('end_time', '>=', $currentTime)
            ->exists();

        return $schedule || !$consultant->schedules()->exists();
    }

    /**
     * Build routing metadata for analytics
     */
    private function buildRoutingMetadata(Consultant $selected, Collection $allCandidates): array
    {
        return [
            'selected_consultant_id' => $selected->id,
            'selected_score' => $selected->routing_score,
            'total_candidates' => $allCandidates->count(),
            'top_3_candidates' => $allCandidates->sortByDesc('routing_score')
                ->take(3)
                ->map(fn($c) => [
                    'id' => $c->id,
                    'name' => $c->user->name,
                    'score' => $c->routing_score,
                    'level' => $c->level,
                ])
                ->values()
                ->toArray(),
            'assigned_at' => now()->toISOString(),
            'routing_version' => '1.0',
        ];
    }

    /**
     * Manual override - Admin assigns specific consultant
     */
    public function overrideAssignment(
        ConsultationTicket $ticket,
        int $consultantId,
        int $adminId,
        string $reason
    ): Consultant {
        $consultant = Consultant::findOrFail($consultantId);

        $ticket->update([
            'consultant_id' => $consultant->id,
            'assigned_by_id' => $adminId,
            'assigned_by_type' => 'admin',
            'override_reason' => $reason,
            'routing_score' => null,
            'routing_metadata' => [
                'type' => 'manual_override',
                'admin_id' => $adminId,
                'reason' => $reason,
                'assigned_at' => now()->toISOString(),
            ],
            'assigned_at' => now(),
        ]);

        $ticket->team()->updateOrCreate(
            ['consultant_id' => $consultant->id],
            [
                'role' => 'primary',
                'invited_at' => now(),
            ]
        );

        return $consultant;
    }
}
