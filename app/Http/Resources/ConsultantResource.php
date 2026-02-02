<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConsultantResource extends JsonResource
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
            'user' => new UserResource($this->whenLoaded('user')),
            'specialist_category' => $this->specialist_category,
            'level' => $this->level,
            'description' => $this->description,
            'experience_years' => $this->experience_years,
            'education' => $this->education,
            'certification' => $this->certification,
            'is_verified' => $this->is_verified,
            'is_active' => $this->is_active,
            'average_rating' => $this->average_rating,
            'total_consultations' => $this->total_consultations,
            'hourly_rate' => $this->hourly_rate,
            'schedules' => ConsultantScheduleResource::collection($this->whenLoaded('schedules')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
