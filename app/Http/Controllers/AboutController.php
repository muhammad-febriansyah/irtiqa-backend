<?php

namespace App\Http\Controllers;

use App\Models\AboutUs;
use App\Models\SystemSetting;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AboutController extends Controller
{
    public function index()
    {
        $about = AboutUs::first();
        $logo = SystemSetting::get('logo');

        return Inertia::render('About', [
            'about' => $about,
            'logo' => $logo ? (str_starts_with($logo, 'http') ? $logo : '/storage/' . $logo) : null,
        ]);
    }
}
