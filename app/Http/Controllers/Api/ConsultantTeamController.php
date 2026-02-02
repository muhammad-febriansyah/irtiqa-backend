<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConsultantTeamResource;
use App\Models\ConsultationTicket;
use App\Models\ConsultationTicketConsultant;
use App\Models\Consultant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ConsultantTeamController extends Controller
{
    /**
     * Get team members for a ticket
     */
    public function index($ticketId)
    {
        $ticket = ConsultationTicket::findOrFail($ticketId);

        $team = $ticket->team()
            ->with(['consultant.user', 'inviter.user'])
            ->active()
            ->orderByRaw("FIELD(role, 'primary', 'referred', 'collaborator')")
            ->get();

        return ConsultantTeamResource::collection($team);
    }

    /**
     * Invite collaborator (by primary consultant)
     */
    public function inviteCollaborator(Request $request, $ticketId)
    {
        $ticket = ConsultationTicket::findOrFail($ticketId);
        $user = $request->user();

        // Get consultant record
        $inviterConsultant = Consultant::where('user_id', $user->id)->first();
        if (!$inviterConsultant) {
            return response()->json([
                'success' => false,
                'message' => 'Only consultants can invite collaborators',
            ], 403);
        }

        // Check if user is primary consultant
        $primaryTeamMember = $ticket->team()->primary()
            ->where('consultant_id', $inviterConsultant->id)
            ->first();

        if (!$primaryTeamMember) {
            return response()->json([
                'success' => false,
                'message' => 'Only primary consultant can invite collaborators',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'consultant_id' => 'required|exists:consultants,id',
            'internal_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check if consultant is already in team
        if ($ticket->team()->where('consultant_id', $request->consultant_id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Consultant is already part of this team',
            ], 400);
        }

        DB::beginTransaction();
        try {
            $teamMember = $ticket->team()->create([
                'consultant_id' => $request->consultant_id,
                'role' => ConsultationTicketConsultant::ROLE_COLLABORATOR,
                'invited_by' => $inviterConsultant->id,
                'invited_at' => now(),
                'internal_notes' => $request->internal_notes,
                'is_active' => true,
            ]);

            DB::commit();

            $teamMember->load(['consultant.user', 'inviter.user']);

            return response()->json([
                'success' => true,
                'message' => 'Collaborator invited successfully. Waiting for user approval.',
                'data' => new ConsultantTeamResource($teamMember),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to invite collaborator: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve collaborator (by ticket owner/user)
     */
    public function approveCollaborator(Request $request, $ticketId, $teamMemberId)
    {
        $ticket = ConsultationTicket::findOrFail($ticketId);
        $user = $request->user();

        // Check if user owns this ticket
        if ($ticket->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only ticket owner can approve collaborators',
            ], 403);
        }

        $teamMember = $ticket->team()->findOrFail($teamMemberId);

        if (!$teamMember->isCollaborator()) {
            return response()->json([
                'success' => false,
                'message' => 'Only collaborators need approval',
            ], 400);
        }

        if ($teamMember->isApproved()) {
            return response()->json([
                'success' => false,
                'message' => 'Collaborator is already approved',
            ], 400);
        }

        $teamMember->approve();
        $teamMember->load(['consultant.user', 'inviter.user']);

        return response()->json([
            'success' => true,
            'message' => 'Collaborator approved successfully',
            'data' => new ConsultantTeamResource($teamMember),
        ]);
    }

    /**
     * Reject collaborator (by ticket owner/user)
     */
    public function rejectCollaborator(Request $request, $ticketId, $teamMemberId)
    {
        $ticket = ConsultationTicket::findOrFail($ticketId);
        $user = $request->user();

        // Check if user owns this ticket
        if ($ticket->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only ticket owner can reject collaborators',
            ], 403);
        }

        $teamMember = $ticket->team()->findOrFail($teamMemberId);

        if (!$teamMember->isCollaborator()) {
            return response()->json([
                'success' => false,
                'message' => 'Only collaborators can be rejected',
            ], 400);
        }

        $teamMember->delete();

        return response()->json([
            'success' => true,
            'message' => 'Collaborator rejected and removed from team',
        ]);
    }

    /**
     * Refer case to specialist (by primary consultant)
     */
    public function referCase(Request $request, $ticketId)
    {
        $ticket = ConsultationTicket::findOrFail($ticketId);
        $user = $request->user();

        // Get consultant record
        $referrerConsultant = Consultant::where('user_id', $user->id)->first();
        if (!$referrerConsultant) {
            return response()->json([
                'success' => false,
                'message' => 'Only consultants can refer cases',
            ], 403);
        }

        // Check if user is primary consultant
        $primaryTeamMember = $ticket->team()->primary()
            ->where('consultant_id', $referrerConsultant->id)
            ->first();

        if (!$primaryTeamMember) {
            return response()->json([
                'success' => false,
                'message' => 'Only primary consultant can refer case',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'consultant_id' => 'required|exists:consultants,id',
            'handover_notes' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Change current primary to collaborator
            $primaryTeamMember->update([
                'role' => ConsultationTicketConsultant::ROLE_COLLABORATOR,
                'user_approved_at' => now(), // Auto-approve when downgraded
            ]);

            // Add new specialist as primary (referred)
            $newPrimary = $ticket->team()->create([
                'consultant_id' => $request->consultant_id,
                'role' => ConsultationTicketConsultant::ROLE_REFERRED,
                'invited_by' => $referrerConsultant->id,
                'invited_at' => now(),
                'handover_notes' => $request->handover_notes,
                'is_active' => true,
            ]);

            // Update ticket consultant
            $ticket->update([
                'consultant_id' => $request->consultant_id,
            ]);

            DB::commit();

            $newPrimary->load(['consultant.user', 'inviter.user']);

            return response()->json([
                'success' => true,
                'message' => 'Case referred successfully. New specialist is now the primary consultant.',
                'data' => new ConsultantTeamResource($newPrimary),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to refer case: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove team member (by primary consultant)
     */
    public function removeMember(Request $request, $ticketId, $teamMemberId)
    {
        $ticket = ConsultationTicket::findOrFail($ticketId);
        $user = $request->user();

        // Get consultant record
        $currentConsultant = Consultant::where('user_id', $user->id)->first();
        if (!$currentConsultant) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        // Check if user is primary consultant
        $primaryTeamMember = $ticket->team()->primary()
            ->where('consultant_id', $currentConsultant->id)
            ->first();

        if (!$primaryTeamMember) {
            return response()->json([
                'success' => false,
                'message' => 'Only primary consultant can remove team members',
            ], 403);
        }

        $teamMember = $ticket->team()->findOrFail($teamMemberId);

        // Cannot remove primary consultant
        if ($teamMember->isPrimary()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot remove primary consultant',
            ], 400);
        }

        $teamMember->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Team member removed successfully',
        ]);
    }

    /**
     * Get pending approvals for user
     */
    public function pendingApprovals(Request $request)
    {
        $user = $request->user();

        $pendingTeams = ConsultationTicketConsultant::with([
            'consultationTicket',
            'consultant.user',
            'inviter.user'
        ])
            ->whereHas('consultationTicket', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->pendingApproval()
            ->get();

        return ConsultantTeamResource::collection($pendingTeams);
    }
}
