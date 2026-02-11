<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Consultant;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionApprovalController extends Controller
{
    /**
     * Display list of transactions waiting for approval
     */
    public function index(Request $request): Response
    {
        $query = Transaction::with([
            'user.profile',
            'package',
            'ticket',
            'approvedBy',
            'assignedConsultant.user',
        ])->where('status', 'paid');

        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        } else {
            $query->whereIn('approval_status', ['pending', 'under_review']);
        }

        if ($request->has('urgency')) {
            $query->where('case_urgency', $request->urgency);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQ) use ($search) {
                      $userQ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $transactions = $query->orderBy('paid_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        $stats = [
            'pending' => Transaction::where('status', 'paid')
                ->where('approval_status', 'pending')
                ->count(),
            'under_review' => Transaction::where('status', 'paid')
                ->where('approval_status', 'under_review')
                ->count(),
            'approved_today' => Transaction::where('status', 'paid')
                ->where('approval_status', 'approved')
                ->whereDate('approved_at', today())
                ->count(),
            'rejected_today' => Transaction::where('status', 'paid')
                ->where('approval_status', 'rejected')
                ->whereDate('approved_at', today())
                ->count(),
        ];

        return Inertia::render('admin/transactions/approval/index', [
            'transactions' => $transactions,
            'stats' => $stats,
            'filters' => $request->only(['approval_status', 'urgency', 'search']),
        ]);
    }

    /**
     * Show transaction detail for review
     */
    public function show(Transaction $transaction): Response
    {
        $transaction->load([
            'user.profile',
            'package',
            'ticket',
            'approvedBy',
            'assignedConsultant.user',
        ]);

        $consultants = Consultant::with(['user' => function ($query) {
                $query->whereHas('roles', function ($roleQuery) {
                    $roleQuery->where('name', 'consultant');
                });
            }])
            ->where('is_active', true)
            ->where('is_verified', true)
            ->whereHas('user', function ($query) {
                $query->whereHas('roles', function ($roleQuery) {
                    $roleQuery->where('name', 'consultant');
                });
            })
            ->orderBy('rating_average', 'desc')
            ->get()
            ->map(function ($consultant) {
                return [
                    'id' => $consultant->id,
                    'name' => $consultant->user->name,
                    'email' => $consultant->user->email,
                    'specialist_category' => $consultant->specialist_category ?? [],
                    'level' => $consultant->level ?? 'Junior',
                    'rating_average' => (float) ($consultant->rating_average ?? 0),
                    'total_cases' => (int) ($consultant->total_cases ?? 0),
                    'city' => $consultant->city ?? '',
                    'province' => $consultant->province ?? '',
                ];
            });

        return Inertia::render('admin/transactions/approval/show', [
            'transaction' => $transaction,
            'consultants' => $consultants,
        ]);
    }

    /**
     * Mark transaction as under review
     */
    public function markUnderReview(Transaction $transaction): RedirectResponse
    {
        $transaction->markAsUnderReview(auth()->id());

        return back()->with('success', 'Transaksi ditandai sebagai sedang ditinjau');
    }

    /**
     * Assign consultant to transaction
     */
    public function assignConsultant(Request $request, Transaction $transaction): RedirectResponse
    {
        $request->validate([
            'consultant_id' => ['required', 'exists:consultants,id'],
            'assignment_notes' => ['required', 'string', 'max:1000'],
            'case_analysis' => ['nullable', 'string', 'max:2000'],
            'case_tags' => ['nullable', 'array'],
            'case_tags.*' => ['string', 'max:50'],
            'case_urgency' => ['required', 'in:normal,urgent,emergency'],
        ]);

        $transaction->assignConsultant(
            consultantId: $request->consultant_id,
            assignmentNotes: $request->assignment_notes,
            caseAnalysis: $request->case_analysis,
            caseTags: $request->case_tags,
            caseUrgency: $request->case_urgency
        );

        return back()->with('success', 'Konsultan berhasil di-assign');
    }

    /**
     * Approve transaction and create program
     */
    public function approve(Request $request, Transaction $transaction): RedirectResponse
    {
        if (!$transaction->assigned_consultant_id) {
            return back()->withErrors([
                'message' => 'Harap assign konsultan terlebih dahulu sebelum approve'
            ]);
        }

        $request->validate([
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $success = $transaction->approve(auth()->id());

        if ($success) {

            return redirect()
                ->route('admin.transactions.approval.index')
                ->with('success', 'Transaksi berhasil di-approve dan program telah dibuat');
        }

        return back()->withErrors([
            'message' => 'Gagal approve transaksi'
        ]);
    }

    /**
     * Reject transaction
     */
    public function reject(Request $request, Transaction $transaction): RedirectResponse
    {
        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);

        $transaction->reject(
            rejectedBy: auth()->id(),
            reason: $request->rejection_reason
        );


        return redirect()
            ->route('admin.transactions.approval.index')
            ->with('success', 'Transaksi berhasil di-reject. Proses refund akan dilakukan.');
    }
}
