<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Transaction extends Model
{
    protected $fillable = [
        'invoice_number',
        'user_id',
        'consultant_id',
        'ticket_id',
        'package_id',
        'amount',
        'admin_fee',
        'total_amount',
        'status',
        'payment_method',
        'duitku_merchant_code',
        'duitku_reference',
        'duitku_payment_method',
        'duitku_payment_url',
        'duitku_va_number',
        'duitku_qr_string',
        'duitku_response',
        'bank_name',
        'account_number',
        'account_name',
        'transfer_proof',
        'transfer_proof_uploaded_at',
        'verified_by',
        'verification_notes',
        'verified_at',
        'paid_at',
        'expired_at',
        'notes',
        'escrow_status',
        'escrow_held_amount',
        'escrow_released_amount',
        'escrow_held_at',
        'escrow_first_release_at',
        'escrow_full_release_at',
        'escrow_notes',
        'approval_status',
        'approved_by',
        'approved_at',
        'assigned_consultant_id',
        'assignment_notes',
        'assignment_notified_at',
        'case_analysis',
        'case_tags',
        'case_urgency',
        'rejection_reason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'admin_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'duitku_response' => 'array',
        'transfer_proof_uploaded_at' => 'datetime',
        'verified_at' => 'datetime',
        'paid_at' => 'datetime',
        'expired_at' => 'datetime',
        'escrow_held_amount' => 'decimal:2',
        'escrow_released_amount' => 'decimal:2',
        'escrow_held_at' => 'datetime',
        'escrow_first_release_at' => 'datetime',
        'escrow_full_release_at' => 'datetime',
        'approved_at' => 'datetime',
        'assignment_notified_at' => 'datetime',
        'case_tags' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            if (empty($transaction->invoice_number)) {
                $transaction->invoice_number = 'INV' . date('YmdHis') . strtoupper(Str::random(4));
            }

            if (empty($transaction->expired_at)) {
                $transaction->expired_at = now()->addHours(24);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function consultant(): BelongsTo
    {
        return $this->belongsTo(Consultant::class);
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(ConsultationTicket::class, 'ticket_id');
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function assignedConsultant(): BelongsTo
    {
        return $this->belongsTo(Consultant::class, 'assigned_consultant_id');
    }

    public function program(): HasOne
    {
        return $this->hasOne(Program::class);
    }

    public function escrowReleases(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(EscrowRelease::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired' || ($this->isPending() && $this->expired_at < now());
    }

    public function markAsPaid(): void
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
            'approval_status' => 'pending', // Menunggu approval admin/kyai
            'escrow_status' => 'held',
            'escrow_held_amount' => $this->total_amount,
            'escrow_held_at' => now(),
        ]);

    }

    public function releaseEscrow(float $amount, string $trigger, ?int $releasedBy = null, ?string $notes = null): void
    {
        $percentage = ($amount / $this->escrow_held_amount) * 100;

        $this->escrowReleases()->create([
            'amount' => $amount,
            'percentage' => round($percentage),
            'trigger' => $trigger,
            'notes' => $notes,
            'released_by' => $releasedBy ?? auth()->id(),
            'released_at' => now(),
        ]);

        $newReleasedAmount = $this->escrow_released_amount + $amount;
        $updateData = [
            'escrow_released_amount' => $newReleasedAmount,
        ];

        if (!$this->escrow_first_release_at) {
            $updateData['escrow_first_release_at'] = now();
            $updateData['escrow_status'] = 'partially_released';
        }

        if ($newReleasedAmount >= $this->escrow_held_amount) {
            $updateData['escrow_status'] = 'fully_released';
            $updateData['escrow_full_release_at'] = now();
        }

        $this->update($updateData);
    }

    public function getEscrowRemainingAttribute(): float
    {
        return $this->escrow_held_amount - $this->escrow_released_amount;
    }

    public function getFormattedTotalAttribute(): string
    {
        return 'Rp ' . number_format($this->total_amount, 0, ',', '.');
    }


    /**
     * Check if transaction is waiting for approval
     */
    public function isPendingApproval(): bool
    {
        return $this->isPaid() && $this->approval_status === 'pending';
    }

    /**
     * Check if transaction is approved
     */
    public function isApproved(): bool
    {
        return $this->approval_status === 'approved';
    }

    /**
     * Mark transaction as under review by admin/kyai
     */
    public function markAsUnderReview(int $reviewedBy): void
    {
        $this->update([
            'approval_status' => 'under_review',
            'approved_by' => $reviewedBy,
        ]);
    }

    /**
     * Assign consultant to this transaction
     * Called by admin/kyai after case analysis
     */
    public function assignConsultant(
        int $consultantId,
        string $assignmentNotes,
        ?string $caseAnalysis = null,
        ?array $caseTags = null,
        string $caseUrgency = 'normal'
    ): void {
        $this->update([
            'assigned_consultant_id' => $consultantId,
            'assignment_notes' => $assignmentNotes,
            'case_analysis' => $caseAnalysis,
            'case_tags' => $caseTags,
            'case_urgency' => $caseUrgency,
            'assignment_notified_at' => now(),
            'approval_status' => 'under_review', // Auto set to under_review when consultant assigned
        ]);

        if ($this->ticket) {
            $this->ticket->update([
                'consultant_id' => $consultantId,
                'status' => 'waiting', // Set to waiting for consultant response
                'assigned_at' => now(),
            ]);
        }
    }

    /**
     * Approve transaction and create program
     * Called by admin/kyai after consultant assignment
     */
    public function approve(int $approvedBy): bool
    {
        if (!$this->assigned_consultant_id) {
            return false;
        }

        $this->update([
            'approval_status' => 'approved',
            'approved_by' => $approvedBy,
            'approved_at' => now(),
        ]);

        if (!$this->program && $this->package_id) {
            Program::create([
                'user_id' => $this->user_id,
                'consultant_id' => $this->assigned_consultant_id, // Use assigned consultant
                'ticket_id' => $this->ticket_id,
                'transaction_id' => $this->id,
                'package_id' => $this->package_id,
                'title' => 'Program Bimbingan: ' . $this->package->name,
                'status' => 'active',
                'start_date' => now(),
                'total_sessions' => $this->package->sessions_count ?? 0,
                'remaining_sessions' => $this->package->sessions_count ?? 0,
            ]);
        }

        return true;
    }

    /**
     * Reject transaction
     * Called by admin/kyai if case is not suitable
     */
    public function reject(int $rejectedBy, string $reason): void
    {
        $this->update([
            'approval_status' => 'rejected',
            'approved_by' => $rejectedBy,
            'approved_at' => now(),
            'rejection_reason' => $reason,
        ]);

    }

    /**
     * Get approval status badge color
     */
    public function getApprovalStatusColorAttribute(): string
    {
        return match ($this->approval_status) {
            'pending' => 'yellow',
            'under_review' => 'blue',
            'approved' => 'green',
            'rejected' => 'red',
            default => 'gray',
        };
    }

    /**
     * Get case urgency badge color
     */
    public function getCaseUrgencyColorAttribute(): string
    {
        return match ($this->case_urgency) {
            'emergency' => 'red',
            'urgent' => 'orange',
            'normal' => 'green',
            default => 'gray',
        };
    }
}
