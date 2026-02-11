<?php

namespace App\Http\Controllers\Consultant;

use App\Http\Controllers\Controller;
use App\Models\Consultant;
use App\Models\ConsultantWithdrawal;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConsultantEarningController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $consultant = Consultant::where('user_id', $user->id)->firstOrFail();

        $totalEarnings = Transaction::where('consultant_id', $consultant->id)
            ->where('status', 'paid')
            ->selectRaw('SUM(amount - COALESCE(admin_fee, 0)) as total')
            ->value('total') ?? 0;

        $totalWithdrawn = ConsultantWithdrawal::where('consultant_id', $consultant->id)
            ->whereIn('status', ['approved', 'completed'])
            ->sum('amount');

        $pendingWithdrawals = ConsultantWithdrawal::where('consultant_id', $consultant->id)
            ->where('status', 'pending')
            ->sum('amount');

        $availableBalance = $totalEarnings - $totalWithdrawn - $pendingWithdrawals;

        $thisMonthEarnings = Transaction::where('consultant_id', $consultant->id)
            ->where('status', 'paid')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->selectRaw('SUM(amount - COALESCE(admin_fee, 0)) as total')
            ->value('total') ?? 0;

        $transactions = Transaction::where('consultant_id', $consultant->id)
            ->where('status', 'paid')
            ->with(['user', 'package', 'ticket'])
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($transaction) {
                $consultantFee = $transaction->amount - ($transaction->admin_fee ?? 0);
                return [
                    'id' => $transaction->id,
                    'ticket_number' => $transaction->ticket->ticket_number ?? 'N/A',
                    'user_name' => $transaction->user->name,
                    'package_name' => $transaction->package->name,
                    'amount' => $consultantFee,
                    'type' => 'credit',
                    'status' => 'completed',
                    'created_at' => $transaction->created_at->format('d M Y'),
                ];
            });

        $withdrawals = ConsultantWithdrawal::where('consultant_id', $consultant->id)
            ->with('processedBy')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($withdrawal) {
                return [
                    'id' => $withdrawal->id,
                    'amount' => $withdrawal->amount,
                    'bank_name' => $withdrawal->bank_name,
                    'account_number' => $withdrawal->account_number,
                    'account_name' => $withdrawal->account_name,
                    'status' => $withdrawal->status,
                    'requested_at' => $withdrawal->created_at->format('d M Y H:i'),
                    'processed_at' => $withdrawal->processed_at?->format('d M Y H:i'),
                    'notes' => $withdrawal->notes,
                ];
            });

        return Inertia::render('consultant/earnings/index', [
            'summary' => [
                'total_balance' => $totalEarnings,
                'available_balance' => $availableBalance,
                'pending_balance' => $pendingWithdrawals,
                'total_withdrawn' => $totalWithdrawn,
                'this_month_earnings' => $thisMonthEarnings,
            ],
            'transactions' => $transactions,
            'withdrawals' => $withdrawals,
        ]);
    }

    public function transactions(Request $request)
    {
        $user = $request->user();
        $consultant = Consultant::where('user_id', $user->id)->firstOrFail();

        $transactions = Transaction::where('consultant_id', $consultant->id)
            ->where('status', 'paid')
            ->with(['user', 'package'])
            ->latest()
            ->paginate(20)
            ->through(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'invoice_number' => $transaction->invoice_number,
                    'user_name' => $transaction->user->name,
                    'package_name' => $transaction->package->name,
                    'amount' => $transaction->amount,
                    'consultant_fee' => $transaction->consultant_fee,
                    'created_at' => $transaction->created_at->format('d M Y H:i'),
                ];
            });

        return Inertia::render('consultant/earnings/transactions', [
            'transactions' => $transactions,
        ]);
    }

    public function requestWithdrawal(Request $request)
    {
        $user = $request->user();
        $consultant = Consultant::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'amount' => 'required|numeric|min:50000',
            'bank_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:255',
            'account_name' => 'required|string|max:255',
        ]);

        $totalEarnings = Transaction::where('consultant_id', $consultant->id)
            ->where('status', 'paid')
            ->selectRaw('SUM(amount - COALESCE(admin_fee, 0)) as total')
            ->value('total') ?? 0;

        $totalWithdrawn = ConsultantWithdrawal::where('consultant_id', $consultant->id)
            ->whereIn('status', ['approved', 'completed'])
            ->sum('amount');

        $pendingWithdrawals = ConsultantWithdrawal::where('consultant_id', $consultant->id)
            ->where('status', 'pending')
            ->sum('amount');

        $availableBalance = $totalEarnings - $totalWithdrawn - $pendingWithdrawals;

        if ($validated['amount'] > $availableBalance) {
            return redirect()->back()->withErrors(['amount' => 'Saldo tidak mencukupi']);
        }

        ConsultantWithdrawal::create([
            'consultant_id' => $consultant->id,
            'amount' => $validated['amount'],
            'bank_name' => $validated['bank_name'],
            'account_number' => $validated['account_number'],
            'account_name' => $validated['account_name'],
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Permintaan penarikan berhasil diajukan');
    }

    public function withdrawalHistory(Request $request)
    {
        $user = $request->user();
        $consultant = Consultant::where('user_id', $user->id)->firstOrFail();

        $withdrawals = ConsultantWithdrawal::where('consultant_id', $consultant->id)
            ->with('processedBy')
            ->latest()
            ->paginate(15)
            ->through(function ($withdrawal) {
                return [
                    'id' => $withdrawal->id,
                    'amount' => $withdrawal->amount,
                    'bank_name' => $withdrawal->bank_name,
                    'account_number' => $withdrawal->account_number,
                    'account_name' => $withdrawal->account_name,
                    'status' => $withdrawal->status,
                    'status_label' => $this->getStatusLabel($withdrawal->status),
                    'requested_at' => $withdrawal->requested_at->format('d M Y H:i'),
                    'processed_at' => $withdrawal->processed_at?->format('d M Y H:i'),
                    'processed_by' => $withdrawal->processedBy?->name,
                    'notes' => $withdrawal->notes,
                ];
            });

        return Inertia::render('consultant/earnings/withdrawals', [
            'withdrawals' => $withdrawals,
        ]);
    }

    private function getStatusLabel($status)
    {
        return match ($status) {
            'pending' => 'Menunggu',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            'completed' => 'Selesai',
            default => ucfirst($status),
        };
    }
}
