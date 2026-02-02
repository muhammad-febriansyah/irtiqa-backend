<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormFieldOption extends Model
{
    protected $fillable = [
        'form_field_id',
        'label',
        'value',
        'risk_score',
        'order',
        'requires_explanation',
        'metadata',
    ];

    protected $casts = [
        'risk_score' => 'integer',
        'order' => 'integer',
        'requires_explanation' => 'boolean',
        'metadata' => 'array',
    ];

    /**
     * Relationships
     */
    public function field(): BelongsTo
    {
        return $this->belongsTo(FormField::class, 'form_field_id');
    }

    /**
     * Helper Methods
     */
    public function needsExplanation(): bool
    {
        return $this->requires_explanation;
    }

    public function getRiskScore(): int
    {
        return $this->risk_score;
    }

    /**
     * Scopes
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}
