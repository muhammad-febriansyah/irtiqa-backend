<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Consultant;
use App\Models\Transaction;
use App\Models\ConsultationTicket;
use App\Models\Program;
use App\Models\Rating;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Statistics Cards
        $stats = [
            'total_users' => User::count(),
            'total_consultants' => Consultant::where('is_active', true)->count(),
            'total_transactions' => Transaction::where('status', 'paid')->count(),
            'total_revenue' => Transaction::where('status', 'paid')->sum('total_amount'),
            'revenue_this_month' => Transaction::where('status', 'paid')
                ->whereMonth('paid_at', Carbon::now()->month)
                ->whereYear('paid_at', Carbon::now()->year)
                ->sum('total_amount'),
            'pending_tickets' => ConsultationTicket::where('status', 'waiting')->count(),
            'active_programs' => Program::where('status', 'active')->count(),
            'pending_verifications' => Transaction::where('status', 'pending')
                ->where('payment_method', 'manual_transfer')
                ->whereNotNull('transfer_proof')
                ->count(),
            // Crisis Alerts Statistics
            'pending_crisis_alerts' => \App\Models\CrisisAlert::where('status', 'pending')->count(),
            'critical_alerts' => \App\Models\CrisisAlert::where('severity', 'critical')
                ->whereIn('status', ['pending', 'acknowledged'])
                ->count(),
            'resolved_alerts_this_month' => \App\Models\CrisisAlert::where('status', 'resolved')
                ->whereMonth('resolved_at', Carbon::now()->month)
                ->whereYear('resolved_at', Carbon::now()->year)
                ->count(),
            // Consultant Applications Statistics
            'pending_applications' => \App\Models\ConsultantApplication::where('status', 'pending')->count(),
            'approved_applications_this_month' => \App\Models\ConsultantApplication::where('status', 'approved')
                ->whereMonth('reviewed_at', Carbon::now()->month)
                ->whereYear('reviewed_at', Carbon::now()->year)
                ->count(),
            'rejected_applications_this_month' => \App\Models\ConsultantApplication::where('status', 'rejected')
                ->whereMonth('reviewed_at', Carbon::now()->month)
                ->whereYear('reviewed_at', Carbon::now()->year)
                ->count(),
        ];

        // Average Rating
        $stats['average_rating'] = Rating::where('is_approved', true)->avg('rating') ?? 0;

        // Revenue Chart Data (Last 6 months)
        $revenueChart = Transaction::where('status', 'paid')
            ->where('paid_at', '>=', Carbon::now()->subMonths(6))
            ->selectRaw('DATE_FORMAT(paid_at, "%Y-%m") as month, SUM(total_amount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::createFromFormat('Y-m', $item->month)->format('M Y'),
                    'revenue' => (float) $item->total,
                ];
            });

        // Transactions by Status
        $transactionsByStatus = Transaction::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count,
                    'label' => $this->getStatusLabel($item->status),
                ];
            });

        // Tickets by Category
        $ticketsByCategory = ConsultationTicket::selectRaw('category, COUNT(*) as count')
            ->groupBy('category')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // Latest Transactions
        $latestTransactions = Transaction::with(['user', 'consultant.user', 'package'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'invoice_number' => $transaction->invoice_number,
                    'user_name' => $transaction->user->name,
                    'consultant_name' => $transaction->consultant->user->name ?? '-',
                    'package_name' => $transaction->package->name,
                    'amount' => $transaction->total_amount,
                    'status' => $transaction->status,
                    'status_label' => $this->getStatusLabel($transaction->status),
                    'created_at' => $transaction->created_at->format('d M Y H:i'),
                ];
            });

        // Latest Tickets
        $latestTickets = ConsultationTicket::with(['user', 'consultant.user'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'user_name' => $ticket->user->name,
                    'category' => $ticket->category,
                    'status' => $ticket->status,
                    'status_label' => $this->getTicketStatusLabel($ticket->status),
                    'risk_level' => $ticket->risk_level,
                    'created_at' => $ticket->created_at->format('d M Y H:i'),
                ];
            });

        // Latest Ratings
        $latestRatings = Rating::with(['user', 'consultant.user'])
            ->where('is_approved', true)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(function ($rating) {
                return [
                    'id' => $rating->id,
                    'user_name' => $rating->is_anonymous ? 'Anonymous' : $rating->user->name,
                    'consultant_name' => $rating->consultant->user->name,
                    'rating' => $rating->rating,
                    'review' => $rating->review ? substr($rating->review, 0, 100) . '...' : null,
                    'created_at' => $rating->created_at->format('d M Y H:i'),
                ];
            });

        return Inertia::render('admin/dashboard/index', [
            'stats' => $stats,
            'revenueChart' => $revenueChart,
            'transactionsByStatus' => $transactionsByStatus,
            'ticketsByCategory' => $ticketsByCategory,
            'latestTransactions' => $latestTransactions,
            'latestTickets' => $latestTickets,
            'latestRatings' => $latestRatings,
        ]);
    }

    private function getStatusLabel($status)
    {
        return match ($status) {
            'pending' => 'Menunggu',
            'paid' => 'Dibayar',
            'failed' => 'Gagal',
            'expired' => 'Kedaluwarsa',
            'refunded' => 'Dikembalikan',
            default => $status,
        };
    }

    private function getTicketStatusLabel($status)
    {
        return match ($status) {
            'waiting' => 'Menunggu',
            'in_progress' => 'Diproses',
            'completed' => 'Selesai',
            'referred' => 'Dirujuk',
            'rejected' => 'Ditolak',
            default => $status,
        };
    }
}
