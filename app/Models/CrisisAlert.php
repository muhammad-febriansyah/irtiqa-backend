<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CrisisAlert extends Model
{
    protected $fillable = [
        'user_id',
        'ticket_id',
        'message_id',
        'alert_type',
        'detected_keywords',
        'severity',
        'status',
        'assigned_to_admin_id',
        'notes',
        'context',
        'acknowledged_at',
        'resolved_at',
    ];

    protected $casts = [
        'detected_keywords' => 'array',
        'acknowledged_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(ConsultationTicket::class, 'ticket_id');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    public function assignedToAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_admin_id');
    }

    /**
     * Scope for pending alerts
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for critical severity
     */
    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }

    /**
     * Acknowledge the alert
     */
    public function acknowledge(int $adminId): void
    {
        $this->update([
            'status' => 'acknowledged',
            'assigned_to_admin_id' => $adminId,
            'acknowledged_at' => now(),
        ]);
    }

    /**
     * Resolve the alert
     */
    public function resolve(string $notes): void
    {
        $this->update([
            'status' => 'resolved',
            'notes' => $notes,
            'resolved_at' => now(),
        ]);
    }
}
