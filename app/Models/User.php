<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'avatar',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Relationships
     */
    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function consultant(): HasOne
    {
        return $this->hasOne(Consultant::class);
    }

    public function consultationTickets(): HasMany
    {
        return $this->hasMany(ConsultationTicket::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function programs(): HasMany
    {
        return $this->hasMany(Program::class);
    }

    public function dreams(): HasMany
    {
        return $this->hasMany(Dream::class);
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'recipient_id');
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function educationalContents(): HasMany
    {
        return $this->hasMany(EducationalContent::class, 'author_id');
    }

    public function roles(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')->withTimestamps();
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function socialFunds(): HasMany
    {
        return $this->hasMany(SocialFund::class);
    }

    public function journalEntries(): HasMany
    {
        return $this->hasMany(JournalEntry::class);
    }

    public function announcements(): BelongsToMany
    {
        return $this->belongsToMany(Announcement::class, 'announcement_user')
            ->withPivot(['is_read', 'is_dismissed', 'clicked', 'read_at', 'dismissed_at'])
            ->withTimestamps();
    }

    public function readAnnouncements(): BelongsToMany
    {
        return $this->announcements()->wherePivot('is_read', true);
    }

    public function unreadAnnouncements(): BelongsToMany
    {
        return $this->announcements()->wherePivot('is_read', false);
    }

    public function createdAnnouncements(): HasMany
    {
        return $this->hasMany(Announcement::class, 'created_by');
    }

    public function updatedAnnouncements(): HasMany
    {
        return $this->hasMany(Announcement::class, 'updated_by');
    }

    /**
     * Check if user is a consultant
     */
    public function isConsultant(): bool
    {
        return $this->consultant()->exists();
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if user is a kyai
     */
    public function isKyai(): bool
    {
        return $this->hasRole('kyai');
    }

    /**
     * Check if user is a client
     */
    public function isClient(): bool
    {
        return $this->hasRole('client');
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('name', $roleName)->exists();
    }

    /**
     * Check if user has any of the given roles
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->exists();
    }

    /**
     * Check if user has a specific permission
     */
    public function hasPermission(string $permissionName): bool
    {
        foreach ($this->roles as $role) {
            if ($role->hasPermission($permissionName)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Assign role to user
     */
    public function assignRole(string $roleName): void
    {
        $role = Role::where('name', $roleName)->first();
        if ($role) {
            $this->roles()->syncWithoutDetaching($role);
        }
    }

    /**
     * Get avatar URL with fallback to default
     */
    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            if (filter_var($this->avatar, FILTER_VALIDATE_URL)) {
                return $this->avatar;
            }
            return asset('storage/' . $this->avatar);
        }

        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&color=7F9CF5&background=EBF4FF';
    }

    /**
     * Route notifications for WhatsApp channel
     */
    public function routeNotificationForWhatsApp(): ?string
    {
        return $this->profile->phone ?? $this->phone ?? null;
    }

    /**
     * Route notifications for Mail/Mailketing channel
     */
    public function routeNotificationForMail(): ?string
    {
        return $this->email;
    }

    /**
     * Route notifications for Mailketing channel
     */
    public function routeNotificationForMailketing(): ?string
    {
        return $this->email;
    }
}
