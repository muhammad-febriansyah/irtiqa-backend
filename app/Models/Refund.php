<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Refund extends Model
{
    protected $fillable = [
        'refund_number',
        'transaction_id',
        'user_id',
        'refund_amount',
        'reason',
        'reason_detail',
        'status',
        'approved_by',
        'approved_at',
        'approval_notes',
        'refund_method',
        'refund_details',
        'processed_at',
        'completed_at',
    ];

    protected $casts = [
        'refund_amount' => 'decimal:2',
        'approved_at' => 'datetime',
        'processed_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($refund) {
            if (empty($refund->refund_number)) {
                $refund->refund_number = 'RFD' . date('YmdHis') . strtoupper(Str::random(4));
            }
        });
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function approve(int $approvedById, ?string $notes = null): void
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $approvedById,
            'approved_at' => now(),
            'approval_notes' => $notes,
        ]);
    }

    public function markAsProcessed(): void
    {
        $this->update([
            'status' => 'processed',
            'processed_at' => now(),
        ]);
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }
}
