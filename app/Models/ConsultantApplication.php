<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultantApplication extends Model
{
    protected $fillable = [
        'user_id',
        'full_name',
        'phone',
        'province',
        'city',
        'certification_type',
        'certification_number',
        'certification_file',
        'experience_years',
        'bio',
        'specializations',
        'status',
        'reviewed_by_admin_id',
        'reviewed_at',
        'rejection_reason',
        'admin_notes',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'experience_years' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewedByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_admin_id');
    }

    /**
     * Scope for pending applications
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved applications
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Approve the application
     */
    public function approve(int $adminId, ?string $notes = null): void
    {
        $this->update([
            'status' => 'approved',
            'reviewed_by_admin_id' => $adminId,
            'reviewed_at' => now(),
            'admin_notes' => $notes,
        ]);

        // Create consultant record
        Consultant::create([
            'user_id' => $this->user_id,
            'specialization' => $this->specializations,
            'bio' => $this->bio,
            'province' => $this->province,
            'city' => $this->city,
            'is_active' => true,
        ]);

        // Assign consultant role
        $this->user->assignRole('consultant');
    }

    /**
     * Reject the application
     */
    public function reject(int $adminId, string $reason, ?string $notes = null): void
    {
        $this->update([
            'status' => 'rejected',
            'reviewed_by_admin_id' => $adminId,
            'reviewed_at' => now(),
            'rejection_reason' => $reason,
            'admin_notes' => $notes,
        ]);
    }
}
