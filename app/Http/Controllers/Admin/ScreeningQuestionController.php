<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConsultationCategory;
use App\Models\ScreeningQuestion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScreeningQuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ScreeningQuestion::with('category');

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                  ->orWhere('helper_text', 'like', "%{$search}%");
            });
        }

        if ($request->has('category_id') && $request->get('category_id')) {
            $query->where('category_id', $request->get('category_id'));
        }

        $questions = $query->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $categories = ConsultationCategory::active()->get();

        return Inertia::render('admin/screening-questions/index', [
            'questions' => $questions,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:consultation_categories,id',
            'question' => 'required|string|max:255',
            'type' => 'required|in:text,textarea,radio,checkbox,select,date,number',
            'options' => 'nullable|array',
            'is_required' => 'boolean',
            'helper_text' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
            'risk_scoring' => 'nullable|array',
        ]);

        ScreeningQuestion::create($validated);

        return redirect()->back()->with('success', 'Pertanyaan Screening berhasil ditambahkan!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ScreeningQuestion $screeningQuestion)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:consultation_categories,id',
            'question' => 'required|string|max:255',
            'type' => 'required|in:text,textarea,radio,checkbox,select,date,number',
            'options' => 'nullable|array',
            'is_required' => 'boolean',
            'helper_text' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
            'risk_scoring' => 'nullable|array',
        ]);

        $screeningQuestion->update($validated);

        return redirect()->back()->with('success', 'Pertanyaan Screening berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ScreeningQuestion $screeningQuestion)
    {
        $screeningQuestion->delete();

        return redirect()->back()->with('success', 'Pertanyaan Screening berhasil dihapus!');
    }
}
