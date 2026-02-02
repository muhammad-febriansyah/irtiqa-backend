<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EscrowRelease extends Model
{
    protected $fillable = [
        'transaction_id',
        'amount',
        'percentage',
        'trigger',
        'notes',
        'released_by',
        'released_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'released_at' => 'datetime',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by');
    }
}
