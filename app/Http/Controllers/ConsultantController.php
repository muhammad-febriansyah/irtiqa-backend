<?php

namespace App\Http\Controllers;

use App\Models\Consultant;
use App\Models\SystemSetting;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ConsultantController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $consultants = Consultant::with('user')
            ->where('is_active', true)
            ->where('is_verified', true)
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->whereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%");
                    })
                        ->orWhere('specialist_category', 'like', "%{$search}%")
                        ->orWhere('bio', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%");
                });
            })
            ->paginate(9)
            ->withQueryString();

        $logo = SystemSetting::get('logo');

        return Inertia::render('Consultants', [
            'consultants' => $consultants,
            'filters' => $request->only(['search']),
            'logo' => $logo ? (str_starts_with($logo, 'http') ? $logo : '/storage/' . $logo) : null,
        ]);
    }

    public function show(Consultant $consultant)
    {
        $consultant->load('user');

        return Inertia::render('ConsultantDetail', [
            'consultant' => $consultant,
        ]);
    }
}
