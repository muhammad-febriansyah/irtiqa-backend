<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    /**
     * Get list of FAQs
     */
    public function index(Request $request): JsonResponse
    {
        $query = Faq::where('is_published', true)
            ->orderBy('order', 'asc');

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $faqs = $query->get();

        return response()->json([
            'success' => true,
            'data' => FaqResource::collection($faqs),
        ]);
    }

    /**
     * Get FAQ details
     */
    public function show(int $id): JsonResponse
    {
        $faq = Faq::where('is_published', true)
            ->findOrFail($id);

        // Increment views count
        $faq->increment('views_count');

        return response()->json([
            'success' => true,
            'data' => new FaqResource($faq),
        ]);
    }
}
