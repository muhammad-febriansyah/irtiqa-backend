<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Program extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'program_code',
        'user_id',
        'consultant_id',
        'ticket_id',
        'transaction_id',
        'package_id',
        'title',
        'goals',
        'summary',
        'status',
        'start_date',
        'end_date',
        'total_sessions',
        'completed_sessions',
        'remaining_sessions',
        'progress_percentage',
        'current_phase',
        'closing_summary',
        'next_recommendations',
        'completed_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'completed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($program) {
            if (empty($program->program_code)) {
                $program->program_code = 'PRG' . date('YmdHis') . strtoupper(Str::random(4));
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

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(SessionSchedule::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(ProgramTask::class);
    }

    public function messages(): MorphMany
    {
        return $this->morphMany(Message::class, 'messageable');
    }

    public function rating(): HasOne
    {
        return $this->hasOne(Rating::class);
    }

    public function updateProgress(): void
    {
        $this->completed_sessions = $this->sessions()->where('status', 'completed')->count();
        $this->remaining_sessions = $this->total_sessions - $this->completed_sessions;
        $this->progress_percentage = $this->total_sessions > 0
            ? round(($this->completed_sessions / $this->total_sessions) * 100)
            : 0;
        $this->save();
    }
}
