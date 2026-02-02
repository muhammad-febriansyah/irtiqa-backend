<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConsultationTicketResource extends JsonResource
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
            'ticket_number' => $this->ticket_number,
            'user' => new UserResource($this->whenLoaded('user')),
            'consultant' => new ConsultantResource($this->whenLoaded('consultant')),
            'category' => new ConsultationCategoryResource($this->whenLoaded('category')),
            'subject' => $this->subject,
            'description' => $this->description,
            'screening_answers' => $this->screening_answers,
            'risk_level' => $this->risk_level,
            'urgency' => $this->urgency,
            'status' => $this->status,
            'is_anonymous' => $this->is_anonymous,
            'referred_to_practitioner_id' => $this->referred_to_practitioner_id,
            'practitioner' => new PractitionerResource($this->whenLoaded('practitioner')),
            'assigned_at' => $this->assigned_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
