<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EducationalContentResource;
use App\Models\EducationalContent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EducationalContentController extends Controller
{
    /**
     * Get list of educational contents
     */
    public function index(Request $request): JsonResponse
    {
        $query = EducationalContent::with('author')
            ->where('is_published', true)
            ->orderBy('is_featured', 'desc')
            ->orderBy('published_at', 'desc');

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $contents = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => EducationalContentResource::collection($contents),
            'meta' => [
                'current_page' => $contents->currentPage(),
                'last_page' => $contents->lastPage(),
                'per_page' => $contents->perPage(),
                'total' => $contents->total(),
            ],
        ]);
    }

    /**
     * Get content details
     */
    public function show(int $id): JsonResponse
    {
        $content = EducationalContent::with('author')
            ->where('is_published', true)
            ->findOrFail($id);

        // Increment views count
        $content->increment('views_count');

        return response()->json([
            'success' => true,
            'data' => new EducationalContentResource($content),
        ]);
    }
}
