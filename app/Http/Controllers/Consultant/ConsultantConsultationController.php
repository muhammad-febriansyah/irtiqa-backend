<?php

namespace App\Http\Controllers\Consultant;

use App\Http\Controllers\Controller;
use App\Models\Consultant;
use App\Models\ConsultationTicket;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConsultantConsultationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $consultant = Consultant::where('user_id', $user->id)->firstOrFail();

        $filter = $request->get('filter', 'all');

        $query = ConsultationTicket::where('consultant_id', $consultant->id)
            ->with(['user', 'transaction.package']);

        if ($filter !== 'all') {
            $query->where('status', $filter);
        }

        $consultations = $query->latest()
            ->paginate(15)
            ->through(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'user_name' => $ticket->user->name,
                    'user_email' => $ticket->user->email,
                    'package_name' => $ticket->transaction?->package?->name ?? 'Konsultasi Gratis',
                    'category_name' => $ticket->category ?? 'Umum',
                    'status' => $ticket->status,
                    'status_label' => $this->getStatusLabel($ticket->status),
                    'risk_level' => $ticket->risk_level ?? 'low',
                    'dream_title' => $ticket->problem_description ?? 'Konsultasi',
                    'dream_description' => $ticket->problem_description ?? '',
                    'created_at' => $ticket->created_at->format('d M Y H:i'),
                    'responded_at' => $ticket->updated_at->diffForHumans(),
                ];
            });

        return Inertia::render('consultant/consultations/index', [
            'consultations' => $consultations,
            'filter' => $filter,
        ]);
    }

    public function show(Request $request, ConsultationTicket $ticket)
    {
        $user = $request->user();
        $consultant = Consultant::where('user_id', $user->id)->firstOrFail();

        if ($ticket->consultant_id !== $consultant->id) {
            abort(403, 'Unauthorized');
        }

        $ticket->load(['user', 'transaction.package', 'messages.sender']);

        return Inertia::render('consultant/consultations/show', [
            'consultation' => [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'user' => [
                    'id' => $ticket->user->id,
                    'name' => $ticket->user->name,
                    'email' => $ticket->user->email,
                ],
                'package_name' => $ticket->transaction?->package?->name ?? 'Konsultasi Gratis',
                'status' => $ticket->status,
                'status_label' => $this->getStatusLabel($ticket->status),
                'risk_level' => $ticket->risk_level,
                'category' => $ticket->category,
                'description' => $ticket->problem_description,
                'created_at' => $ticket->created_at->format('d M Y H:i'),
                'messages' => $ticket->messages->map(function ($message) {
                    return [
                        'id' => $message->id,
                        'message' => $message->content,
                        'sender_name' => $message->sender->name,
                        'sender_id' => $message->sender_id,
                        'created_at' => $message->created_at->format('d M Y H:i'),
                    ];
                }),
            ],
        ]);
    }

    public function respond(Request $request, ConsultationTicket $ticket)
    {
        $user = $request->user();
        $consultant = Consultant::where('user_id', $user->id)->firstOrFail();

        if ($ticket->consultant_id !== $consultant->id) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $ticket->messages()->create([
            'sender_id' => $user->id,
            'recipient_id' => $ticket->user_id,
            'content' => $validated['message'],
            'type' => 'text',
        ]);

        return redirect()->back()->with('success', 'Pesan berhasil dikirim');
    }

    public function updateStatus(Request $request, ConsultationTicket $ticket)
    {
        $user = $request->user();
        $consultant = Consultant::where('user_id', $user->id)->firstOrFail();

        if ($ticket->consultant_id !== $consultant->id) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'status' => 'required|in:waiting,in_progress,completed,referred,cancelled',
        ]);

        $ticket->update($validated);

        return redirect()->back()->with('success', 'Status konsultasi berhasil diperbarui');
    }

    private function getStatusLabel($status)
    {
        return match ($status) {
            'waiting' => 'Menunggu',
            'in_progress' => 'Berlangsung',
            'completed' => 'Selesai',
            'referred' => 'Dirujuk',
            'cancelled' => 'Dibatalkan',
            default => ucfirst($status),
        };
    }
}
