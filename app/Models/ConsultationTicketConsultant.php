<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultationTicketConsultant extends Model
{
    protected $fillable = [
        'consultation_ticket_id',
        'consultant_id',
        'role',
        'invited_by',
        'invited_at',
        'user_approved_at',
        'is_active',
        'internal_notes',
        'handover_notes',
    ];

    protected $casts = [
        'invited_at' => 'datetime',
        'user_approved_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    const ROLE_PRIMARY = 'primary';
    const ROLE_COLLABORATOR = 'collaborator';
    const ROLE_REFERRED = 'referred';

    /**
     * Relationships
     */
    public function consultationTicket(): BelongsTo
    {
        return $this->belongsTo(ConsultationTicket::class);
    }

    public function consultant(): BelongsTo
    {
        return $this->belongsTo(Consultant::class);
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(Consultant::class, 'invited_by');
    }

    /**
     * Role checks
     */
    public function isPrimary(): bool
    {
        return $this->role === self::ROLE_PRIMARY;
    }

    public function isCollaborator(): bool
    {
        return $this->role === self::ROLE_COLLABORATOR;
    }

    public function isReferred(): bool
    {
        return $this->role === self::ROLE_REFERRED;
    }

    /**
     * Approval status
     */
    public function isApproved(): bool
    {
        // Primary and referred don't need approval
        if ($this->isPrimary() || $this->isReferred()) {
            return true;
        }

        // Collaborators need user approval
        return $this->user_approved_at !== null;
    }

    public function isPendingApproval(): bool
    {
        return $this->isCollaborator() && $this->user_approved_at === null;
    }

    public function approve(): bool
    {
        if (!$this->isCollaborator()) {
            return false;
        }

        $this->user_approved_at = now();
        return $this->save();
    }

    /**
     * Permissions
     */
    public function canInviteCollaborators(): bool
    {
        return $this->isPrimary();
    }

    public function canReferCase(): bool
    {
        return $this->isPrimary();
    }

    public function canCloseCase(): bool
    {
        return $this->isPrimary();
    }

    public function canViewInternalNotes(): bool
    {
        return $this->isApproved();
    }

    public function canSendMessages(): bool
    {
        return $this->isApproved() && $this->is_active;
    }

    /**
     * Get role badge for UI
     */
    public function getRoleBadge(): array
    {
        return match($this->role) {
            self::ROLE_PRIMARY => [
                'label' => 'Primary',
                'color' => '#3B82F6', // Blue
                'icon' => '👤',
            ],
            self::ROLE_COLLABORATOR => [
                'label' => 'Collaborator',
                'color' => '#10B981', // Green
                'icon' => '👥',
            ],
            self::ROLE_REFERRED => [
                'label' => 'Specialist',
                'color' => '#8B5CF6', // Purple
                'icon' => '⭐',
            ],
            default => [
                'label' => 'Unknown',
                'color' => '#6B7280', // Gray
                'icon' => '?',
            ],
        };
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeApproved($query)
    {
        return $query->where(function ($q) {
            $q->whereIn('role', [self::ROLE_PRIMARY, self::ROLE_REFERRED])
              ->orWhereNotNull('user_approved_at');
        });
    }

    public function scopePrimary($query)
    {
        return $query->where('role', self::ROLE_PRIMARY);
    }

    public function scopeCollaborators($query)
    {
        return $query->where('role', self::ROLE_COLLABORATOR);
    }

    public function scopePendingApproval($query)
    {
        return $query->where('role', self::ROLE_COLLABORATOR)
                     ->whereNull('user_approved_at');
    }
}
