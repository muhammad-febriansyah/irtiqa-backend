<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rating extends Model
{
    protected $fillable = [
        'user_id',
        'consultant_id',
        'program_id',
        'rating',
        'review',
        'communication_rating',
        'professionalism_rating',
        'knowledge_rating',
        'helpfulness_rating',
        'is_anonymous',
        'is_approved',
        'is_featured',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'is_approved' => 'boolean',
        'is_featured' => 'boolean',
        'approved_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::created(function ($rating) {
            $rating->consultant->updateRating();
        });

        static::updated(function ($rating) {
            $rating->consultant->updateRating();
        });

        static::deleted(function ($rating) {
            $rating->consultant->updateRating();
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function consultant(): BelongsTo
    {
        return $this->belongsTo(Consultant::class);
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function getAverageDetailRatingAttribute(): float
    {
        $ratings = array_filter([
            $this->communication_rating,
            $this->professionalism_rating,
            $this->knowledge_rating,
            $this->helpfulness_rating,
        ]);

        return count($ratings) > 0 ? round(array_sum($ratings) / count($ratings), 1) : 0;
    }
}
