<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AboutUs;
use Illuminate\Http\JsonResponse;

class AboutUsController extends Controller
{
    /**
     * Get the about us content.
     */
    public function index(): JsonResponse
    {
        $aboutUs = AboutUs::first();

        return response()->json([
            'success' => true,
            'data' => $aboutUs,
        ]);
    }
}
