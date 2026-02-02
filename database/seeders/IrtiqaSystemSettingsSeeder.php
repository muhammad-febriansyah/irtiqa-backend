<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class IrtiqaSystemSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Pricing Settings
            [
                'key' => 'pricing.ringan.price',
                'value' => '75000',
                'group' => 'pricing',
                'type' => 'integer',
                'description' => 'Harga paket ringan (Rp)',
            ],
            [
                'key' => 'pricing.ringan.sessions',
                'value' => '3',
                'group' => 'pricing',
                'type' => 'integer',
                'description' => 'Jumlah sesi chat paket ringan',
            ],
            [
                'key' => 'pricing.ringan.duration_days',
                'value' => '7',
                'group' => 'pricing',
                'type' => 'integer',
                'description' => 'Durasi paket ringan (hari)',
            ],
            [
                'key' => 'pricing.standar.price',
                'value' => '200000',
                'group' => 'pricing',
                'type' => 'integer',
                'description' => 'Harga paket standar (Rp)',
            ],
            [
                'key' => 'pricing.standar.sessions',
                'value' => '8',
                'group' => 'pricing',
                'type' => 'integer',
                'description' => 'Jumlah sesi chat paket standar',
            ],
            [
                'key' => 'pricing.standar.duration_days',
                'value' => '30',
                'group' => 'pricing',
                'type' => 'integer',
                'description' => 'Durasi paket standar (hari)',
            ],
            [
                'key' => 'pricing.standar.voice_calls',
                'value' => '2',
                'group' => 'pricing',
                'type' => 'integer',
                'description' => 'Jumlah voice call paket standar',
            ],
            [
                'key' => 'pricing.intensif.price',
                'value' => '350000',
                'group' => 'pricing',
                'type' => 'integer',
                'description' => 'Harga paket intensif (Rp)',
            ],
            [
                'key' => 'pricing.intensif.sessions',
                'value' => '16',
                'group' => 'pricing',
                'type' => 'integer',
                'description' => 'Jumlah sesi chat paket intensif',
            ],
            [
                'key' => 'pricing.intensif.duration_days',
                'value' => '60',
                'group' => 'pricing',
                'type' => 'integer',
                'description' => 'Durasi paket intensif (hari)',
            ],
            [
                'key' => 'pricing.intensif.voice_calls',
                'value' => '4',
                'group' => 'pricing',
                'type' => 'integer',
                'description' => 'Jumlah voice call paket intensif',
            ],

            // Crisis Management
            [
                'key' => 'crisis.keywords',
                'value' => json_encode([
                    'bunuh diri',
                    'ingin mati',
                    'mengakhiri hidup',
                    'tidak ingin hidup',
                    'mau mati',
                    'pengen mati',
                    'suicide',
                    'kill myself',
                    'end my life',
                ]),
                'group' => 'crisis',
                'type' => 'json',
                'description' => 'Keywords yang trigger crisis alert',
            ],
            [
                'key' => 'crisis.hotline',
                'value' => '119',
                'group' => 'crisis',
                'type' => 'string',
                'description' => 'Nomor hotline crisis (Indonesia)',
            ],
            [
                'key' => 'crisis.hotline_name',
                'value' => 'Hotline Kesehatan Jiwa 119',
                'group' => 'crisis',
                'type' => 'string',
                'description' => 'Nama layanan hotline',
            ],
            [
                'key' => 'crisis.auto_escalate',
                'value' => 'true',
                'group' => 'crisis',
                'type' => 'boolean',
                'description' => 'Auto-escalate ke admin jika terdeteksi crisis',
            ],

            // Policy Settings
            [
                'key' => 'policy.refund_days',
                'value' => '7',
                'group' => 'policy',
                'type' => 'integer',
                'description' => 'Batas waktu pengajuan refund (hari)',
            ],
            [
                'key' => 'policy.data_retention_days',
                'value' => '365',
                'group' => 'policy',
                'type' => 'integer',
                'description' => 'Lama penyimpanan data user (hari)',
            ],
            [
                'key' => 'policy.min_age',
                'value' => '17',
                'group' => 'policy',
                'type' => 'integer',
                'description' => 'Umur minimal pengguna',
            ],
            [
                'key' => 'policy.max_pause_count',
                'value' => '2',
                'group' => 'policy',
                'type' => 'integer',
                'description' => 'Maksimal pause program',
            ],

            // SLA Settings
            [
                'key' => 'sla.first_response_hours',
                'value' => '24',
                'group' => 'sla',
                'type' => 'integer',
                'description' => 'Target waktu respons pertama konsultan (jam)',
            ],
            [
                'key' => 'sla.auto_reassign_hours',
                'value' => '48',
                'group' => 'sla',
                'type' => 'integer',
                'description' => 'Auto-reassign jika konsultan tidak respons (jam)',
            ],

            // Auto-Guidance Templates
            [
                'key' => 'auto_guidance.default',
                'value' => 'Terima kasih telah mempercayai IRTIQA. Setiap kegelisahan memiliki banyak kemungkinan sebab. Tidak perlu menyimpulkan secara tergesa-gesa. Untuk sementara, jaga istirahat dan ibadah rutin. Pendamping akan meninjau dengan tenang.',
                'group' => 'auto_guidance',
                'type' => 'text',
                'description' => 'Template auto-guidance default',
            ],

            // Follow-up Settings
            [
                'key' => 'followup.1_week.enabled',
                'value' => 'true',
                'group' => 'followup',
                'type' => 'boolean',
                'description' => 'Aktifkan follow-up 1 minggu',
            ],
            [
                'key' => 'followup.1_month.enabled',
                'value' => 'true',
                'group' => 'followup',
                'type' => 'boolean',
                'description' => 'Aktifkan follow-up 1 bulan',
            ],
            [
                'key' => 'followup.3_months.enabled',
                'value' => 'false',
                'group' => 'followup',
                'type' => 'boolean',
                'description' => 'Aktifkan follow-up 3 bulan',
            ],

            // App Settings
            [
                'key' => 'app.consultation_free',
                'value' => 'true',
                'group' => 'app',
                'type' => 'boolean',
                'description' => 'Konsultasi awal gratis',
            ],
            [
                'key' => 'app.maintenance_mode',
                'value' => 'false',
                'group' => 'app',
                'type' => 'boolean',
                'description' => 'Mode maintenance',
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('IRTIQA system settings seeded successfully!');
    }
}
