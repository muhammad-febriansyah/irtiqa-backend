<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConsultationTicket;
use App\Models\Consultant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $query = ConsultationTicket::with(['user', 'consultant.user'])
            ->orderByDesc('created_at');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by risk level
        if ($request->filled('risk_level')) {
            $query->where('risk_level', $request->risk_level);
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter by urgency
        if ($request->filled('urgency')) {
            $query->where('urgency', $request->urgency);
        }

        // Filter waiting assignment
        if ($request->boolean('waiting_assignment')) {
            $query->where('status', 'waiting')
                ->whereNull('consultant_id');
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('ticket_number', 'like', "%{$request->search}%")
                    ->orWhereHas('user', function ($q) use ($request) {
                        $q->where('name', 'like', "%{$request->search}%");
                    });
            });
        }

        $tickets = $query->paginate(15)->through(function ($ticket) {
            return [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'user_name' => $ticket->user->name,
                'consultant_name' => $ticket->consultant?->user->name ?? '-',
                'category' => $ticket->category,
                'status' => $ticket->status,
                'status_label' => $this->getStatusLabel($ticket->status),
                'risk_level' => $ticket->risk_level,
                'risk_level_label' => $this->getRiskLevelLabel($ticket->risk_level),
                'urgency' => $ticket->urgency,
                'urgency_label' => $this->getUrgencyLabel($ticket->urgency),
                'assigned_at' => $ticket->assigned_at?->format('d M Y H:i'),
                'completed_at' => $ticket->completed_at?->format('d M Y H:i'),
                'created_at' => $ticket->created_at->format('d M Y H:i'),
            ];
        });

        // Get unique categories for filter
        $categories = ConsultationTicket::distinct()->pluck('category')->toArray();

        return Inertia::render('admin/tickets/index', [
            'tickets' => $tickets,
            'categories' => $categories,
            'filters' => $request->only(['search', 'status', 'risk_level', 'category', 'urgency', 'waiting_assignment']),
        ]);
    }

    public function show(ConsultationTicket $ticket)
    {
        $ticket->load(['user', 'consultant.user', 'referredToConsultant.user']);

        return response()->json([
            'id' => $ticket->id,
            'ticket_number' => $ticket->ticket_number,
            'user' => [
                'id' => $ticket->user->id,
                'name' => $ticket->user->name,
                'email' => $ticket->user->email,
            ],
            'consultant' => $ticket->consultant ? [
                'id' => $ticket->consultant->id,
                'name' => $ticket->consultant->user->name,
                'email' => $ticket->consultant->user->email,
            ] : null,
            'category' => $ticket->category,
            'problem_description' => $ticket->problem_description,
            'screening_answers' => $ticket->screening_answers,
            'status' => $ticket->status,
            'status_label' => $this->getStatusLabel($ticket->status),
            'risk_level' => $ticket->risk_level,
            'risk_level_label' => $this->getRiskLevelLabel($ticket->risk_level),
            'urgency' => $ticket->urgency,
            'urgency_label' => $this->getUrgencyLabel($ticket->urgency),
            'consultant_notes' => $ticket->consultant_notes,
            'screening_conclusion' => $ticket->screening_conclusion,
            'recommendation' => $ticket->recommendation,
            'recommendation_label' => $this->getRecommendationLabel($ticket->recommendation),
            'referred_to_consultant' => $ticket->referredToConsultant ? [
                'id' => $ticket->referredToConsultant->id,
                'name' => $ticket->referredToConsultant->user->name,
            ] : null,
            'assigned_at' => $ticket->assigned_at?->format('d M Y H:i'),
            'completed_at' => $ticket->completed_at?->format('d M Y H:i'),
            'attachments' => $ticket->attachments,
            'created_at' => $ticket->created_at->format('d M Y H:i'),
            'updated_at' => $ticket->updated_at->format('d M Y H:i'),
        ]);
    }

    public function assign(Request $request, ConsultationTicket $ticket)
    {
        $request->validate([
            'consultant_id' => 'required|exists:consultants,id',
        ]);

        $ticket->update([
            'consultant_id' => $request->consultant_id,
            'status' => 'in_progress',
            'assigned_at' => now(),
        ]);

        return back()->with('success', 'Tiket berhasil ditugaskan ke konsultan');
    }

    public function updateStatus(Request $request, ConsultationTicket $ticket)
    {
        $request->validate([
            'status' => 'required|in:waiting,in_progress,completed,referred,rejected',
            'notes' => 'nullable|string|max:1000',
        ]);

        $data = [
            'status' => $request->status,
        ];

        if ($request->status === 'completed') {
            $data['completed_at'] = now();
        }

        if ($request->filled('notes')) {
            $data['consultant_notes'] = $request->notes;
        }

        $ticket->update($data);

        return back()->with('success', 'Status tiket berhasil diperbarui');
    }

    public function updateRiskLevel(Request $request, ConsultationTicket $ticket)
    {
        $request->validate([
            'risk_level' => 'required|in:low,medium,high,critical',
        ]);

        $ticket->update([
            'risk_level' => $request->risk_level,
        ]);

        return back()->with('success', 'Risk level tiket berhasil diperbarui');
    }

    private function getStatusLabel($status)
    {
        return match($status) {
            'waiting' => 'Menunggu',
            'in_progress' => 'Diproses',
            'completed' => 'Selesai',
            'referred' => 'Dirujuk',
            'rejected' => 'Ditolak',
            default => $status,
        };
    }

    private function getRiskLevelLabel($level)
    {
        return match($level) {
            'low' => 'Rendah',
            'medium' => 'Sedang',
            'high' => 'Tinggi',
            'critical' => 'Kritis',
            default => $level ?? '-',
        };
    }

    private function getUrgencyLabel($urgency)
    {
        return match($urgency) {
            'normal' => 'Normal',
            'urgent' => 'Mendesak',
            'emergency' => 'Darurat',
            default => $urgency ?? '-',
        };
    }

    private function getRecommendationLabel($recommendation)
    {
        return match($recommendation) {
            'continue_guidance' => 'Lanjutkan Bimbingan',
            'self_education' => 'Edukasi Mandiri',
            'refer_to_another' => 'Rujuk ke Konsultan Lain',
            'not_suitable' => 'Tidak Sesuai',
            'refer_to_professional' => 'Rujuk ke Profesional',
            default => $recommendation ?? '-',
        };
    }
}
