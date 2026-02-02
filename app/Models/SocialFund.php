<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class SocialFund extends Model
{
    protected $fillable = [
        'reference_number',
        'type',
        'category',
        'amount',
        'description',
        'transaction_id',
        'user_id',
        'approved_by',
        'status',
        'approved_at',
        'disbursed_at',
        'notes',
        'attachments',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
        'disbursed_at' => 'datetime',
        'attachments' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($fund) {
            if (empty($fund->reference_number)) {
                $fund->reference_number = 'SF' . date('YmdHis') . strtoupper(Str::random(4));
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

    public function approve(int $approvedById): void
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $approvedById,
            'approved_at' => now(),
        ]);
    }

    public function disburse(): void
    {
        $this->update([
            'status' => 'disbursed',
            'disbursed_at' => now(),
        ]);
    }

    public static function getTotalBalance(): float
    {
        $income = static::where('type', 'income')
            ->where('status', 'approved')
            ->sum('amount');

        $expense = static::where('type', 'expense')
            ->where('status', 'disbursed')
            ->sum('amount');

        return $income - $expense;
    }
}
