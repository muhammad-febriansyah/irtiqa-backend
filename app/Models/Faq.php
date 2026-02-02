<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Faq extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'question',
        'answer',
        'category',
        'order',
        'is_published',
        'views_count',
        'helpful_count',
        'tags',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'tags' => 'array',
    ];

    public function scopePublished($query)
    {
        return $query->where('is_published', true)->orderBy('order');
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function incrementViews()
    {
        $this->increment('views_count');
    }

    public function incrementHelpful()
    {
        $this->increment('helpful_count');
    }
}
