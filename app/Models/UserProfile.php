<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'pseudonym',
        'birth_date',
        'age',
        'gender',
        'phone',
        'city',
        'province',
        'address',
        'primary_concern',
        'onboarding_completed',
        'onboarding_completed_at',
        'disclaimer_accepted',
        'disclaimer_accepted_at',
        'disclaimer_log',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'disclaimer_accepted' => 'boolean',
        'disclaimer_accepted_at' => 'datetime',
        'disclaimer_log' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
