<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormFieldResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'form_template_id' => $this->form_template_id,
            'field_key' => $this->field_key,
            'label' => $this->label,
            'help_text' => $this->help_text,
            'field_type' => $this->field_type,
            'validation_rules' => $this->validation_rules,
            'is_required' => $this->is_required,
            'is_core_field' => $this->is_core_field,
            'order' => $this->order,
            'risk_weight' => $this->risk_weight,
            'conditional_logic' => $this->conditional_logic,
            'options' => $this->whenLoaded('options', function () {
                return $this->options->map(function ($option) {
                    return [
                        'id' => $option->id,
                        'label' => $option->label,
                        'value' => $option->value,
                        'risk_score' => $option->risk_score,
                        'order' => $option->order,
                        'requires_explanation' => $option->requires_explanation,
                        'metadata' => $option->metadata,
                    ];
                });
            }),
            'has_options' => $this->hasOptions(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
