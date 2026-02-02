<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class JournalEntry extends Model
{
    protected $fillable = [
        'user_id',
        'entry_date',
        'mood',
        'content',
        'is_encrypted',
        'tags',
    ];

    protected $casts = [
        'entry_date' => 'date',
        'is_encrypted' => 'boolean',
        'tags' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Encrypt content before saving
     */
    public function setContentAttribute($value): void
    {
        $this->attributes['content'] = Crypt::encryptString($value);
        $this->attributes['is_encrypted'] = true;
    }

    /**
     * Decrypt content when retrieving
     */
    public function getContentAttribute($value): string
    {
        if ($this->is_encrypted) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                return $value; // Return as-is if decryption fails
            }
        }
        return $value;
    }

    /**
     * Scope for specific mood
     */
    public function scopeByMood($query, string $mood)
    {
        return $query->where('mood', $mood);
    }

    /**
     * Scope for date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('entry_date', [$startDate, $endDate]);
    }

    /**
     * Get mood statistics for a user
     */
    public static function getMoodStats(int $userId, int $days = 30): array
    {
        $entries = self::where('user_id', $userId)
            ->where('entry_date', '>=', now()->subDays($days))
            ->get();

        $moodCounts = $entries->countBy('mood');

        return [
            'total_entries' => $entries->count(),
            'mood_distribution' => $moodCounts->toArray(),
            'average_mood' => self::calculateAverageMood($entries),
        ];
    }

    /**
     * Calculate average mood (numeric representation)
     */
    private static function calculateAverageMood($entries): ?float
    {
        $moodValues = [
            'very_bad' => 1,
            'bad' => 2,
            'neutral' => 3,
            'good' => 4,
            'very_good' => 5,
        ];

        $total = 0;
        $count = 0;

        foreach ($entries as $entry) {
            if (isset($moodValues[$entry->mood])) {
                $total += $moodValues[$entry->mood];
                $count++;
            }
        }

        return $count > 0 ? round($total / $count, 2) : null;
    }
}
