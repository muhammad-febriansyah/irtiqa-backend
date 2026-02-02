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
            'escrow_status' => 'held',
            'escrow_held_amount' => $this->total_amount,
            'escrow_held_at' => now(),
        ]);

        // If there's an associated program, activate it
        if ($this->program) {
            $this->program->update([
                'status' => 'active',
                'start_date' => now(),
            ]);
        } else {
            // Create a program if it doesn't exist and we have a package
            if ($this->package_id) {
                Program::create([
                    'user_id' => $this->user_id,
                    'consultant_id' => $this->consultant_id,
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
        }
    }

    public function releaseEscrow(float $amount, string $trigger, ?int $releasedBy = null, ?string $notes = null): void
    {
        $percentage = ($amount / $this->escrow_held_amount) * 100;

        // Create release record
        $this->escrowReleases()->create([
            'amount' => $amount,
            'percentage' => round($percentage),
            'trigger' => $trigger,
            'notes' => $notes,
            'released_by' => $releasedBy ?? auth()->id(),
            'released_at' => now(),
        ]);

        // Update transaction
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
}
