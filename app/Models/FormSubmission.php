<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormSubmission extends Model
{
    protected $fillable = [
        'form_template_id',
        'user_id',
        'consultation_ticket_id',
        'total_risk_score',
        'risk_level',
        'submitted_at',
    ];

    protected $casts = [
        'total_risk_score' => 'integer',
        'submitted_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(FormTemplate::class, 'form_template_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function consultationTicket(): BelongsTo
    {
        return $this->belongsTo(ConsultationTicket::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(FormSubmissionAnswer::class);
    }

    /**
     * Calculate total risk score from all answers
     */
    public function calculateRiskScore(): int
    {
        $totalScore = 0;

        foreach ($this->answers as $answer) {
            // Get field risk weight
            $field = $answer->field;
            $fieldWeight = $field->risk_weight ?? 0;

            // Get answer risk score (from selected option)
            $answerScore = $answer->risk_score ?? 0;

            // Total = field weight + answer score
            $totalScore += ($fieldWeight + $answerScore);
        }

        $this->total_risk_score = $totalScore;
        $this->risk_level = $this->determineRiskLevel($totalScore);
        $this->save();

        return $totalScore;
    }

    /**
     * Determine risk level based on score
     */
    public function determineRiskLevel(int $score): string
    {
        if ($score >= 26) {
            return 'critical'; // Red - Immediate attention
        } elseif ($score >= 16) {
            return 'high'; // Orange - High priority
        } elseif ($score >= 6) {
            return 'medium'; // Yellow - Moderate
        }

        return 'low'; // Green - Low risk
    }

    /**
     * Check if this is a critical case
     */
    public function isCritical(): bool
    {
        return $this->risk_level === 'critical';
    }

    /**
     * Check if needs expert consultant
     */
    public function needsExpert(): bool
    {
        return in_array($this->risk_level, ['critical', 'high']);
    }

    /**
     * Get risk level color for UI
     */
    public function getRiskLevelColor(): string
    {
        return match($this->risk_level) {
            'critical' => '#EF4444', // Red
            'high' => '#F97316',     // Orange
            'medium' => '#EAB308',   // Yellow
            'low' => '#10B981',      // Green
            default => '#6B7280',    // Gray
        };
    }

    /**
     * Scopes
     */
    public function scopeCritical($query)
    {
        return $query->where('risk_level', 'critical');
    }

    public function scopeHighRisk($query)
    {
        return $query->whereIn('risk_level', ['critical', 'high']);
    }

    public function scopeByRiskLevel($query, string $level)
    {
        return $query->where('risk_level', $level);
    }
}
