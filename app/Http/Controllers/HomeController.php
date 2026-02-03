<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use App\Models\Consultant;
use App\Models\EducationalContent;
use App\Models\Slider;
use App\Models\SystemSetting;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    public function index()
    {
        $logo = SystemSetting::get('logo');
        $favicon = SystemSetting::get('favicon');

        $featuredConsultants = Consultant::with('user')
            ->where('is_active', true)
            ->where('is_verified', true)
            ->orderByDesc('rating_average')
            ->take(4)
            ->get();

        $latestArticles = EducationalContent::published()
            ->latest('published_at')
            ->take(3)
            ->get();

        $stats = [
            'total_consultants' => Consultant::where('is_verified', true)->count(),
            'total_cases' => Consultant::sum('total_cases'),
            'average_rating' => round(Consultant::avg('rating_average'), 1) ?: 0,
        ];

        $testimonials = Testimonial::active()
            ->ordered()
            ->get();

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'banner' => Banner::latest()->first(),
            'sliders' => Slider::all(),
            'logo' => $logo ? (str_starts_with($logo, 'http') ? $logo : '/storage/' . $logo) : null,
            'favicon' => $favicon ? (str_starts_with($favicon, 'http') ? $favicon : '/storage/' . $favicon) : null,
            'featuredConsultants' => $featuredConsultants,
            'latestArticles' => $latestArticles,
            'stats' => $stats,
            'testimonials' => $testimonials,
        ]);
    }
}
