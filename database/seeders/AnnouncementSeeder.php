<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin user (or create one if not exists)
        $admin = User::whereHas('roles', function ($q) {
            $q->where('name', 'admin');
        })->first();

        if (!$admin) {
            // If no admin exists, use the first user
            $admin = User::first();
        }

        $announcements = [
            // 1. Welcome Announcement
            [
                'title' => 'Selamat Datang di IRTIQA',
                'content' => '<p>Assalamu\'alaikum warahmatullahi wabarakatuh.</p><p>Selamat datang di <strong>IRTIQA</strong> - Platform Pendampingan Psiko-Spiritual Islami yang bertahap, beradab, dan bertanggung jawab.</p><p>Kami hadir untuk mendampingi Anda dalam memahami kondisi batin, kegelisahan jiwa, serta pengalaman psikologis dan ruhani dengan cara yang tenang dan terstruktur.</p><p>IRTIQA bukan pemberi vonis, melainkan pendamping yang menjernihkan pemahaman melalui edukasi dan kehati-hatian dalam setiap proses.</p>',
                'excerpt' => 'Platform pendampingan psiko-spiritual yang aman dan bertanggung jawab',
                'type' => 'info',
                'priority' => 'high',
                'target_role' => 'all',
                'is_dismissible' => true,
                'show_on_home' => true,
                'is_popup' => false,
                'background_color' => '#E0F2FE',
                'text_color' => '#075985',
                'icon' => 'info',
                'link_url' => '/about',
                'link_text' => 'Pelajari Lebih Lanjut',
                'link_target' => '_self',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(7),
                'expired_at' => Carbon::now()->addMonths(3),
            ],

            // 2. Konsultasi Gratis
            [
                'title' => 'Konsultasi Awal GRATIS',
                'content' => '<p>Mulai perjalanan Anda dengan <strong>Konsultasi Awal yang GRATIS</strong>.</p><p>Dalam sesi ini, Anda dapat:</p><ul><li>Menceritakan kegelisahan yang dirasakan</li><li>Mendapat klarifikasi awal dari konsultan terpercaya</li><li>Memahami langkah selanjutnya yang tepat untuk Anda</li></ul><p>Kami akan membantu menjernihkan, bukan menghakimi.</p>',
                'excerpt' => 'Dapatkan konsultasi awal gratis dengan konsultan terpercaya',
                'type' => 'feature',
                'priority' => 'high',
                'target_role' => 'user',
                'is_dismissible' => true,
                'show_on_home' => true,
                'is_popup' => false,
                'background_color' => '#DCFCE7',
                'text_color' => '#166534',
                'icon' => 'chat',
                'link_url' => '/consultation/create',
                'link_text' => 'Mulai Konsultasi Gratis',
                'link_target' => '_self',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(5),
                'expired_at' => null, // Permanent
            ],

            // 3. Maintenance Notice
            [
                'title' => 'Maintenance Terjadwal - 15 Februari 2026',
                'content' => '<p><strong>Pemberitahuan Pemeliharaan Sistem</strong></p><p>Untuk meningkatkan kualitas layanan, kami akan melakukan pemeliharaan sistem pada:</p><ul><li><strong>Tanggal:</strong> Selasa, 15 Februari 2026</li><li><strong>Waktu:</strong> 01:00 - 04:00 WIB</li><li><strong>Durasi:</strong> ±3 jam</li></ul><p>Selama maintenance, aplikasi tidak dapat diakses. Mohon maaf atas ketidaknyamanannya.</p><p>Terima kasih atas pengertian Anda.</p>',
                'excerpt' => 'Server maintenance 15 Feb 2026, 01:00-04:00 WIB',
                'type' => 'maintenance',
                'priority' => 'high',
                'target_role' => 'all',
                'is_dismissible' => false,
                'show_on_home' => true,
                'is_popup' => true,
                'background_color' => '#FEF3C7',
                'text_color' => '#92400E',
                'icon' => 'warning',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(2),
                'expired_at' => Carbon::parse('2026-02-15 05:00:00'),
            ],

            // 4. Voice Call Feature
            [
                'title' => 'Fitur Baru: Voice Call Consultation',
                'content' => '<p>Kami dengan senang hati mengumumkan fitur baru:</p><h3>🎙️ Konsultasi via Voice Call</h3><p>Kini Anda dapat melakukan konsultasi langsung melalui panggilan suara dengan konsultan kami.</p><p><strong>Keuntungan:</strong></p><ul><li>Lebih personal dan interaktif</li><li>Komunikasi lebih lancar</li><li>Tetap privat dan aman</li></ul><p>Tersedia di paket Premium dan Ultimate.</p>',
                'excerpt' => 'Konsultasi kini tersedia via voice call untuk paket Premium+',
                'type' => 'feature',
                'priority' => 'medium',
                'target_role' => 'all',
                'is_dismissible' => true,
                'show_on_home' => true,
                'is_popup' => false,
                'background_color' => '#E0E7FF',
                'text_color' => '#3730A3',
                'icon' => 'phone',
                'link_url' => '/packages',
                'link_text' => 'Lihat Paket',
                'link_target' => '_self',
                'status' => 'published',
                'published_at' => Carbon::now()->subDays(1),
                'expired_at' => Carbon::now()->addWeeks(2),
            ],

            // 5. Training for Consultants
            [
                'title' => 'Pelatihan Konsultan: Handling Crisis Cases',
                'content' => '<p><strong>Undangan Pelatihan Konsultan</strong></p><p>Kepada para konsultan IRTIQA yang terhormat,</p><p>Kami mengundang Anda untuk mengikuti pelatihan:</p><h3>📚 Handling Crisis Cases</h3><ul><li><strong>Tanggal:</strong> Sabtu, 20 Februari 2026</li><li><strong>Waktu:</strong> 09:00 - 15:00 WIB</li><li><strong>Platform:</strong> Zoom Meeting</li><li><strong>Pembicara:</strong> Dr. Ahmad Fauzi, M.Psi</li></ul><p>Materi meliputi:</p><ul><li>Identifikasi kasus high-risk</li><li>Protokol eskalasi darurat</li><li>Teknik de-escalation</li><li>Self-care untuk konsultan</li></ul><p>Sertifikat akan diberikan kepada peserta.</p>',
                'excerpt' => 'Pelatihan handling crisis cases untuk konsultan - 20 Feb 2026',
                'type' => 'event',
                'priority' => 'medium',
                'target_role' => 'consultant',
                'is_dismissible' => true,
                'show_on_home' => true,
                'is_popup' => false,
                'background_color' => '#FEE2E2',
                'text_color' => '#991B1B',
                'icon' => 'calendar',
                'start_date' => Carbon::parse('2026-02-20'),
                'end_date' => Carbon::parse('2026-02-20'),
                'link_url' => 'https://zoom.us/j/123456789',
                'link_text' => 'Daftar Sekarang',
                'link_target' => '_blank',
                'status' => 'published',
                'published_at' => Carbon::now(),
                'expired_at' => Carbon::parse('2026-02-20 23:59:59'),
            ],

            // 6. Tips Harian
            [
                'title' => 'Tips: Menenangkan Pikiran Sebelum Tidur',
                'content' => '<p><strong>Langkah Sederhana Menuju Tidur Berkualitas</strong></p><ol><li><strong>Wudhu:</strong> Bersihkan diri sebelum tidur</li><li><strong>Dzikir:</strong> Bacaan Ayat Kursi dan 3 Qul</li><li><strong>Doa:</strong> Panjatkan doa sebelum tidur</li><li><strong>Posisi Tidur:</strong> Miring ke kanan, hadap kiblat</li><li><strong>Hindari Gadget:</strong> 30 menit sebelum tidur</li></ol><p>Tidur yang tenang adalah kunci kesehatan mental dan spiritual.</p>',
                'excerpt' => 'Langkah sederhana menenangkan pikiran sebelum tidur',
                'type' => 'info',
                'priority' => 'low',
                'target_role' => 'all',
                'is_dismissible' => true,
                'show_on_home' => false,
                'is_popup' => false,
                'background_color' => '#F3F4F6',
                'text_color' => '#1F2937',
                'icon' => 'lightbulb',
                'status' => 'published',
                'published_at' => Carbon::now(),
                'expired_at' => Carbon::now()->addDays(7),
            ],

            // 7. Urgent Warning
            [
                'title' => 'PENTING: Waspada Penipuan Mengatasnamakan IRTIQA',
                'content' => '<p><strong>⚠️ PERHATIAN PENTING ⚠️</strong></p><p>Kami menerima laporan tentang upaya penipuan yang mengatasnamakan IRTIQA.</p><p><strong>IRTIQA TIDAK PERNAH:</strong></p><ul><li>Meminta transfer di luar sistem aplikasi</li><li>Menjanjikan "kesembuhan instan"</li><li>Meminta nomor rekening atau OTP</li><li>Meminta bertemu di tempat yang tidak aman</li><li>Memaksa membeli paket tertentu</li></ul><p><strong>Jika Anda menemui hal mencurigakan:</strong></p><ol><li>Jangan transfer uang</li><li>Screenshot bukti percakapan</li><li>Laporkan ke: <a href="mailto:report@irtiqa.id">report@irtiqa.id</a></li></ol><p>Keselamatan Anda adalah prioritas kami.</p>',
                'excerpt' => 'Waspada penipuan! IRTIQA tidak pernah minta transfer di luar sistem',
                'type' => 'urgent',
                'priority' => 'high',
                'target_role' => 'all',
                'is_dismissible' => true,
                'show_on_home' => true,
                'is_popup' => true,
                'background_color' => '#FEE2E2',
                'text_color' => '#991B1B',
                'icon' => 'alert',
                'status' => 'published',
                'published_at' => Carbon::now()->subHours(6),
                'expired_at' => Carbon::now()->addMonths(1),
            ],
        ];

        foreach ($announcements as $announcementData) {
            $announcementData['created_by'] = $admin?->id;
            $announcementData['updated_by'] = $admin?->id;

            Announcement::create($announcementData);
        }

        $this->command->info('✅ Announcements seeded successfully!');
    }
}
