<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CrisisAlert;
use App\Models\SystemSetting;
use App\Models\User;
use App\Notifications\CrisisAlertNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CrisisController extends Controller
{
    /**
     * Panic button - Manual crisis alert
     */
    public function panicButton(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'context' => 'nullable|string|max:1000',
            'ticket_id' => 'nullable|exists:consultation_tickets,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Create crisis alert
        $alert = CrisisAlert::create([
            'user_id' => $user->id,
            'ticket_id' => $request->ticket_id,
            'alert_type' => 'manual_panic',
            'severity' => 'critical',
            'status' => 'pending',
            'context' => $request->context,
        ]);

        // Auto-escalate to admin if enabled
        $autoEscalate = SystemSetting::where('key', 'crisis.auto_escalate')->value('value') === 'true';

        if ($autoEscalate) {
            // Find first available admin for direct acknowledgment
            $admin = User::whereHas('roles', function ($query) {
                $query->where('name', 'admin');
            })->first();

            if ($admin) {
                $alert->acknowledge($admin->id);
            }
        }

        // Notify all admins
        $admins = User::whereHas('roles', function ($query) {
            $query->where('name', 'admin');
        })->get();

        foreach ($admins as $admin) {
            $admin->notify(new CrisisAlertNotification($alert));
        }

        // Get hotline info
        $hotline = $this->getHotlineInfo();

        return response()->json([
            'success' => true,
            'message' => 'Permintaan bantuan darurat telah diterima. Tim kami akan segera menghubungi Anda.',
            'data' => [
                'alert' => $alert,
                'hotline' => $hotline,
                'immediate_actions' => [
                    'Hubungi hotline crisis: ' . $hotline['number'],
                    'Tetap tenang dan cari tempat aman',
                    'Hubungi keluarga atau teman terdekat',
                ],
            ],
        ], 201);
    }

    /**
     * Get crisis hotlines
     */
    public function getHotlines(Request $request): JsonResponse
    {
        $hotlines = [
            [
                'name' => SystemSetting::where('key', 'crisis.hotline_name')->value('value') ?? 'Hotline Kesehatan Jiwa',
                'number' => SystemSetting::where('key', 'crisis.hotline')->value('value') ?? '119',
                'description' => 'Layanan konseling dan dukungan kesehatan jiwa 24/7',
                'type' => 'national',
            ],
            [
                'name' => 'Sejiwa',
                'number' => '119 ext 8',
                'description' => 'Layanan konseling kesehatan jiwa',
                'type' => 'ngo',
            ],
            [
                'name' => 'Into The Light',
                'number' => '021-7884-5555',
                'description' => 'Pencegahan bunuh diri',
                'type' => 'ngo',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $hotlines,
        ]);
    }

    /**
     * Detect crisis keywords in text (Internal use)
     */
    public function detectCrisisKeywords(string $text, ?int $userId = null, ?int $ticketId = null, ?int $messageId = null): ?CrisisAlert
    {
        $keywords = $this->getCrisisKeywords();
        $detectedKeywords = [];

        $textLower = strtolower($text);

        foreach ($keywords as $keyword) {
            if (str_contains($textLower, strtolower($keyword))) {
                $detectedKeywords[] = $keyword;
            }
        }

        if (empty($detectedKeywords)) {
            return null;
        }

        // Determine severity based on number of keywords
        $severity = count($detectedKeywords) >= 3 ? 'critical' : (count($detectedKeywords) >= 2 ? 'high' : 'medium');

        // Create crisis alert
        $alert = CrisisAlert::create([
            'user_id' => $userId,
            'ticket_id' => $ticketId,
            'message_id' => $messageId,
            'alert_type' => 'keyword_detection',
            'detected_keywords' => $detectedKeywords,
            'severity' => $severity,
            'status' => 'pending',
            'context' => substr($text, 0, 500), // Store first 500 chars
        ]);

        // Auto-escalate if critical
        if ($severity === 'critical') {
            $admin = User::whereHas('roles', function ($query) {
                $query->where('name', 'admin');
            })->first();

            if ($admin) {
                $alert->acknowledge($admin->id);
            }
        }

        // Notify all admins for high/critical alerts
        if ($severity === 'high' || $severity === 'critical') {
            $admins = User::whereHas('roles', function ($query) {
                $query->where('name', 'admin');
            })->get();

            foreach ($admins as $admin) {
                $admin->notify(new CrisisAlertNotification($alert));
            }
        }

        return $alert;
    }

    /**
     * Get crisis keywords from settings
     */
    private function getCrisisKeywords(): array
    {
        $keywordsJson = SystemSetting::where('key', 'crisis.keywords')->value('value');

        if (!$keywordsJson) {
            return [
                'bunuh diri',
                'ingin mati',
                'mengakhiri hidup',
                'tidak ingin hidup',
            ];
        }

        return json_decode($keywordsJson, true) ?? [];
    }

    /**
     * Get hotline info
     */
    private function getHotlineInfo(): array
    {
        return [
            'name' => SystemSetting::where('key', 'crisis.hotline_name')->value('value') ?? 'Hotline Kesehatan Jiwa',
            'number' => SystemSetting::where('key', 'crisis.hotline')->value('value') ?? '119',
        ];
    }

    /**
     * Get crisis alerts for admin (Admin only)
     */
    public function getAlerts(Request $request): JsonResponse
    {
        $query = CrisisAlert::with(['user', 'ticket', 'assignedToAdmin'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by severity
        if ($request->has('severity')) {
            $query->where('severity', $request->severity);
        }

        // Pagination
        $perPage = $request->get('per_page', 20);
        $alerts = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $alerts,
        ]);
    }

    /**
     * Acknowledge crisis alert (Admin only)
     */
    public function acknowledgeAlert(Request $request, int $id): JsonResponse
    {
        $alert = CrisisAlert::findOrFail($id);
        $admin = $request->user();

        $alert->acknowledge($admin->id);

        return response()->json([
            'success' => true,
            'message' => 'Crisis alert acknowledged',
            'data' => $alert->fresh(['user', 'ticket', 'assignedToAdmin']),
        ]);
    }

    /**
     * Resolve crisis alert (Admin only)
     */
    public function resolveAlert(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $alert = CrisisAlert::findOrFail($id);
        $alert->resolve($request->notes);

        return response()->json([
            'success' => true,
            'message' => 'Crisis alert resolved',
            'data' => $alert->fresh(['user', 'ticket', 'assignedToAdmin']),
        ]);
    }
}
