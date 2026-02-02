<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EducationalContentResource extends JsonResource
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
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'featured_image' => $this->featured_image,
            'featured_image_url' => $this->featured_image ? asset('storage/' . $this->featured_image) : null,
            'category' => $this->category,
            'tags' => $this->tags,
            'author' => new UserResource($this->whenLoaded('author')),
            'is_published' => $this->is_published,
            'is_featured' => $this->is_featured,
            'views_count' => $this->views_count,
            'published_at' => $this->published_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
