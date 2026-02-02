<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SessionSchedule extends Model
{
    protected $table = 'sessions_schedule';

    protected $fillable = [
        'program_id',
        'consultant_id',
        'user_id',
        'session_number',
        'title',
        'description',
        'type',
        'status',
        'scheduled_at',
        'started_at',
        'ended_at',
        'duration_minutes',
        'agenda',
        'notes',
        'homework',
        'consultant_evaluation',
        'meeting_link',
        'meeting_code',
        'cancellation_reason',
        'cancelled_at',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function consultant(): BelongsTo
    {
        return $this->belongsTo(Consultant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(ProgramTask::class, 'session_id');
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'ended_at' => now(),
        ]);

        $this->program->updateProgress();
    }
}
