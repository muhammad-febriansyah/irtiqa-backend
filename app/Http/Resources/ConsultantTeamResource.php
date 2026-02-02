<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConsultantTeamResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $roleBadge = $this->getRoleBadge();

        return [
            'id' => $this->id,
            'consultation_ticket_id' => $this->consultation_ticket_id,
            'consultant_id' => $this->consultant_id,
            'consultant' => $this->whenLoaded('consultant', function () {
                return [
                    'id' => $this->consultant->id,
                    'user_id' => $this->consultant->user_id,
                    'name' => $this->consultant->user->name,
                    'level' => $this->consultant->level,
                    'specialist_category' => $this->consultant->specialist_category,
                    'average_rating' => $this->consultant->average_rating,
                ];
            }),
            'role' => $this->role,
            'role_badge' => $roleBadge,
            'is_primary' => $this->isPrimary(),
            'is_collaborator' => $this->isCollaborator(),
            'is_referred' => $this->isReferred(),
            'invited_by' => $this->invited_by,
            'inviter' => $this->whenLoaded('inviter', function () {
                return [
                    'id' => $this->inviter->id,
                    'name' => $this->inviter->user->name,
                ];
            }),
            'invited_at' => $this->invited_at?->toISOString(),
            'user_approved_at' => $this->user_approved_at?->toISOString(),
            'is_approved' => $this->isApproved(),
            'is_pending_approval' => $this->isPendingApproval(),
            'is_active' => $this->is_active,
            'internal_notes' => $this->when(
                $request->user() && $request->user()->hasRole('consultant'),
                $this->internal_notes
            ),
            'handover_notes' => $this->handover_notes,
            'permissions' => [
                'can_invite_collaborators' => $this->canInviteCollaborators(),
                'can_refer_case' => $this->canReferCase(),
                'can_close_case' => $this->canCloseCase(),
                'can_view_internal_notes' => $this->canViewInternalNotes(),
                'can_send_messages' => $this->canSendMessages(),
            ],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
