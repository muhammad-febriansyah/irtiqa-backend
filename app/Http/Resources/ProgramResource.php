<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProgramResource extends JsonResource
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
            'program_number' => $this->program_number,
            'user' => new UserResource($this->whenLoaded('user')),
            'consultant' => new ConsultantResource($this->whenLoaded('consultant')),
            'package' => new PackageResource($this->whenLoaded('package')),
            'title' => $this->title,
            'description' => $this->description,
            'goals' => $this->goals,
            'status' => $this->status,
            'progress_percentage' => $this->progress_percentage,
            'total_sessions' => $this->total_sessions,
            'completed_sessions' => $this->completed_sessions,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'sessions' => SessionScheduleResource::collection($this->whenLoaded('sessions')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
