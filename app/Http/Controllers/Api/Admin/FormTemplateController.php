<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\FormTemplateResource;
use App\Models\FormTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FormTemplateController extends Controller
{
    /**
     * Display a listing of form templates
     */
    public function index(Request $request)
    {
        $query = FormTemplate::with(['category', 'creator']);

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $templates = $query->paginate($request->get('per_page', 15));

        return FormTemplateResource::collection($templates);
    }

    /**
     * Store a newly created form template
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:screening,survey,assessment',
            'category_id' => 'nullable|exists:consultation_categories,id',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $template = FormTemplate::create([
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'category_id' => $request->category_id,
            'is_active' => $request->boolean('is_active', false),
            'is_default' => $request->boolean('is_default', false),
            'settings' => $request->settings,
            'created_by' => $request->user()->id,
        ]);

        $template->load(['category', 'creator']);

        return response()->json([
            'success' => true,
            'message' => 'Form template created successfully',
            'data' => new FormTemplateResource($template),
        ], 201);
    }

    /**
     * Display the specified form template
     */
    public function show($id)
    {
        $template = FormTemplate::with(['category', 'creator', 'fields.options'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new FormTemplateResource($template),
        ]);
    }

    /**
     * Update the specified form template
     */
    public function update(Request $request, $id)
    {
        $template = FormTemplate::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|in:screening,survey,assessment',
            'category_id' => 'nullable|exists:consultation_categories,id',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $template->update($request->only([
            'name', 'description', 'type', 'category_id',
            'is_active', 'is_default', 'settings'
        ]));

        $template->load(['category', 'creator']);

        return response()->json([
            'success' => true,
            'message' => 'Form template updated successfully',
            'data' => new FormTemplateResource($template),
        ]);
    }

    /**
     * Remove the specified form template (soft delete)
     */
    public function destroy($id)
    {
        $template = FormTemplate::findOrFail($id);

        // Check if template has submissions
        if ($template->submissions()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete template with existing submissions',
            ], 400);
        }

        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Form template deleted successfully',
        ]);
    }

    /**
     * Activate form template
     */
    public function activate($id)
    {
        $template = FormTemplate::findOrFail($id);
        $template->activate();

        return response()->json([
            'success' => true,
            'message' => 'Form template activated successfully',
            'data' => new FormTemplateResource($template),
        ]);
    }

    /**
     * Deactivate form template
     */
    public function deactivate($id)
    {
        $template = FormTemplate::findOrFail($id);
        $template->deactivate();

        return response()->json([
            'success' => true,
            'message' => 'Form template deactivated successfully',
            'data' => new FormTemplateResource($template),
        ]);
    }

    /**
     * Duplicate form template
     */
    public function duplicate($id)
    {
        $template = FormTemplate::findOrFail($id);
        $newTemplate = $template->duplicate();

        $newTemplate->load(['category', 'creator', 'fields.options']);

        return response()->json([
            'success' => true,
            'message' => 'Form template duplicated successfully',
            'data' => new FormTemplateResource($newTemplate),
        ], 201);
    }
}
