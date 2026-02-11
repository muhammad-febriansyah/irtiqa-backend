<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'excerpt' => $this->excerpt,
            'type' => $this->type,
            'category' => $this->category,
            'priority' => $this->priority,

            'target_role' => $this->target_role,
            'is_for_verified_only' => $this->is_for_verified_only,

            'image' => $this->image ? asset('storage/' . $this->image) : null,
            'icon' => $this->icon,
            'background_color' => $this->background_color,
            'text_color' => $this->text_color,
            'is_dismissible' => $this->is_dismissible,
            'show_on_home' => $this->show_on_home,
            'is_popup' => $this->is_popup,
            'display_position' => $this->display_position,

            'link_url' => $this->link_url,
            'link_text' => $this->link_text,
            'link_target' => $this->link_target,

            'status' => $this->status,
            'is_active' => $this->is_active,
            'is_expired' => $this->is_expired,
            'days_remaining' => $this->days_remaining,

            'published_at' => $this->published_at?->toISOString(),
            'expired_at' => $this->expired_at?->toISOString(),
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),

            'view_count' => $this->view_count,
            'click_count' => $this->click_count,
            'dismiss_count' => $this->dismiss_count,

            'is_read' => $user ? $this->isReadBy($user) : false,
            'is_dismissed' => $user ? $this->isDismissedBy($user) : false,

            'creator' => new UserResource($this->whenLoaded('creator')),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
