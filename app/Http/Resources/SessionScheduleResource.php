<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionScheduleResource extends JsonResource
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
            'program_id' => $this->program_id,
            'session_number' => $this->session_number,
            'title' => $this->title,
            'agenda' => $this->agenda,
            'scheduled_at' => $this->scheduled_at?->toISOString(),
            'duration_minutes' => $this->duration_minutes,
            'meeting_link' => $this->meeting_link,
            'meeting_platform' => $this->meeting_platform,
            'status' => $this->status,
            'notes' => $this->notes,
            'homework' => $this->homework,
            'attended_at' => $this->attended_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
        ];
    }
}
