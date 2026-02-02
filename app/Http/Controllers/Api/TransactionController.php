<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Package;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    /**
     * Get list of user's transactions
     */
    public function index(Request $request): JsonResponse
    {
        $transactions = Transaction::with(['package'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => TransactionResource::collection($transactions),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    /**
     * Create new transaction
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'package_id' => ['required', 'exists:packages,id'],
            'payment_method' => ['required', 'in:duitku,manual_transfer'],
            'consultation_id' => ['sometimes', 'exists:consultants,id'],
            'ticket_id' => ['sometimes', 'exists:consultation_tickets,id'],
            'payment_channel' => ['required_if:payment_method,duitku', 'string'],
        ]);

        $package = Package::findOrFail($request->package_id);

        // Generate invoice number - Model boot handles this but we can be explicit or let model handle it
        // Transaction model boot handles invoice_number and expired_at

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'package_id' => $package->id,
            'consultant_id' => $request->consultant_id,
            'ticket_id' => $request->ticket_id,
            'amount' => $package->price,
            'admin_fee' => 0, // Could be adjusted
            'total_amount' => $package->price, // + admin_fee
            'payment_method' => $request->payment_method === 'duitku' ? 'payment_gateway' : 'manual_transfer',
            'status' => 'pending',
        ]);

        // If using Duitku, create payment link
        if ($request->payment_method === 'duitku') {
            $duitkuService = app(\App\Services\DuitkuService::class);
            $result = $duitkuService->createPayment(
                $transaction,
                $request->payment_channel,
                $request->user()->email
            );

            if (!$result['success']) {
                $transaction->delete();
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal membuat pembayaran: ' . ($result['message'] ?? 'Unknown error'),
                ], 422);
            }
        }

        $transaction->load('package');

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dibuat',
            'data' => new TransactionResource($transaction),
        ], 201);
    }

    /**
     * Get transaction details
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $transaction = Transaction::with(['package'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new TransactionResource($transaction),
        ]);
    }

    /**
     * Upload payment proof (for manual transfer)
     */
    public function uploadPaymentProof(Request $request, int $id): JsonResponse
    {
        $transaction = Transaction::where('user_id', $request->user()->id)
            ->where('payment_method', 'manual_transfer')
            ->where('payment_status', 'pending')
            ->findOrFail($id);

        $request->validate([
            'payment_proof' => ['required', 'image', 'mimes:jpeg,png,jpg,pdf', 'max:5120'],
        ]);

        // Delete old payment proof if exists
        if ($transaction->payment_proof) {
            Storage::disk('public')->delete($transaction->payment_proof);
        }

        // Store new payment proof
        $path = $request->file('payment_proof')->store('payment-proofs', 'public');

        $transaction->update([
            'transfer_proof' => $path,
            'status' => 'pending', // It's still pending until verified
        ]);

        $transaction->load('package');

        return response()->json([
            'success' => true,
            'message' => 'Payment proof uploaded successfully. Waiting for admin verification.',
            'data' => new TransactionResource($transaction),
        ]);
    }

    /**
     * Cancel transaction
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $transaction = Transaction::where('user_id', $request->user()->id)
            ->where('payment_status', 'pending')
            ->findOrFail($id);

        $request->validate([
            'reason' => ['sometimes', 'string', 'max:500'],
        ]);

        $transaction->update([
            'status' => 'failed', // Or maybe a cancelled status if we add it
            'notes' => 'Cancelled by user: ' . $request->reason,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Transaction cancelled successfully',
        ]);
    }

    /**
     * Check transaction status
     */
    public function checkStatus(Request $request, int $id): JsonResponse
    {
        $transaction = Transaction::where('user_id', $request->user()->id)
            ->findOrFail($id);

        // If using Duitku, check payment status from gateway
        if ($transaction->payment_method === 'payment_gateway' && $transaction->status === 'pending') {
            $duitkuService = app(\App\Services\DuitkuService::class);
            $result = $duitkuService->checkPaymentStatus($transaction->invoice_number);

            if ($result['success']) {
                $status = $result['data']['statusCode'] ?? '';
                if ($status === '00') {
                    $transaction->markAsPaid();
                } elseif ($status === '01') {
                    $transaction->update(['status' => 'failed']);
                } elseif ($status === '02') {
                    $transaction->update(['status' => 'expired']);
                }
            }
        }

        // Check if transaction is expired
        if ($transaction->status === 'pending' && $transaction->expired_at < now()) {
            $transaction->update([
                'status' => 'expired',
            ]);
        }

        $transaction->load('package');

        return response()->json([
            'success' => true,
            'data' => new TransactionResource($transaction),
        ]);
    }
}
