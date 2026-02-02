<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConsultationCategoryResource;
use App\Models\ConsultationCategory;
use Illuminate\Http\JsonResponse;

class ConsultationCategoryController extends Controller
{
    /**
     * Get list of consultation categories
     */
    public function index(): JsonResponse
    {
        $categories = ConsultationCategory::where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => ConsultationCategoryResource::collection($categories),
        ]);
    }
}
