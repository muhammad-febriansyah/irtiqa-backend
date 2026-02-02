<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\FormFieldResource;
use App\Models\FormField;
use App\Models\FormTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class FormFieldController extends Controller
{
    /**
     * Display fields for a form template
     */
    public function index($templateId)
    {
        $template = FormTemplate::findOrFail($templateId);
        $fields = $template->fields()->with('options')->ordered()->get();

        return FormFieldResource::collection($fields);
    }

    /**
     * Store a new field
     */
    public function store(Request $request, $templateId)
    {
        $template = FormTemplate::findOrFail($templateId);

        $validator = Validator::make($request->all(), [
            'field_key' => 'required|string|max:255',
            'label' => 'required|string|max:255',
            'help_text' => 'nullable|string',
            'field_type' => 'required|in:text,textarea,select,radio,checkbox,number,date,scale',
            'validation_rules' => 'nullable|array',
            'is_required' => 'boolean',
            'order' => 'nullable|integer',
            'risk_weight' => 'nullable|integer|min:0',
            'conditional_logic' => 'nullable|array',
            'options' => 'nullable|array',
            'options.*.label' => 'required|string',
            'options.*.value' => 'required|string',
            'options.*.risk_score' => 'nullable|integer|min:0|max:10',
            'options.*.order' => 'nullable|integer',
            'options.*.requires_explanation' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            $field = $template->fields()->create([
                'field_key' => $request->field_key,
                'label' => $request->label,
                'help_text' => $request->help_text,
                'field_type' => $request->field_type,
                'validation_rules' => $request->validation_rules,
                'is_required' => $request->boolean('is_required', false),
                'is_core_field' => false, // Custom fields are never core
                'order' => $request->order ?? 0,
                'risk_weight' => $request->risk_weight ?? 0,
                'conditional_logic' => $request->conditional_logic,
            ]);

            // Create options if provided
            if ($request->has('options') && in_array($request->field_type, ['select', 'radio', 'checkbox'])) {
                foreach ($request->options as $optionData) {
                    $field->options()->create([
                        'label' => $optionData['label'],
                        'value' => $optionData['value'],
                        'risk_score' => $optionData['risk_score'] ?? 0,
                        'order' => $optionData['order'] ?? 0,
                        'requires_explanation' => $optionData['requires_explanation'] ?? false,
                        'metadata' => $optionData['metadata'] ?? null,
                    ]);
                }
            }

            DB::commit();

            $field->load('options');

            return response()->json([
                'success' => true,
                'message' => 'Field created successfully',
                'data' => new FormFieldResource($field),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create field: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update field
     */
    public function update(Request $request, $templateId, $fieldId)
    {
        $template = FormTemplate::findOrFail($templateId);
        $field = $template->fields()->findOrFail($fieldId);

        // Prevent editing core fields
        if ($field->is_core_field) {
            return response()->json([
                'success' => false,
                'message' => 'Core fields cannot be modified',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'field_key' => 'sometimes|string|max:255',
            'label' => 'sometimes|string|max:255',
            'help_text' => 'nullable|string',
            'field_type' => 'sometimes|in:text,textarea,select,radio,checkbox,number,date,scale',
            'validation_rules' => 'nullable|array',
            'is_required' => 'boolean',
            'order' => 'nullable|integer',
            'risk_weight' => 'nullable|integer|min:0',
            'conditional_logic' => 'nullable|array',
            'options' => 'nullable|array',
            'options.*.id' => 'nullable|exists:form_field_options,id',
            'options.*.label' => 'required|string',
            'options.*.value' => 'required|string',
            'options.*.risk_score' => 'nullable|integer|min:0|max:10',
            'options.*.order' => 'nullable|integer',
            'options.*.requires_explanation' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            $field->update($request->only([
                'field_key', 'label', 'help_text', 'field_type',
                'validation_rules', 'is_required', 'order', 'risk_weight', 'conditional_logic'
            ]));

            // Update options if provided
            if ($request->has('options') && in_array($field->field_type, ['select', 'radio', 'checkbox'])) {
                $existingOptionIds = [];

                foreach ($request->options as $optionData) {
                    if (isset($optionData['id'])) {
                        // Update existing option
                        $option = $field->options()->find($optionData['id']);
                        if ($option) {
                            $option->update([
                                'label' => $optionData['label'],
                                'value' => $optionData['value'],
                                'risk_score' => $optionData['risk_score'] ?? 0,
                                'order' => $optionData['order'] ?? 0,
                                'requires_explanation' => $optionData['requires_explanation'] ?? false,
                                'metadata' => $optionData['metadata'] ?? null,
                            ]);
                            $existingOptionIds[] = $option->id;
                        }
                    } else {
                        // Create new option
                        $newOption = $field->options()->create([
                            'label' => $optionData['label'],
                            'value' => $optionData['value'],
                            'risk_score' => $optionData['risk_score'] ?? 0,
                            'order' => $optionData['order'] ?? 0,
                            'requires_explanation' => $optionData['requires_explanation'] ?? false,
                            'metadata' => $optionData['metadata'] ?? null,
                        ]);
                        $existingOptionIds[] = $newOption->id;
                    }
                }

                // Delete options not in the request
                $field->options()->whereNotIn('id', $existingOptionIds)->delete();
            }

            DB::commit();

            $field->load('options');

            return response()->json([
                'success' => true,
                'message' => 'Field updated successfully',
                'data' => new FormFieldResource($field),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update field: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete field
     */
    public function destroy($templateId, $fieldId)
    {
        $template = FormTemplate::findOrFail($templateId);
        $field = $template->fields()->findOrFail($fieldId);

        // Prevent deleting core fields
        if ($field->is_core_field) {
            return response()->json([
                'success' => false,
                'message' => 'Core fields cannot be deleted',
            ], 403);
        }

        // Check if field has answers
        if ($field->answers()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete field with existing answers',
            ], 400);
        }

        $field->delete();

        return response()->json([
            'success' => true,
            'message' => 'Field deleted successfully',
        ]);
    }

    /**
     * Reorder fields
     */
    public function reorder(Request $request, $templateId)
    {
        $template = FormTemplate::findOrFail($templateId);

        $validator = Validator::make($request->all(), [
            'fields' => 'required|array',
            'fields.*.id' => 'required|exists:form_fields,id',
            'fields.*.order' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            foreach ($request->fields as $fieldData) {
                $template->fields()
                    ->where('id', $fieldData['id'])
                    ->update(['order' => $fieldData['order']]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Fields reordered successfully',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reorder fields: ' . $e->getMessage(),
            ], 500);
        }
    }
}
