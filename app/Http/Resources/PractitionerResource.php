<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PractitionerResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'specialization' => $this->specialization,
            'credentials' => $this->credentials,
            'province' => $this->province,
            'city' => $this->city,
            'address' => $this->address,
            'description' => $this->description,
            'is_verified' => $this->is_verified,
            'is_active' => $this->is_active,
            'verification_status' => $this->verification_status,
        ];
    }
}
