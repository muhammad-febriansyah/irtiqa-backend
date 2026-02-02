<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use App\Models\Banner;
use App\Models\Slider;
use App\Models\SystemSetting;

Route::get('/', function () {
    $logo = SystemSetting::get('logo');
    $favicon = SystemSetting::get('favicon');

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'banner' => Banner::latest()->first(),
        'sliders' => Slider::all(),
        'logo' => $logo ? (str_starts_with($logo, 'http') ? $logo : '/storage/' . $logo) : null,
        'favicon' => $favicon ? (str_starts_with($favicon, 'http') ? $favicon : '/storage/' . $favicon) : null,
    ]);
})->name('home');

require __DIR__ . '/settings.php';
require __DIR__ . '/admin.php';
