<?php

namespace App\Http\Controllers;

use App\Models\LegalPage;
use App\Models\SystemSetting;
use Inertia\Inertia;
use Illuminate\Http\Request;

class LegalController extends Controller
{
    public function privacy()
    {
        $page = LegalPage::where('slug', 'kebijakan-privasi')->first();
        $logo = SystemSetting::get('logo');

        return Inertia::render('Legal', [
            'page' => $page,
            'logo' => $logo ? (str_starts_with($logo, 'http') ? $logo : '/storage/' . $logo) : null,
            'pageType' => 'privacy',
        ]);
    }

    public function terms()
    {
        $page = LegalPage::where('slug', 'syarat-ketentuan')->first();
        $logo = SystemSetting::get('logo');

        return Inertia::render('Legal', [
            'page' => $page,
            'logo' => $logo ? (str_starts_with($logo, 'http') ? $logo : '/storage/' . $logo) : null,
            'pageType' => 'terms',
        ]);
    }
}
