<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactMessageController extends Controller
{
    public function index(Request $request)
    {
        $query = ContactMessage::with('repliedBy')->latest();

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%')
                    ->orWhere('subject', 'like', '%' . $request->search . '%');
            });
        }

        $messages = $query->paginate(15);

        return Inertia::render('admin/contact-messages/index', [
            'messages' => $messages,
            'filters' => $request->only(['status', 'search']),
            'stats' => [
                'total' => ContactMessage::count(),
                'new' => ContactMessage::where('status', 'new')->count(),
                'read' => ContactMessage::where('status', 'read')->count(),
                'replied' => ContactMessage::where('status', 'replied')->count(),
            ]
        ]);
    }

    public function show($id)
    {
        $message = ContactMessage::with('repliedBy')->findOrFail($id);

        // Mark as read if it's new
        if ($message->status === 'new') {
            $message->update(['status' => 'read']);
        }

        return Inertia::render('admin/contact-messages/show', [
            'message' => $message
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,read,replied'
        ]);

        $message = ContactMessage::findOrFail($id);
        $message->update($validated);

        return redirect()->back()->with('success', 'Status berhasil diperbarui');
    }

    public function reply(Request $request, $id)
    {
        $validated = $request->validate([
            'admin_reply' => 'required|string|max:5000'
        ]);

        $message = ContactMessage::findOrFail($id);
        $message->update([
            'admin_reply' => $validated['admin_reply'],
            'replied_at' => now(),
            'replied_by' => auth()->id(),
            'status' => 'replied',
        ]);

        return redirect()->back()->with('success', 'Balasan berhasil disimpan');
    }

    public function destroy($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return redirect()->route('admin.contact-messages.index')->with('success', 'Pesan berhasil dihapus');
    }
}
