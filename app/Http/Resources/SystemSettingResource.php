<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SystemSettingResource extends JsonResource
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
            'key' => $this->key,
            'value' => $this->getCastedValue(),
            'type' => $this->type,
            'group' => $this->group,
            'description' => $this->description,
            'is_public' => $this->is_public,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Get properly casted value
     */
    private function getCastedValue()
    {
        return match ($this->type) {
            'boolean' => (bool) $this->value,
            'number' => is_numeric($this->value) ? (strpos($this->value, '.') !== false ? (float) $this->value : (int) $this->value) : $this->value,
            'json', 'array' => is_string($this->value) ? json_decode($this->value, true) : $this->value,
            default => $this->value,
        };
    }
}
