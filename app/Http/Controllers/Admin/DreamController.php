<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dream;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DreamController extends Controller
{
    public function index(Request $request)
    {
        $query = Dream::with(['user', 'consultationTicket'])
            ->orderByDesc('created_at');

        // Filter by classification
        if ($request->filled('classification')) {
            $query->where('classification', $request->classification);
        }

        // Filter by requested consultation
        if ($request->boolean('requested_consultation')) {
            $query->where('requested_consultation', true);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('dream_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('dream_date', '<=', $request->date_to);
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('dream_content', 'like', "%{$request->search}%")
                    ->orWhereHas('user', function ($q) use ($request) {
                        $q->where('name', 'like', "%{$request->search}%");
                    });
            });
        }

        $dreams = $query->paginate(15)->through(function ($dream) {
            return [
                'id' => $dream->id,
                'user_name' => $dream->user->name,
                'dream_content' => \Str::limit($dream->dream_content, 100),
                'dream_date' => $dream->dream_date->format('d M Y'),
                'dream_time' => $dream->dream_time ? $this->getDreamTimeLabel($dream->dream_time) : '-',
                'classification' => $dream->classification,
                'classification_label' => $this->getClassificationLabel($dream->classification),
                'requested_consultation' => $dream->requested_consultation,
                'has_ticket' => $dream->consultation_ticket_id ? true : false,
                'ticket_number' => $dream->consultationTicket?->ticket_number ?? '-',
                'created_at' => $dream->created_at->format('d M Y H:i'),
            ];
        });

        return Inertia::render('admin/dreams/index', [
            'dreams' => $dreams,
            'filters' => $request->only(['search', 'classification', 'requested_consultation', 'date_from', 'date_to']),
        ]);
    }

    public function show(Dream $dream)
    {
        $dream->load(['user', 'consultationTicket']);

        return response()->json([
            'id' => $dream->id,
            'user' => [
                'id' => $dream->user->id,
                'name' => $dream->user->name,
                'email' => $dream->user->email,
            ],
            'dream_content' => $dream->dream_content,
            'dream_date' => $dream->dream_date->format('d M Y'),
            'dream_time' => $dream->dream_time,
            'dream_time_label' => $this->getDreamTimeLabel($dream->dream_time),
            'physical_condition' => $dream->physical_condition,
            'physical_condition_label' => $this->getPhysicalConditionLabel($dream->physical_condition),
            'emotional_condition' => $dream->emotional_condition,
            'emotional_condition_label' => $this->getEmotionalConditionLabel($dream->emotional_condition),
            'classification' => $dream->classification,
            'classification_label' => $this->getClassificationLabel($dream->classification),
            'auto_analysis' => $dream->auto_analysis,
            'suggested_actions' => $dream->suggested_actions,
            'disclaimer_checked' => $dream->disclaimer_checked,
            'requested_consultation' => $dream->requested_consultation,
            'consultation_ticket' => $dream->consultationTicket ? [
                'id' => $dream->consultationTicket->id,
                'ticket_number' => $dream->consultationTicket->ticket_number,
                'status' => $dream->consultationTicket->status,
            ] : null,
            'created_at' => $dream->created_at->format('d M Y H:i'),
            'updated_at' => $dream->updated_at->format('d M Y H:i'),
        ]);
    }

    public function destroy(Dream $dream)
    {
        $dream->delete();

        return back()->with('success', 'Laporan mimpi berhasil dihapus');
    }

    private function getDreamTimeLabel($time)
    {
        return match($time) {
            'dawn' => 'Subuh',
            'morning' => 'Pagi',
            'afternoon' => 'Siang',
            'evening' => 'Sore',
            'night' => 'Malam',
            default => $time ?? '-',
        };
    }

    private function getPhysicalConditionLabel($condition)
    {
        return match($condition) {
            'healthy' => 'Sehat',
            'sick' => 'Sakit',
            'tired' => 'Lelah',
            'stressed' => 'Stres',
            default => $condition ?? '-',
        };
    }

    private function getEmotionalConditionLabel($condition)
    {
        return match($condition) {
            'calm' => 'Tenang',
            'happy' => 'Senang',
            'sad' => 'Sedih',
            'anxious' => 'Cemas',
            'angry' => 'Marah',
            default => $condition ?? '-',
        };
    }

    private function getClassificationLabel($classification)
    {
        return match($classification) {
            'khayali_nafsani' => 'Khayali Nafsani',
            'emotional' => 'Emosional',
            'sensitive_indication' => 'Indikasi Sensitif',
            'needs_consultation' => 'Perlu Konsultasi',
            default => $classification ?? '-',
        };
    }
}
