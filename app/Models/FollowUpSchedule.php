<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FollowUpSchedule extends Model
{
    protected $fillable = [
        'program_id',
        'user_id',
        'scheduled_at',
        'type',
        'status',
        'sent_at',
        'completed_at',
        'response',
        'questions',
        'answers',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'completed_at' => 'datetime',
        'questions' => 'array',
        'answers' => 'array',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for pending follow-ups
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for due follow-ups
     */
    public function scopeDue($query)
    {
        return $query->where('status', 'pending')
            ->where('scheduled_at', '<=', now());
    }

    /**
     * Mark as sent
     */
    public function markAsSent(): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    /**
     * Mark as completed with response
     */
    public function complete(array $answers): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'answers' => $answers,
        ]);
    }

    /**
     * Create follow-up schedules for a program
     */
    public static function createForProgram(int $programId, int $userId): void
    {
        $completedAt = Program::find($programId)->completed_at;

        if (!$completedAt) {
            return;
        }

        $schedules = [
            [
                'type' => '1_week',
                'scheduled_at' => $completedAt->addWeek(),
            ],
            [
                'type' => '1_month',
                'scheduled_at' => $completedAt->addMonth(),
            ],
        ];

        foreach ($schedules as $schedule) {
            self::create([
                'program_id' => $programId,
                'user_id' => $userId,
                'type' => $schedule['type'],
                'scheduled_at' => $schedule['scheduled_at'],
                'status' => 'pending',
                'questions' => self::getDefaultQuestions($schedule['type']),
            ]);
        }
    }

    /**
     * Get default follow-up questions
     */
    private static function getDefaultQuestions(string $type): array
    {
        $questions = [
            '1_week' => [
                'Bagaimana kondisi Anda saat ini?',
                'Apakah ada perubahan yang Anda rasakan?',
                'Apakah Anda masih menjalankan amalan yang disarankan?',
            ],
            '1_month' => [
                'Bagaimana perkembangan kondisi Anda setelah 1 bulan?',
                'Apakah ada tantangan yang Anda hadapi?',
                'Apakah Anda memerlukan pendampingan lanjutan?',
            ],
        ];

        return $questions[$type] ?? [];
    }
}
