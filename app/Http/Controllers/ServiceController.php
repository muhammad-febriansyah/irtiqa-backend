<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\SystemSetting;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        $logo = SystemSetting::get('logo');

        // Get active packages, ordered by sort_order
        $packages = Package::where('is_active', true)
            ->where('is_public', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($package) {
                // Ensure features is always an array
                $features = $package->features;
                if (is_string($features)) {
                    $features = json_decode($features, true) ?? [];
                } elseif (!is_array($features)) {
                    $features = [];
                }

                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'slug' => $package->slug,
                    'description' => $package->description,
                    'type' => $package->type,
                    'price' => $package->price,
                    'formatted_price' => $package->formatted_price,
                    'features' => $features,
                    'is_featured' => $package->is_featured,
                    'sessions_count' => $package->sessions_count,
                    'duration_days' => $package->duration_days,
                ];
            });

        return Inertia::render('Services', [
            'packages' => $packages,
            'logo' => $logo ? (str_starts_with($logo, 'http') ? $logo : '/storage/' . $logo) : null,
        ]);
    }
}
