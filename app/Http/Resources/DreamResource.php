<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DreamResource extends JsonResource
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
            'user_id' => $this->user_id,
            'dream_content' => $this->dream_content,
            'dream_date' => $this->dream_date?->toDateString(),
            'dream_time' => $this->dream_time,
            'physical_condition' => $this->physical_condition,
            'emotional_condition' => $this->emotional_condition,
            'classification' => $this->classification,
            'auto_analysis' => $this->auto_analysis,
            'suggested_actions' => $this->suggested_actions,
            'disclaimer_checked' => $this->disclaimer_checked,
            'requested_consultation' => $this->requested_consultation,
            'consultation_ticket_id' => $this->consultation_ticket_id,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
