<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Str;

class ConsultationTicket extends Model
{
    // Consultation type constants
    const TYPE_INITIAL_FREE = 'initial_free';
    const TYPE_PAID_PROGRAM = 'paid_program';

    protected $fillable = [
        'ticket_number',
        'user_id',
        'consultant_id',
        'category',
        'problem_description',
        'screening_answers',
        'status',
        'type',
        'risk_level',
        'urgency',
        'consultant_notes',
        'screening_conclusion',
        'recommendation',
        'referred_to_consultant_id',
        'assigned_at',
        'completed_at',
        'attachments',
    ];

    protected $casts = [
        'screening_answers' => 'array',
        'assigned_at' => 'datetime',
        'completed_at' => 'datetime',
        'attachments' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            if (empty($ticket->ticket_number)) {
                $ticket->ticket_number = 'TKT' . date('YmdHis') . strtoupper(Str::random(4));
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

    public function referredToConsultant(): BelongsTo
    {
        return $this->belongsTo(Consultant::class, 'referred_to_consultant_id');
    }

    public function messages(): MorphMany
    {
        return $this->morphMany(Message::class, 'messageable');
    }

    public function transaction(): HasOne
    {
        return $this->hasOne(Transaction::class, 'ticket_id');
    }

    public function program(): HasOne
    {
        return $this->hasOne(Program::class, 'ticket_id');
    }

    /**
     * Check if this is an initial free consultation
     */
    public function isInitialFree(): bool
    {
        return $this->type === self::TYPE_INITIAL_FREE;
    }

    /**
     * Check if this is a paid program
     */
    public function isPaidProgram(): bool
    {
        return $this->type === self::TYPE_PAID_PROGRAM;
    }
}
