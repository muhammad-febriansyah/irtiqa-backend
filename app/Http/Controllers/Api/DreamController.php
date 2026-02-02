<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DreamResource;
use App\Models\Dream;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DreamController extends Controller
{
    /**
     * Get list of user's dreams
     */
    public function index(Request $request): JsonResponse
    {
        $dreams = Dream::where('user_id', $request->user()->id)
            ->orderBy('dream_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => DreamResource::collection($dreams),
            'meta' => [
                'current_page' => $dreams->currentPage(),
                'last_page' => $dreams->lastPage(),
                'per_page' => $dreams->perPage(),
                'total' => $dreams->total(),
            ],
        ]);
    }

    /**
     * Create new dream
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'dream_content' => ['required', 'string'],
            'dream_date' => ['required', 'date'],
            'dream_time' => ['sometimes', 'string'],
            'physical_condition' => ['sometimes', 'string'],
            'emotional_condition' => ['sometimes', 'string'],
            'disclaimer_checked' => ['required', 'boolean'],
        ]);

        $dream = Dream::create([
            'user_id' => $request->user()->id,
            'dream_content' => $request->dream_content,
            'dream_date' => $request->dream_date,
            'dream_time' => $request->dream_time,
            'physical_condition' => $request->physical_condition,
            'emotional_condition' => $request->emotional_condition,
            'disclaimer_checked' => $request->disclaimer_checked,
        ]);

        // Auto-classify dream
        $this->classifyDream($dream);

        return response()->json([
            'success' => true,
            'message' => 'Dream saved successfully',
            'data' => new DreamResource($dream->fresh()),
        ], 201);
    }

    /**
     * Get dream details
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $dream = Dream::where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new DreamResource($dream),
        ]);
    }

    /**
     * Update dream
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $dream = Dream::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $request->validate([
            'dream_content' => ['sometimes', 'string'],
            'dream_date' => ['sometimes', 'date'],
            'dream_time' => ['sometimes', 'string'],
            'physical_condition' => ['sometimes', 'string'],
            'emotional_condition' => ['sometimes', 'string'],
        ]);

        $dream->update($request->only([
            'dream_content',
            'dream_date',
            'dream_time',
            'physical_condition',
            'emotional_condition',
        ]));

        // Re-classify dream
        $this->classifyDream($dream);

        return response()->json([
            'success' => true,
            'message' => 'Dream updated successfully',
            'data' => new DreamResource($dream->fresh()),
        ]);
    }

    /**
     * Delete dream
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $dream = Dream::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $dream->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dream deleted successfully',
        ]);
    }

    /**
     * Classify dream using DreamClassificationService
     */
    private function classifyDream(Dream $dream): void
    {
        $classificationService = app(\App\Services\DreamClassificationService::class);

        $context = [
            'emotional_condition' => $dream->emotional_condition,
            'physical_condition' => $dream->physical_condition,
        ];

        $result = $classificationService->classify($dream->dream_content, $context);
        $suggestedActions = $classificationService->getSuggestedActions($result['classification']);

        $dream->update([
            'classification' => $result['classification'],
            'auto_analysis' => $result['reasoning'],
            'suggested_actions' => $suggestedActions['suggestions'] ?? [],
        ]);
    }
}
