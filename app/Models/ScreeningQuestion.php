<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScreeningQuestion extends Model
{
    protected $fillable = [
        'category_id',
        'question',
        'type',
        'options',
        'is_required',
        'helper_text',
        'sort_order',
        'is_active',
        'risk_scoring',
    ];

    protected $casts = [
        'options' => 'array',
        'is_required' => 'boolean',
        'is_active' => 'boolean',
        'risk_scoring' => 'array',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ConsultationCategory::class, 'category_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    public function scopeForCategory($query, int $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }
}
