<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class PrivacyController extends Controller
{
    /**
     * Get privacy policy
     */
    public function getPolicy(Request $request): JsonResponse
    {
        $policy = [
            'version' => '1.0',
            'last_updated' => '2026-01-30',
            'sections' => [
                [
                    'title' => 'Pengumpulan Data',
                    'content' => 'IRTIQA mengumpulkan data pribadi yang Anda berikan secara sukarela, termasuk nama, email, informasi profil, dan konten konsultasi.',
                ],
                [
                    'title' => 'Penggunaan Data',
                    'content' => 'Data Anda digunakan untuk memberikan layanan pendampingan psiko-spiritual, meningkatkan kualitas layanan, dan komunikasi terkait layanan.',
                ],
                [
                    'title' => 'Keamanan Data',
                    'content' => 'Kami menggunakan enkripsi dan langkah keamanan standar industri untuk melindungi data Anda. Konten jurnal pribadi dienkripsi secara otomatis.',
                ],
                [
                    'title' => 'Penyimpanan Data',
                    'content' => 'Data Anda disimpan selama akun aktif dan hingga 365 hari setelah penghapusan akun untuk keperluan audit dan kepatuhan.',
                ],
                [
                    'title' => 'Hak Anda',
                    'content' => 'Anda memiliki hak untuk mengakses, mengubah, mengekspor, dan menghapus data pribadi Anda kapan saja.',
                ],
                [
                    'title' => 'Pembagian Data',
                    'content' => 'IRTIQA tidak membagikan data pribadi Anda kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum.',
                ],
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $policy,
        ]);
    }

    /**
     * Export user data
     */
    public function exportMyData(Request $request): JsonResponse
    {
        $user = $request->user();

        // Gather all user data
        $data = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
            ],
            'profile' => $user->profile,
            'consultation_tickets' => $user->consultationTickets()->with('messages')->get(),
            'programs' => $user->programs()->with('sessions', 'messages')->get(),
            'dreams' => $user->dreams,
            'journal_entries' => $user->journalEntries ?? [],
            'transactions' => $user->transactions,
            'ratings' => $user->ratings,
            'disclaimer_acceptances' => \App\Models\DisclaimerAcceptance::where('user_id', $user->id)->get(),
        ];

        // Log the export request
        \App\Models\AuditLog::create([
            'user_id' => $user->id,
            'action' => 'data_export',
            'description' => 'User exported their data',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diekspor',
            'data' => $data,
            'exported_at' => now(),
        ]);
    }

    /**
     * Request account deletion
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
            'confirmation' => 'required|in:DELETE',
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password salah',
            ], 401);
        }

        // Check for active programs
        $activePrograms = $user->programs()
            ->whereIn('status', ['active', 'pending'])
            ->count();

        if ($activePrograms > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Anda masih memiliki program aktif. Harap selesaikan atau batalkan program terlebih dahulu.',
                'data' => [
                    'active_programs_count' => $activePrograms,
                ],
            ], 400);
        }

        // Log deletion request
        \App\Models\AuditLog::create([
            'user_id' => $user->id,
            'action' => 'account_deletion_requested',
            'description' => 'User requested account deletion. Reason: ' . ($request->reason ?? 'No reason provided'),
            'ip_address' => $request->ip(),
        ]);

        // Anonymize user data instead of hard delete
        DB::transaction(function () use ($user) {
            // Anonymize personal data
            $user->update([
                'name' => 'Deleted User ' . $user->id,
                'email' => 'deleted_' . $user->id . '@irtiqa.local',
                'password' => Hash::make(str()->random(32)),
                'avatar' => null,
            ]);

            // Anonymize profile
            if ($user->profile) {
                $user->profile->update([
                    'pseudonym' => null,
                    'phone' => null,
                    'province' => null,
                    'city' => null,
                    'birth_date' => null,
                ]);
            }

            // Delete journal entries (encrypted, safe to delete)
            \App\Models\JournalEntry::where('user_id', $user->id)->delete();

            // Revoke all tokens
            $user->tokens()->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Akun Anda telah dihapus. Data pribadi telah dianonimkan. Terima kasih telah menggunakan IRTIQA.',
        ]);
    }

    /**
     * Get data retention info
     */
    public function getDataRetentionInfo(Request $request): JsonResponse
    {
        $retentionDays = \App\Models\SystemSetting::where('key', 'policy.data_retention_days')
            ->value('value') ?? 365;

        $info = [
            'retention_period_days' => (int) $retentionDays,
            'retention_period_readable' => $retentionDays . ' hari (' . round($retentionDays / 365, 1) . ' tahun)',
            'what_we_keep' => [
                'Riwayat konsultasi (untuk audit dan kualitas layanan)',
                'Transaksi (untuk keperluan akuntansi)',
                'Audit logs (untuk keamanan)',
            ],
            'what_we_delete' => [
                'Data pribadi (nama, email, dll) - dianonimkan',
                'Jurnal pribadi - dihapus permanen',
                'Foto profil - dihapus permanen',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $info,
        ]);
    }

    /**
     * Download data as JSON file
     */
    public function downloadData(Request $request)
    {
        $user = $request->user();

        // Get all user data
        $data = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
            ],
            'profile' => $user->profile,
            'consultation_tickets' => $user->consultationTickets()->with('messages')->get(),
            'programs' => $user->programs()->with('sessions', 'messages')->get(),
            'dreams' => $user->dreams,
            'journal_entries' => \App\Models\JournalEntry::where('user_id', $user->id)->get(),
            'transactions' => $user->transactions,
        ];

        $filename = 'irtiqa_data_' . $user->id . '_' . now()->format('Y-m-d') . '.json';

        return response()->json($data)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}
