<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class FormTemplate extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'category_id',
        'is_active',
        'is_default',
        'version',
        'settings',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'settings' => 'array',
        'version' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($template) {
            if (empty($template->slug)) {
                $template->slug = Str::slug($template->name);
            }
        });
    }

    /**
     * Relationships
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ConsultationCategory::class, 'category_id');
    }

    public function fields(): HasMany
    {
        return $this->hasMany(FormField::class)->orderBy('order');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(FormSubmission::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Helper Methods
     */
    public function activate(): bool
    {
        // If setting as default, deactivate other defaults in same category
        if ($this->is_default && $this->category_id) {
            static::where('category_id', $this->category_id)
                ->where('id', '!=', $this->id)
                ->update(['is_default' => false]);
        }

        $this->is_active = true;
        return $this->save();
    }

    public function deactivate(): bool
    {
        $this->is_active = false;
        return $this->save();
    }

    public function duplicate(): self
    {
        $newTemplate = $this->replicate();
        $newTemplate->name = $this->name . ' (Copy)';
        $newTemplate->slug = Str::slug($newTemplate->name);
        $newTemplate->is_active = false;
        $newTemplate->is_default = false;
        $newTemplate->version = 1;
        $newTemplate->save();

        // Duplicate fields
        foreach ($this->fields as $field) {
            $newField = $field->replicate();
            $newField->form_template_id = $newTemplate->id;
            $newField->save();

            // Duplicate options
            foreach ($field->options as $option) {
                $newOption = $option->replicate();
                $newOption->form_field_id = $newField->id;
                $newOption->save();
            }
        }

        return $newTemplate;
    }

    public function getCoreFields()
    {
        return $this->fields()->where('is_core_field', true)->get();
    }

    public function getCustomFields()
    {
        return $this->fields()->where('is_core_field', false)->get();
    }

    public function hasSubmissions(): bool
    {
        return $this->submissions()->exists();
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByCategory($query, int $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }
}
