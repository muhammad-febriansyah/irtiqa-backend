<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JournalController extends Controller
{
    /**
     * Get user's journal entries
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = JournalEntry::where('user_id', $user->id)
            ->orderBy('entry_date', 'desc');

        // Filter by mood
        if ($request->has('mood')) {
            $query->where('mood', $request->mood);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('entry_date', [$request->start_date, $request->end_date]);
        }

        // Filter by tags
        if ($request->has('tag')) {
            $query->whereJsonContains('tags', $request->tag);
        }

        // Pagination
        $perPage = $request->get('per_page', 20);
        $entries = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $entries,
        ]);
    }

    /**
     * Create new journal entry
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'entry_date' => 'required|date',
            'mood' => 'required|in:very_bad,bad,neutral,good,very_good',
            'content' => 'required|string|max:5000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Check if entry already exists for this date
        $existing = JournalEntry::where('user_id', $user->id)
            ->where('entry_date', $request->entry_date)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Jurnal untuk tanggal ini sudah ada. Silakan edit atau pilih tanggal lain.',
            ], 400);
        }

        // Create entry (content will be auto-encrypted)
        $entry = JournalEntry::create([
            'user_id' => $user->id,
            'entry_date' => $request->entry_date,
            'mood' => $request->mood,
            'content' => $request->content,
            'tags' => $request->tags,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Jurnal berhasil disimpan',
            'data' => $entry,
        ], 201);
    }

    /**
     * Get specific journal entry
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $entry = JournalEntry::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $entry,
        ]);
    }

    /**
     * Update journal entry
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'mood' => 'sometimes|in:very_bad,bad,neutral,good,very_good',
            'content' => 'sometimes|string|max:5000',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        $entry = JournalEntry::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $entry->update($request->only(['mood', 'content', 'tags']));

        return response()->json([
            'success' => true,
            'message' => 'Jurnal berhasil diperbarui',
            'data' => $entry->fresh(),
        ]);
    }

    /**
     * Delete journal entry
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $entry = JournalEntry::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $entry->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jurnal berhasil dihapus',
        ]);
    }

    /**
     * Get mood statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        $user = $request->user();
        $days = $request->get('days', 30);

        $stats = JournalEntry::getMoodStats($user->id, $days);

        // Get recent entries count
        $recentCount = JournalEntry::where('user_id', $user->id)
            ->where('entry_date', '>=', now()->subDays($days))
            ->count();

        // Get streak (consecutive days)
        $streak = $this->calculateStreak($user->id);

        return response()->json([
            'success' => true,
            'data' => [
                'period_days' => $days,
                'total_entries' => $stats['total_entries'],
                'mood_distribution' => $stats['mood_distribution'],
                'average_mood' => $stats['average_mood'],
                'streak_days' => $streak,
                'recent_entries_count' => $recentCount,
            ],
        ]);
    }

    /**
     * Calculate consecutive days streak
     */
    private function calculateStreak(int $userId): int
    {
        $entries = JournalEntry::where('user_id', $userId)
            ->orderBy('entry_date', 'desc')
            ->pluck('entry_date')
            ->map(fn($date) => $date->format('Y-m-d'))
            ->toArray();

        if (empty($entries)) {
            return 0;
        }

        $streak = 1;
        $currentDate = \Carbon\Carbon::parse($entries[0]);

        for ($i = 1; $i < count($entries); $i++) {
            $previousDate = \Carbon\Carbon::parse($entries[$i]);

            if ($currentDate->diffInDays($previousDate) === 1) {
                $streak++;
                $currentDate = $previousDate;
            } else {
                break;
            }
        }

        return $streak;
    }

    /**
     * Get available tags
     */
    public function getTags(Request $request): JsonResponse
    {
        $user = $request->user();

        $allTags = JournalEntry::where('user_id', $user->id)
            ->whereNotNull('tags')
            ->pluck('tags')
            ->flatten()
            ->unique()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $allTags,
        ]);
    }
}
