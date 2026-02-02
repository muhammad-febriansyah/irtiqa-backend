<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FormTemplateResource;
use App\Models\FormTemplate;
use Illuminate\Http\Request;

class ScreeningFormController extends Controller
{
    /**
     * Get active forms (for users to fill)
     */
    public function index(Request $request)
    {
        $query = FormTemplate::with(['fields.options'])
            ->active();

        // Filter by type
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->byCategory($request->category_id);
        }

        $forms = $query->orderBy('order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return FormTemplateResource::collection($forms);
    }

    /**
     * Get default form for a category
     */
    public function getDefaultByCategory($categoryId)
    {
        $form = FormTemplate::with(['fields.options'])
            ->active()
            ->where('category_id', $categoryId)
            ->where('is_default', true)
            ->first();

        if (!$form) {
            // Fallback to first active form in category
            $form = FormTemplate::with(['fields.options'])
                ->active()
                ->where('category_id', $categoryId)
                ->first();
        }

        if (!$form) {
            return response()->json([
                'success' => false,
                'message' => 'No active form found for this category',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new FormTemplateResource($form),
        ]);
    }

    /**
     * Get form by slug
     */
    public function showBySlug($slug)
    {
        $form = FormTemplate::with(['fields.options'])
            ->active()
            ->where('slug', $slug)
            ->first();

        if (!$form) {
            return response()->json([
                'success' => false,
                'message' => 'Form not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new FormTemplateResource($form),
        ]);
    }

    /**
     * Get form by ID
     */
    public function show($id)
    {
        $form = FormTemplate::with(['fields.options'])
            ->active()
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new FormTemplateResource($form),
        ]);
    }

    /**
     * Get available form types
     */
    public function types()
    {
        return response()->json([
            'success' => true,
            'data' => [
                [
                    'value' => 'screening',
                    'label' => 'Screening Form',
                    'description' => 'Initial assessment and risk evaluation',
                ],
                [
                    'value' => 'survey',
                    'label' => 'Survey Form',
                    'description' => 'Feedback and satisfaction surveys',
                ],
                [
                    'value' => 'assessment',
                    'label' => 'Assessment Form',
                    'description' => 'Detailed psychological assessment',
                ],
            ],
        ]);
    }
}
