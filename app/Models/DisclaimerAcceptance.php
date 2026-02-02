<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DisclaimerAcceptance extends Model
{
    protected $fillable = [
        'user_id',
        'disclaimer_type',
        'accepted_at',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if user has accepted a specific disclaimer type
     */
    public static function hasAccepted(int $userId, string $disclaimerType): bool
    {
        return self::where('user_id', $userId)
            ->where('disclaimer_type', $disclaimerType)
            ->exists();
    }
}
