<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageTemplate extends Model
{
    protected $fillable = [
        'title',
        'content',
        'type',
        'consultant_id',
        'is_global',
        'is_active',
        'usage_count',
    ];

    protected $casts = [
        'is_global' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function consultant(): BelongsTo
    {
        return $this->belongsTo(Consultant::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeGlobal($query)
    {
        return $query->where('is_global', true);
    }

    public function scopeForConsultant($query, int $consultantId)
    {
        return $query->where(function ($q) use ($consultantId) {
            $q->where('consultant_id', $consultantId)
              ->orWhere('is_global', true);
        });
    }

    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }
}
