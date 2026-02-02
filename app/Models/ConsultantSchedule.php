<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultantSchedule extends Model
{
    protected $fillable = [
        'consultant_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_available',
    ];

    protected $casts = [
        'is_available' => 'boolean',
    ];

    public function consultant(): BelongsTo
    {
        return $this->belongsTo(Consultant::class);
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeForDay($query, string $day)
    {
        return $query->where('day_of_week', $day);
    }
}
