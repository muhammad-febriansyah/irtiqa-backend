<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramTask extends Model
{
    protected $fillable = [
        'program_id',
        'session_id',
        'title',
        'description',
        'instructions',
        'type',
        'status',
        'due_date',
        'completed_at',
        'user_submission',
        'attachments',
        'consultant_feedback',
        'feedback_rating',
    ];

    protected $casts = [
        'due_date' => 'date',
        'completed_at' => 'datetime',
        'attachments' => 'array',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(SessionSchedule::class, 'session_id');
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function isOverdue(): bool
    {
        return $this->status !== 'completed' &&
               $this->due_date &&
               $this->due_date->isPast();
    }
}
