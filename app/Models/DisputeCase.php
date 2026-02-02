<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class DisputeCase extends Model
{
    protected $fillable = [
        'case_number',
        'reporter_id',
        'reported_id',
        'related_ticket_id',
        'related_program_id',
        'issue_type',
        'description',
        'evidence',
        'status',
        'assigned_to_admin_id',
        'resolution',
        'admin_notes',
        'resolved_at',
    ];

    protected $casts = [
        'evidence' => 'array',
        'resolved_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($dispute) {
            if (empty($dispute->case_number)) {
                $dispute->case_number = 'DSP' . date('YmdHis') . strtoupper(Str::random(4));
            }
        });
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function reported(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_id');
    }

    public function relatedTicket(): BelongsTo
    {
        return $this->belongsTo(ConsultationTicket::class, 'related_ticket_id');
    }

    public function relatedProgram(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'related_program_id');
    }

    public function assignedToAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_admin_id');
    }

    /**
     * Scope for pending disputes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for investigating disputes
     */
    public function scopeInvestigating($query)
    {
        return $query->where('status', 'investigating');
    }

    /**
     * Assign to admin
     */
    public function assignTo(int $adminId): void
    {
        $this->update([
            'status' => 'investigating',
            'assigned_to_admin_id' => $adminId,
        ]);
    }

    /**
     * Resolve the dispute
     */
    public function resolve(string $resolution, ?string $notes = null): void
    {
        $this->update([
            'status' => 'resolved',
            'resolution' => $resolution,
            'admin_notes' => $notes,
            'resolved_at' => now(),
        ]);
    }

    /**
     * Close the dispute
     */
    public function close(?string $notes = null): void
    {
        $this->update([
            'status' => 'closed',
            'admin_notes' => $notes,
            'resolved_at' => $this->resolved_at ?? now(),
        ]);
    }
}
