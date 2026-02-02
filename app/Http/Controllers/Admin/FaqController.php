<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FaqController extends Controller
{
    public function index(Request $request)
    {
        $query = Faq::orderBy('order')->orderByDesc('created_at');

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter by published status
        if ($request->filled('is_published')) {
            $query->where('is_published', $request->boolean('is_published'));
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('question', 'like', "%{$request->search}%")
                    ->orWhere('answer', 'like', "%{$request->search}%");
            });
        }

        $faqs = $query->paginate(15)->through(function ($faq) {
            return [
                'id' => $faq->id,
                'question' => $faq->question,
                'answer' => \Str::limit($faq->answer, 150),
                'category' => $faq->category,
                'order' => $faq->order,
                'is_published' => $faq->is_published,
                'views_count' => $faq->views_count,
                'helpful_count' => $faq->helpful_count,
                'tags' => $faq->tags,
                'created_at' => $faq->created_at->format('d M Y H:i'),
            ];
        });

        // Get unique categories
        $categories = Faq::distinct()->pluck('category')->filter()->toArray();

        return Inertia::render('admin/faqs/index', [
            'faqs' => $faqs,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'is_published']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:500',
            'answer' => 'required|string',
            'category' => 'nullable|string|max:100',
            'order' => 'nullable|integer|min:0',
            'is_published' => 'nullable|boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $faq = Faq::create($validated);

        return back()->with('success', 'FAQ berhasil ditambahkan');
    }

    public function update(Request $request, Faq $faq)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:500',
            'answer' => 'required|string',
            'category' => 'nullable|string|max:100',
            'order' => 'nullable|integer|min:0',
            'is_published' => 'nullable|boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $faq->update($validated);

        return back()->with('success', 'FAQ berhasil diperbarui');
    }

    public function destroy(Faq $faq)
    {
        $faq->delete();

        return back()->with('success', 'FAQ berhasil dihapus');
    }

    public function togglePublish(Faq $faq)
    {
        $faq->update([
            'is_published' => !$faq->is_published,
        ]);

        $status = $faq->is_published ? 'dipublikasikan' : 'disembunyikan';

        return back()->with('success', "FAQ berhasil {$status}");
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:faqs,id',
            'items.*.order' => 'required|integer|min:0',
        ]);

        foreach ($request->items as $item) {
            Faq::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return back()->with('success', 'Urutan FAQ berhasil diperbarui');
    }
}
