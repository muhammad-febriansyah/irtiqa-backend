<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormSubmissionAnswer extends Model
{
    protected $fillable = [
        'form_submission_id',
        'form_field_id',
        'answer_value',
        'risk_score',
        'explanation',
    ];

    protected $casts = [
        'answer_value' => 'array', // Can be string, array, number, etc
        'risk_score' => 'integer',
    ];

    /**
     * Relationships
     */
    public function submission(): BelongsTo
    {
        return $this->belongsTo(FormSubmission::class, 'form_submission_id');
    }

    public function field(): BelongsTo
    {
        return $this->belongsTo(FormField::class, 'form_field_id');
    }

    /**
     * Get formatted answer value
     */
    public function getFormattedValue(): string
    {
        $value = $this->answer_value;

        if (is_array($value)) {
            return implode(', ', $value);
        }

        return (string) $value;
    }

    /**
     * Calculate risk score for this answer
     */
    public function calculateRiskScore(): int
    {
        $field = $this->field;
        $value = $this->answer_value;

        // If field has options (select, radio, checkbox)
        if ($field->hasOptions()) {
            $option = $field->options()->where('value', $value)->first();
            if ($option) {
                $this->risk_score = $option->risk_score;
                $this->save();
                return $option->risk_score;
            }
        }

        // For text/number fields, risk_score is set manually or 0
        return $this->risk_score ?? 0;
    }

    /**
     * Check if explanation is provided
     */
    public function hasExplanation(): bool
    {
        return !empty($this->explanation);
    }
}
