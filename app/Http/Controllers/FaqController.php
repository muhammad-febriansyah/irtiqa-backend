<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use App\Models\SystemSetting;
use Inertia\Inertia;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index()
    {
        $faqs = Faq::where('is_published', true)
            ->orderBy('order')
            ->get()
            ->groupBy('category');

        $logo = SystemSetting::get('logo');

        return Inertia::render('Faq', [
            'faqs' => $faqs,
            'logo' => $logo ? (str_starts_with($logo, 'http') ? $logo : '/storage/' . $logo) : null,
        ]);
    }
}
