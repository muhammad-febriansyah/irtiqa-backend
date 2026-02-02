<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Consultant;
use App\Models\MessageTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessageTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = MessageTemplate::with('consultant.user');

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($request->has('type') && $request->get('type')) {
            $query->where('type', $request->get('type'));
        }

        $templates = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $consultants = Consultant::with('user')->where('is_active', true)->get();

        return Inertia::render('admin/message-templates/index', [
            'templates' => $templates,
            'consultants' => $consultants,
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:greeting,screening,guidance,closing,other',
            'consultant_id' => 'nullable|exists:consultants,id',
            'is_global' => 'boolean',
            'is_active' => 'boolean',
        ]);

        MessageTemplate::create($validated);

        return redirect()->back()->with('success', 'Template Pesan berhasil ditambahkan!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MessageTemplate $messageTemplate)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:greeting,screening,guidance,closing,other',
            'consultant_id' => 'nullable|exists:consultants,id',
            'is_global' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $messageTemplate->update($validated);

        return redirect()->back()->with('success', 'Template Pesan berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MessageTemplate $messageTemplate)
    {
        $messageTemplate->delete();

        return redirect()->back()->with('success', 'Template Pesan berhasil dihapus!');
    }
}
