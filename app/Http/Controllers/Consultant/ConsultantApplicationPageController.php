<?php

namespace App\Http\Controllers\Consultant;

use App\Http\Controllers\Controller;
use App\Models\ConsultantApplication;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class ConsultantApplicationPageController extends Controller
{
    /**
     * Display the consultant application page
     */
    public function index(): Response
    {
        return Inertia::render('consultant/application/index');
    }

    /**
     * Get user's consultant applications
     */
    public function getApplications(): JsonResponse
    {
        $applications = ConsultantApplication::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }
}
