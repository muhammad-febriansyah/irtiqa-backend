<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = Announcement::orderByDesc('created_at');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('content', 'like', "%{$request->search}%");
            });
        }

        $announcements = $query->paginate(15)->through(function ($announcement) {
            return [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'content' => Str::limit(strip_tags($announcement->content), 150),
                'raw_content' => $announcement->content,
                'type' => $announcement->type,
                'status' => $announcement->status,
                'priority' => $announcement->priority,
                'image' => $announcement->image ? asset('storage/' . $announcement->image) : null,
                'published_at' => $announcement->published_at ? $announcement->published_at->format('Y-m-d') : null,
                'created_at' => $announcement->created_at->format('d M Y H:i'),
            ];
        });

        return Inertia::render('admin/announcements/index', [
            'announcements' => $announcements,
            'filters' => $request->only(['search', 'type', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:info,warning,urgent,maintenance,feature,event',
            'status' => 'required|in:draft,published,scheduled,archived',
            'priority' => 'required|in:low,medium,high',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'published_at' => 'nullable|date',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('announcements', 'public');
        }

        Announcement::create($validated);

        return back()->with('success', 'Pengumuman berhasil ditambahkan');
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:info,warning,urgent,maintenance,feature,event',
            'status' => 'required|in:draft,published,scheduled,archived',
            'priority' => 'required|in:low,medium,high',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'published_at' => 'nullable|date',
        ]);

        if ($request->hasFile('image')) {
            if ($announcement->image) {
                \Storage::disk('public')->delete($announcement->image);
            }
            $validated['image'] = $request->file('image')->store('announcements', 'public');
        }

        $announcement->update($validated);

        return back()->with('success', 'Pengumuman berhasil diperbarui');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return back()->with('success', 'Pengumuman berhasil dihapus');
    }

    public function togglePublish(Announcement $announcement)
    {
        $newStatus = $announcement->status === 'published' ? 'draft' : 'published';

        $announcement->update([
            'status' => $newStatus,
            'published_at' => $newStatus === 'published' ? now() : $announcement->published_at,
        ]);

        $msg = $newStatus === 'published' ? 'dipublikasikan' : 'dijadikan draf';

        return back()->with('success', "Pengumuman berhasil {$msg}");
    }
}
