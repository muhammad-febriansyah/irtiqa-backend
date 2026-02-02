<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Practitioner extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'title',
        'bio',
        'photo',
        'specialties',
        'description',
        'province',
        'city',
        'address',
        'phone',
        'whatsapp',
        'email',
        'verification_status',
        'verification_notes',
        'verified_at',
        'verified_by',
        'is_active',
        'credentials',
        'documents',
        'availability_schedule',
        'accepting_referrals',
        'referral_count',
        'average_rating',
    ];

    protected $casts = [
        'specialties' => 'array',
        'credentials' => 'array',
        'documents' => 'array',
        'availability_schedule' => 'array',
        'is_active' => 'boolean',
        'accepting_referrals' => 'boolean',
        'verified_at' => 'datetime',
    ];

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function scopeVerified($query)
    {
        return $query->where('verification_status', 'verified');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAcceptingReferrals($query)
    {
        return $query->where('accepting_referrals', true);
    }

    public function scopeByRegion($query, $province = null, $city = null)
    {
        if ($province) {
            $query->where('province', $province);
        }
        if ($city) {
            $query->where('city', $city);
        }
        return $query;
    }

    public function markAsVerified($verifiedBy)
    {
        $this->update([
            'verification_status' => 'verified',
            'verified_at' => now(),
            'verified_by' => $verifiedBy,
        ]);
    }

    public function incrementReferrals()
    {
        $this->increment('referral_count');
    }
}
