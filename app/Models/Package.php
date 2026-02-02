<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Package extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'sessions_count',
        'duration_days',
        'price',
        'features',
        'tier',
        'is_public',
        'max_sessions',
        'includes_voice_call',
        'voice_call_count',
        'voice_call_duration_minutes',
        'is_active',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'features' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function programs(): HasMany
    {
        return $this->hasMany(Program::class);
    }

    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }
}
