<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Consultant extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'specialist_category',
        'level',
        'city',
        'province',
        'is_active',
        'is_verified',
        'certificate_number',
        'verified_at',
        'bio',
        'rating_average',
        'total_cases',
        'total_ratings',
        'working_hours',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'rating_average' => 'decimal:2',
        'working_hours' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function consultationTickets(): HasMany
    {
        return $this->hasMany(ConsultationTicket::class);
    }

    public function programs(): HasMany
    {
        return $this->hasMany(Program::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(ConsultantSchedule::class);
    }

    public function updateRating(): void
    {
        $this->rating_average = $this->ratings()->avg('rating');
        $this->total_ratings = $this->ratings()->count();
        $this->save();
    }
}
