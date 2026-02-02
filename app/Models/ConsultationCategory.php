<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConsultationCategory extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function screeningQuestions(): HasMany
    {
        return $this->hasMany(ScreeningQuestion::class, 'category_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
