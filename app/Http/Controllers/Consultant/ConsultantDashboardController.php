<?php

namespace App\Http\Controllers\Consultant;

use App\Http\Controllers\Controller;
use App\Models\Consultant;
use App\Models\ConsultationTicket;
use App\Models\Rating;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConsultantDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $consultant = Consultant::where('user_id', $user->id)->first();

        if (!$consultant) {
            return redirect()->route('home')->with('error', 'Anda tidak memiliki akses sebagai konsultan. Silakan daftar sebagai konsultan terlebih dahulu.');
        }

        $stats = [
            'total_revenue' => Transaction::where('consultant_id', $consultant->id)
                ->where('status', 'paid')
                ->selectRaw('SUM(amount - COALESCE(admin_fee, 0)) as total')
                ->value('total') ?? 0,

            'revenue_this_month' => Transaction::where('consultant_id', $consultant->id)
                ->where('status', 'paid')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->selectRaw('SUM(amount - COALESCE(admin_fee, 0)) as total')
                ->value('total') ?? 0,

            'total_appointments' => ConsultationTicket::where('consultant_id', $consultant->id)
                ->count(),

            'appointments_this_month' => ConsultationTicket::where('consultant_id', $consultant->id)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),

            'pending_consultations' => ConsultationTicket::where('consultant_id', $consultant->id)
                ->whereIn('status', ['waiting', 'in_progress'])
                ->count(),

            'average_rating' => Rating::where('consultant_id', $consultant->id)
                ->avg('rating') ?? 0,

            'total_ratings' => Rating::where('consultant_id', $consultant->id)
                ->count(),
        ];

        $revenueChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $revenue = Transaction::where('consultant_id', $consultant->id)
                ->where('status', 'paid')
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->selectRaw('SUM(amount - COALESCE(admin_fee, 0)) as total')
                ->value('total') ?? 0;

            $revenueChart[] = [
                'month' => $date->format('M Y'),
                'revenue' => (float) $revenue,
            ];
        }

        $recentAppointments = ConsultationTicket::where('consultant_id', $consultant->id)
            ->with(['user', 'transaction.package'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'user_name' => $ticket->user?->name ?? 'User Tidak Ditemukan',
                    'package_name' => $ticket->transaction?->package?->name ?? 'Konsultasi Gratis',
                    'status' => $ticket->status,
                    'status_label' => $this->getStatusLabel($ticket->status),
                    'risk_level' => $ticket->risk_level,
                    'created_at' => $ticket->created_at->diffForHumans(),
                ];
            });

        $recentRatings = Rating::where('consultant_id', $consultant->id)
            ->with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($rating) {
                return [
                    'id' => $rating->id,
                    'user_name' => $rating->user?->name ?? ($rating->is_anonymous ? 'Anonim' : 'User Tidak Ditemukan'),
                    'rating' => $rating->rating,
                    'review' => $rating->review,
                    'created_at' => $rating->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('consultant/dashboard/index', [
            'stats' => $stats,
            'revenueChart' => $revenueChart,
            'recentAppointments' => $recentAppointments,
            'recentRatings' => $recentRatings,
        ]);
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
