<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dream extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'dream_content',
        'dream_date',
        'dream_time',
        'physical_condition',
        'emotional_condition',
        'classification',
        'auto_analysis',
        'suggested_actions',
        'disclaimer_checked',
        'requested_consultation',
        'consultation_ticket_id',
        'sleep_hours',
        'sleep_time',
        'ate_before_sleep',
        'stressed_today',
    ];

    protected $casts = [
        'dream_date' => 'date',
        'suggested_actions' => 'array',
        'disclaimer_checked' => 'boolean',
        'requested_consultation' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function consultationTicket(): BelongsTo
    {
        return $this->belongsTo(ConsultationTicket::class);
    }

    public function classify(): void
    {
        // Simple classification logic - can be enhanced with AI
        $content = strtolower($this->dream_content);

        // Keywords that might indicate need for consultation
        $sensitiveKeywords = ['takut', 'menakutkan', 'kematian', 'ancaman', 'gelisah'];

        $hasSensitiveContent = false;
        foreach ($sensitiveKeywords as $keyword) {
            if (str_contains($content, $keyword)) {
                $hasSensitiveContent = true;
                break;
            }
        }

        if ($hasSensitiveContent) {
            $this->classification = 'sensitive_indication';
            $this->auto_analysis = 'Mimpi Anda mengandung elemen yang mungkin memerlukan perhatian lebih. Disarankan untuk konsultasi.';
        } elseif ($this->emotional_condition === 'anxious' || $this->emotional_condition === 'sad') {
            $this->classification = 'emotional';
            $this->auto_analysis = 'Mimpi ini kemungkinan terkait kondisi emosional Anda saat ini.';
        } else {
            $this->classification = 'khayali_nafsani';
            $this->auto_analysis = 'Mimpi ini kemungkinan merupakan mimpi biasa yang tidak memerlukan interpretasi khusus.';
        }

        $this->save();
    }
}
