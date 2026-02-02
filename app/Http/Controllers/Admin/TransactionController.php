<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['user', 'consultant.user', 'package', 'ticket'])
            ->orderByDesc('created_at');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by payment method
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        // Filter pending verifications
        if ($request->boolean('pending_verification')) {
            $query->where('status', 'pending')
                ->where('payment_method', 'manual_transfer')
                ->whereNotNull('transfer_proof');
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('invoice_number', 'like', "%{$request->search}%")
                    ->orWhereHas('user', function ($q) use ($request) {
                        $q->where('name', 'like', "%{$request->search}%");
                    });
            });
        }

        $transactions = $query->paginate(15)->through(function ($transaction) {
            return [
                'id' => $transaction->id,
                'invoice_number' => $transaction->invoice_number,
                'user_name' => $transaction->user->name,
                'consultant_name' => $transaction->consultant->user->name ?? '-',
                'package_name' => $transaction->package->name,
                'amount' => $transaction->amount,
                'admin_fee' => $transaction->admin_fee,
                'total_amount' => $transaction->total_amount,
                'status' => $transaction->status,
                'status_label' => $this->getStatusLabel($transaction->status),
                'payment_method' => $transaction->payment_method,
                'payment_method_label' => $this->getPaymentMethodLabel($transaction->payment_method),
                'escrow_status' => $transaction->escrow_status,
                'escrow_status_label' => $this->getEscrowStatusLabel($transaction->escrow_status),
                'transfer_proof' => $transaction->transfer_proof ? Storage::url($transaction->transfer_proof) : null,
                'verified_at' => $transaction->verified_at?->format('d M Y H:i'),
                'paid_at' => $transaction->paid_at?->format('d M Y H:i'),
                'created_at' => $transaction->created_at->format('d M Y H:i'),
            ];
        });

        return Inertia::render('admin/transactions/index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'status', 'payment_method', 'pending_verification']),
        ]);
    }

    public function show(Transaction $transaction)
    {
        $transaction->load(['user', 'consultant.user', 'package', 'ticket', 'verifiedBy']);

        return response()->json([
            'id' => $transaction->id,
            'invoice_number' => $transaction->invoice_number,
            'user' => [
                'id' => $transaction->user->id,
                'name' => $transaction->user->name,
                'email' => $transaction->user->email,
            ],
            'consultant' => [
                'id' => $transaction->consultant->id,
                'name' => $transaction->consultant->user->name,
                'email' => $transaction->consultant->user->email,
            ],
            'package' => [
                'id' => $transaction->package->id,
                'name' => $transaction->package->name,
                'type' => $transaction->package->type,
            ],
            'ticket' => [
                'id' => $transaction->ticket->id,
                'ticket_number' => $transaction->ticket->ticket_number,
                'category' => $transaction->ticket->category,
            ],
            'amount' => $transaction->amount,
            'admin_fee' => $transaction->admin_fee,
            'total_amount' => $transaction->total_amount,
            'status' => $transaction->status,
            'status_label' => $this->getStatusLabel($transaction->status),
            'payment_method' => $transaction->payment_method,
            'payment_method_label' => $this->getPaymentMethodLabel($transaction->payment_method),
            'escrow_status' => $transaction->escrow_status,
            'escrow_status_label' => $this->getEscrowStatusLabel($transaction->escrow_status),
            'escrow_held_amount' => $transaction->escrow_held_amount,
            'escrow_released_amount' => $transaction->escrow_released_amount,
            'bank_name' => $transaction->bank_name,
            'account_number' => $transaction->account_number,
            'account_name' => $transaction->account_name,
            'transfer_proof' => $transaction->transfer_proof ? Storage::url($transaction->transfer_proof) : null,
            'transfer_proof_uploaded_at' => $transaction->transfer_proof_uploaded_at?->format('d M Y H:i'),
            'duitku_merchant_code' => $transaction->duitku_merchant_code,
            'duitku_reference' => $transaction->duitku_reference,
            'duitku_payment_method' => $transaction->duitku_payment_method,
            'duitku_va_number' => $transaction->duitku_va_number,
            'verified_by' => $transaction->verifiedBy?->name,
            'verification_notes' => $transaction->verification_notes,
            'verified_at' => $transaction->verified_at?->format('d M Y H:i'),
            'paid_at' => $transaction->paid_at?->format('d M Y H:i'),
            'expired_at' => $transaction->expired_at?->format('d M Y H:i'),
            'notes' => $transaction->notes,
            'created_at' => $transaction->created_at->format('d M Y H:i'),
            'updated_at' => $transaction->updated_at->format('d M Y H:i'),
        ]);
    }

    public function verify(Request $request, Transaction $transaction)
    {
        $request->validate([
            'action' => 'required|in:approve,reject',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($transaction->status !== 'pending' || $transaction->payment_method !== 'manual_transfer') {
            return back()->with('error', 'Transaksi tidak dapat diverifikasi');
        }

        if (!$transaction->transfer_proof) {
            return back()->with('error', 'Bukti transfer belum diunggah');
        }

        if ($request->action === 'approve') {
            $transaction->update([
                'status' => 'paid',
                'verified_by' => auth()->id(),
                'verification_notes' => $request->notes,
                'verified_at' => now(),
                'paid_at' => now(),
                'escrow_status' => 'held',
                'escrow_held_amount' => $transaction->total_amount,
                'escrow_held_at' => now(),
            ]);

            return back()->with('success', 'Transaksi berhasil diverifikasi dan disetujui');
        } else {
            $transaction->update([
                'status' => 'failed',
                'verified_by' => auth()->id(),
                'verification_notes' => $request->notes,
                'verified_at' => now(),
            ]);

            return back()->with('success', 'Transaksi ditolak');
        }
    }

    private function getStatusLabel($status)
    {
        return match($status) {
            'pending' => 'Menunggu',
            'paid' => 'Dibayar',
            'failed' => 'Gagal',
            'expired' => 'Kedaluwarsa',
            'refunded' => 'Dikembalikan',
            default => $status,
        };
    }

    private function getPaymentMethodLabel($method)
    {
        return match($method) {
            'payment_gateway' => 'Payment Gateway',
            'manual_transfer' => 'Transfer Manual',
            default => $method ?? '-',
        };
    }

    private function getEscrowStatusLabel($status)
    {
        return match($status) {
            'held' => 'Ditahan',
            'partially_released' => 'Sebagian Dirilis',
            'fully_released' => 'Dirilis Penuh',
            'refunded' => 'Dikembalikan',
            default => $status ?? '-',
        };
    }
}
