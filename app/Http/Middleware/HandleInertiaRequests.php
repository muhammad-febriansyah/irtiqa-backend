<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => !$request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'siteSettings' => [
                'app_name' => SystemSetting::get('app_name', config('app.name')),
                'tagline' => SystemSetting::get('tagline', ''),
                'logo' => $this->getLogoUrl(),
                'favicon' => $this->getFaviconUrl(),
                'contact_email' => SystemSetting::get('contact_email', 'support@irtiqa.com'),
                'contact_phone' => SystemSetting::get('contact_phone', '+62 812-3456-7890'),
                'contact_address' => SystemSetting::get('contact_address', 'Jakarta, Indonesia'),
                'contact_hours' => SystemSetting::get('contact_hours', 'Senin - Jumat | 09:00 - 17:00 WIB'),
                'facebook_url' => SystemSetting::get('facebook_url', '#'),
                'instagram_url' => SystemSetting::get('instagram_url', '#'),
                'twitter_url' => SystemSetting::get('twitter_url', '#'),
                'tiktok_url' => SystemSetting::get('tiktok_url', '#'),
                'recaptcha_site_key' => config('services.recaptcha.site_key'),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }

    /**
     * Get the logo URL from system settings.
     */
    private function getLogoUrl(): ?string
    {
        $logo = SystemSetting::get('logo');

        if ($logo && Storage::disk('public')->exists($logo)) {
            return asset('storage/' . $logo);
        }

        return null;
    }

    /**
     * Get the favicon URL from system settings.
     */
    private function getFaviconUrl(): ?string
    {
        $favicon = SystemSetting::get('favicon');

        if ($favicon && Storage::disk('public')->exists($favicon)) {
            return asset('storage/' . $favicon);
        }

        return null;
    }
}
