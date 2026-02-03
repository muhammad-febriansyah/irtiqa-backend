<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Inertia\Inertia;
use Illuminate\Http\Request;

class HowItWorksController extends Controller
{
    public function index()
    {
        $logo = SystemSetting::get('logo');

        return Inertia::render('HowItWorks', [
            'logo' => $logo ? (str_starts_with($logo, 'http') ? $logo : '/storage/' . $logo) : null,
        ]);
    }
}
