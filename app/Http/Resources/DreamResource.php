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
            'title' => $this->title,
            'content' => $this->content,
            'emotional_state' => $this->emotional_state,
            'keywords' => $this->keywords,
            'classification' => $this->classification,
            'suggested_action' => $this->suggested_action,
            'consultation_recommended' => $this->consultation_recommended,
            'consultation_ticket_id' => $this->consultation_ticket_id,
            'dream_date' => $this->dream_date?->toDateString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
