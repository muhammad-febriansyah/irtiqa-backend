<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormField extends Model
{
    protected $fillable = [
        'form_template_id',
        'field_key',
        'label',
        'help_text',
        'field_type',
        'validation_rules',
        'is_required',
        'is_core_field',
        'order',
        'risk_weight',
        'conditional_logic',
    ];

    protected $casts = [
        'validation_rules' => 'array',
        'is_required' => 'boolean',
        'is_core_field' => 'boolean',
        'order' => 'integer',
        'risk_weight' => 'integer',
        'conditional_logic' => 'array',
    ];

    /**
     * Relationships
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(FormTemplate::class, 'form_template_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(FormFieldOption::class)->orderBy('order');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(FormSubmissionAnswer::class);
    }

    /**
     * Helper Methods
     */
    public function isCoreField(): bool
    {
        return $this->is_core_field;
    }

    public function hasOptions(): bool
    {
        return in_array($this->field_type, ['select', 'radio', 'checkbox']);
    }

    public function getValidationRules(): array
    {
        $rules = $this->validation_rules ?? [];

        if ($this->is_required) {
            $rules[] = 'required';
        }

        // Add type-specific rules
        switch ($this->field_type) {
            case 'email':
                $rules[] = 'email';
                break;
            case 'number':
                $rules[] = 'numeric';
                break;
            case 'date':
                $rules[] = 'date';
                break;
        }

        return $rules;
    }

    public function shouldShow(array $answers): bool
    {
        if (empty($this->conditional_logic)) {
            return true;
        }

        // Example: ['field_key' => 'question_1', 'operator' => 'equals', 'value' => 'yes']
        $condition = $this->conditional_logic;
        $dependentFieldKey = $condition['field_key'] ?? null;
        $operator = $condition['operator'] ?? 'equals';
        $expectedValue = $condition['value'] ?? null;

        if (!$dependentFieldKey || !isset($answers[$dependentFieldKey])) {
            return false;
        }

        $actualValue = $answers[$dependentFieldKey];

        return match($operator) {
            'equals' => $actualValue == $expectedValue,
            'not_equals' => $actualValue != $expectedValue,
            'contains' => str_contains($actualValue, $expectedValue),
            default => true,
        };
    }

    /**
     * Scopes
     */
    public function scopeCoreFields($query)
    {
        return $query->where('is_core_field', true);
    }

    public function scopeCustomFields($query)
    {
        return $query->where('is_core_field', false);
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}
