<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormSubmissionResource extends JsonResource
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
            'template' => $this->whenLoaded('template', function () {
                return [
                    'id' => $this->template->id,
                    'name' => $this->template->name,
                    'type' => $this->template->type,
                ];
            }),
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                ];
            }),
            'consultation_ticket_id' => $this->consultation_ticket_id,
            'total_risk_score' => $this->total_risk_score,
            'risk_level' => $this->risk_level,
            'risk_color' => $this->getRiskLevelColor(),
            'is_critical' => $this->isCritical(),
            'needs_expert' => $this->needsExpert(),
            'answers' => $this->whenLoaded('answers', function () {
                return $this->answers->map(function ($answer) {
                    return [
                        'id' => $answer->id,
                        'form_field_id' => $answer->form_field_id,
                        'field' => $answer->field ? [
                            'label' => $answer->field->label,
                            'field_type' => $answer->field->field_type,
                            'risk_weight' => $answer->field->risk_weight,
                        ] : null,
                        'answer_value' => $answer->answer_value,
                        'formatted_value' => $answer->getFormattedValue(),
                        'risk_score' => $answer->risk_score,
                        'explanation' => $answer->explanation,
                        'has_explanation' => $answer->hasExplanation(),
                    ];
                });
            }),
            'submitted_at' => $this->submitted_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
