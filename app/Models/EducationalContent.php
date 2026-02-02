<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class EducationalContent extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'type',
        'category',
        'tags',
        'thumbnail',
        'media_url',
        'duration_minutes',
        'level',
        'reading_time_minutes',
        'is_published',
        'is_featured',
        'published_at',
        'author_id',
        'views_count',
        'likes_count',
        'shares_count',
        'seo_meta',
    ];

    protected $casts = [
        'tags' => 'array',
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
        'seo_meta' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($content) {
            if (empty($content->slug)) {
                $content->slug = Str::slug($content->title);
            }
        });
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true)
                    ->whereNotNull('published_at')
                    ->where('published_at', '<=', now());
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
