<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use App\Models\Consultant;
use App\Models\ConsultantSchedule;
use App\Models\ConsultationCategory;
use App\Models\ConsultationTicket;
use App\Models\EducationalContent;
use App\Models\MessageTemplate;
use App\Models\Package;
use App\Models\Program;
use App\Models\ProgramTask;
use App\Models\Rating;
use App\Models\ScreeningQuestion;
use App\Models\SessionSchedule;
use App\Models\Transaction;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedRoles();
        $this->seedConsultationCategories();
        $this->seedPackages();
        $this->seedUsers();
        $this->seedScreeningQuestions();
        $this->seedEducationalContents();
        $this->seedMessageTemplates();
        $this->seedConsultationTickets();
        $this->seedTransactionsAndPrograms();

        $this->command->info('Dummy data seeded successfully!');
    }

    private function seedRoles(): void
    {
        $roles = [
            ['name' => 'admin', 'display_name' => 'Administrator', 'description' => 'Administrator dengan akses penuh'],
            ['name' => 'consultant', 'display_name' => 'Konsultan', 'description' => 'Konsultan yang memberikan bimbingan'],
            ['name' => 'user', 'display_name' => 'Pengguna', 'description' => 'Pengguna/klien'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }
    }

    private function seedConsultationCategories(): void
    {
        $categories = [
            [
                'name' => 'Pernikahan & Keluarga',
                'slug' => 'pernikahan-keluarga',
                'description' => 'Konsultasi seputar rumah tangga, hubungan suami istri, dan keluarga',
                'icon' => 'heart',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Pendidikan Anak',
                'slug' => 'pendidikan-anak',
                'description' => 'Bimbingan terkait pendidikan dan pengasuhan anak secara Islami',
                'icon' => 'academic-cap',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Keuangan Syariah',
                'slug' => 'keuangan-syariah',
                'description' => 'Konsultasi keuangan dan muamalah sesuai syariat Islam',
                'icon' => 'currency-dollar',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Ibadah & Fiqih',
                'slug' => 'ibadah-fiqih',
                'description' => 'Pertanyaan seputar ibadah dan hukum-hukum Islam',
                'icon' => 'book-open',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Kesehatan Mental',
                'slug' => 'kesehatan-mental',
                'description' => 'Bimbingan untuk kesehatan jiwa dengan pendekatan Islami',
                'icon' => 'sparkles',
                'is_active' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'Karir & Pekerjaan',
                'slug' => 'karir-pekerjaan',
                'description' => 'Konsultasi seputar karir dan dunia kerja dalam Islam',
                'icon' => 'briefcase',
                'is_active' => true,
                'sort_order' => 6,
            ],
        ];

        foreach ($categories as $category) {
            ConsultationCategory::firstOrCreate(['slug' => $category['slug']], $category);
        }
    }

    private function seedPackages(): void
    {
        $packages = [
            [
                'name' => 'Paket Dasar',
                'slug' => 'paket-dasar',
                'description' => 'Cocok untuk konsultasi singkat dengan 3 sesi bimbingan',
                'type' => 'session',
                'sessions_count' => 3,
                'duration_days' => 30,
                'price' => 150000,
                'features' => json_encode([
                    '3 sesi konsultasi',
                    'Chat dengan konsultan',
                    'Materi pendukung',
                    'Akses 30 hari',
                ]),
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Paket Standard',
                'slug' => 'paket-standard',
                'description' => 'Paket populer dengan 6 sesi bimbingan intensif',
                'type' => 'session',
                'sessions_count' => 6,
                'duration_days' => 60,
                'price' => 275000,
                'features' => json_encode([
                    '6 sesi konsultasi',
                    'Chat & voice call',
                    'Materi pendukung',
                    'Tugas mingguan',
                    'Akses 60 hari',
                ]),
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Paket Premium',
                'slug' => 'paket-premium',
                'description' => 'Bimbingan lengkap dengan 12 sesi dan dukungan penuh',
                'type' => 'session',
                'sessions_count' => 12,
                'duration_days' => 90,
                'price' => 500000,
                'features' => json_encode([
                    '12 sesi konsultasi',
                    'Chat, voice & video call',
                    'Materi eksklusif',
                    'Tugas terstruktur',
                    'Laporan progress',
                    'Akses 90 hari',
                ]),
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 3,
            ],
            [
                'name' => 'Paket Bulanan',
                'slug' => 'paket-bulanan',
                'description' => 'Akses unlimited selama 1 bulan',
                'type' => 'period',
                'sessions_count' => null,
                'duration_days' => 30,
                'price' => 350000,
                'features' => json_encode([
                    'Unlimited chat',
                    '4 sesi voice call',
                    'Materi lengkap',
                    'Support prioritas',
                ]),
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 4,
            ],
        ];

        foreach ($packages as $package) {
            Package::firstOrCreate(['slug' => $package['slug']], $package);
        }
    }

    private function seedUsers(): void
    {
        $consultantRole = Role::where('name', 'consultant')->first();
        $userRole = Role::where('name', 'user')->first();

        // Seed Consultants
        $consultants = [
            [
                'name' => 'Ustadz Ahmad Fauzi',
                'email' => 'ahmad.fauzi@irtiqa.com',
                'specialist_category' => 'Pernikahan & Keluarga',
                'level' => 'expert',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'bio' => 'Konsultan pernikahan dengan pengalaman lebih dari 15 tahun. Lulusan Al-Azhar University dengan spesialisasi di bidang fiqih munakahat.',
                'certificate_number' => 'CERT-2020-001',
            ],
            [
                'name' => 'Ustadzah Fatimah Azzahra',
                'email' => 'fatimah.azzahra@irtiqa.com',
                'specialist_category' => 'Pendidikan Anak',
                'level' => 'senior',
                'city' => 'Bandung',
                'province' => 'Jawa Barat',
                'bio' => 'Pakar parenting Islami dengan background psikologi anak. Aktif menulis buku tentang pendidikan anak dalam Islam.',
                'certificate_number' => 'CERT-2021-002',
            ],
            [
                'name' => 'Ustadz Muhammad Rizki',
                'email' => 'muhammad.rizki@irtiqa.com',
                'specialist_category' => 'Keuangan Syariah',
                'level' => 'expert',
                'city' => 'Surabaya',
                'province' => 'Jawa Timur',
                'bio' => 'Praktisi keuangan syariah bersertifikasi. Berpengalaman sebagai advisor di berbagai lembaga keuangan Islam.',
                'certificate_number' => 'CERT-2019-003',
            ],
            [
                'name' => 'Ustadz Abdullah Hasan',
                'email' => 'abdullah.hasan@irtiqa.com',
                'specialist_category' => 'Ibadah & Fiqih',
                'level' => 'senior',
                'city' => 'Yogyakarta',
                'province' => 'DI Yogyakarta',
                'bio' => 'Hafizh Quran dan lulusan Ma\'had Ali. Aktif mengajar di berbagai majelis ilmu dan pesantren.',
                'certificate_number' => 'CERT-2020-004',
            ],
            [
                'name' => 'Ustadzah Aisyah Putri',
                'email' => 'aisyah.putri@irtiqa.com',
                'specialist_category' => 'Kesehatan Mental',
                'level' => 'senior',
                'city' => 'Semarang',
                'province' => 'Jawa Tengah',
                'bio' => 'Psikolog klinis dengan spesialisasi Islamic Psychology. Menangani berbagai kasus kesehatan mental dengan pendekatan holistik Islami.',
                'certificate_number' => 'CERT-2021-005',
            ],
            [
                'name' => 'Ustadz Yusuf Ibrahim',
                'email' => 'yusuf.ibrahim@irtiqa.com',
                'specialist_category' => 'Karir & Pekerjaan',
                'level' => 'junior',
                'city' => 'Medan',
                'province' => 'Sumatera Utara',
                'bio' => 'Konsultan karir muda yang bersemangat. Fokus membantu generasi milenial Muslim menemukan jalan karir yang berkah.',
                'certificate_number' => 'CERT-2023-006',
            ],
        ];

        foreach ($consultants as $consultantData) {
            $user = User::firstOrCreate(
                ['email' => $consultantData['email']],
                [
                    'name' => $consultantData['name'],
                    'password' => Hash::make('password123'),
                    'email_verified_at' => now(),
                ]
            );

            if ($consultantRole && !$user->roles()->where('role_id', $consultantRole->id)->exists()) {
                $user->roles()->attach($consultantRole);
            }

            $consultant = Consultant::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'specialist_category' => $consultantData['specialist_category'],
                    'level' => $consultantData['level'],
                    'city' => $consultantData['city'],
                    'province' => $consultantData['province'],
                    'is_active' => true,
                    'is_verified' => true,
                    'verified_at' => now(),
                    'certificate_number' => $consultantData['certificate_number'],
                    'bio' => $consultantData['bio'],
                    'rating_average' => rand(40, 50) / 10,
                    'total_cases' => rand(20, 150),
                    'total_ratings' => rand(10, 100),
                    'working_hours' => json_encode([
                        'monday' => ['09:00', '17:00'],
                        'tuesday' => ['09:00', '17:00'],
                        'wednesday' => ['09:00', '17:00'],
                        'thursday' => ['09:00', '17:00'],
                        'friday' => ['09:00', '12:00', '14:00', '17:00'],
                        'saturday' => ['09:00', '14:00'],
                    ]),
                ]
            );

            // Create consultant schedules
            $this->createConsultantSchedules($consultant);
        }

        // Seed Regular Users (Clients)
        $clients = [
            ['name' => 'Budi Santoso', 'email' => 'budi.santoso@gmail.com', 'gender' => 'male', 'city' => 'Jakarta', 'province' => 'DKI Jakarta'],
            ['name' => 'Siti Nurhaliza', 'email' => 'siti.nurhaliza@gmail.com', 'gender' => 'female', 'city' => 'Bandung', 'province' => 'Jawa Barat'],
            ['name' => 'Agus Wijaya', 'email' => 'agus.wijaya@gmail.com', 'gender' => 'male', 'city' => 'Surabaya', 'province' => 'Jawa Timur'],
            ['name' => 'Dewi Lestari', 'email' => 'dewi.lestari@gmail.com', 'gender' => 'female', 'city' => 'Yogyakarta', 'province' => 'DI Yogyakarta'],
            ['name' => 'Rizky Pratama', 'email' => 'rizky.pratama@gmail.com', 'gender' => 'male', 'city' => 'Semarang', 'province' => 'Jawa Tengah'],
            ['name' => 'Anisa Rahma', 'email' => 'anisa.rahma@gmail.com', 'gender' => 'female', 'city' => 'Malang', 'province' => 'Jawa Timur'],
            ['name' => 'Hendra Gunawan', 'email' => 'hendra.gunawan@gmail.com', 'gender' => 'male', 'city' => 'Medan', 'province' => 'Sumatera Utara'],
            ['name' => 'Putri Amelia', 'email' => 'putri.amelia@gmail.com', 'gender' => 'female', 'city' => 'Makassar', 'province' => 'Sulawesi Selatan'],
        ];

        foreach ($clients as $clientData) {
            $user = User::firstOrCreate(
                ['email' => $clientData['email']],
                [
                    'name' => $clientData['name'],
                    'password' => Hash::make('password123'),
                    'email_verified_at' => now(),
                ]
            );

            if ($userRole && !$user->roles()->where('role_id', $userRole->id)->exists()) {
                $user->roles()->attach($userRole);
            }

            UserProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'birth_date' => now()->subYears(rand(20, 45))->subDays(rand(1, 365)),
                    'gender' => $clientData['gender'],
                    'phone' => '08' . rand(100000000, 999999999),
                    'city' => $clientData['city'],
                    'province' => $clientData['province'],
                    'address' => 'Jl. Contoh No. ' . rand(1, 100) . ', ' . $clientData['city'],
                    'disclaimer_accepted' => true,
                    'disclaimer_accepted_at' => now(),
                ]
            );
        }
    }

    private function createConsultantSchedules(Consultant $consultant): void
    {
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        foreach ($days as $day) {
            ConsultantSchedule::firstOrCreate(
                [
                    'consultant_id' => $consultant->id,
                    'day_of_week' => $day,
                ],
                [
                    'start_time' => $day === 'saturday' ? '09:00' : '09:00',
                    'end_time' => $day === 'saturday' ? '14:00' : '17:00',
                    'is_available' => true,
                ]
            );
        }
    }

    private function seedScreeningQuestions(): void
    {
        $categories = ConsultationCategory::all();

        $generalQuestions = [
            [
                'question' => 'Sudah berapa lama Anda mengalami masalah ini?',
                'type' => 'radio',
                'options' => json_encode(['Kurang dari 1 minggu', '1-4 minggu', '1-3 bulan', 'Lebih dari 3 bulan']),
                'is_required' => true,
                'helper_text' => 'Pilih durasi yang paling sesuai',
                'sort_order' => 1,
            ],
            [
                'question' => 'Bagaimana tingkat urgensitas masalah Anda?',
                'type' => 'radio',
                'options' => json_encode(['Tidak mendesak', 'Cukup mendesak', 'Sangat mendesak', 'Darurat']),
                'is_required' => true,
                'helper_text' => 'Tingkat urgensi membantu kami memprioritaskan',
                'sort_order' => 2,
                'risk_scoring' => json_encode([
                    'Tidak mendesak' => 1,
                    'Cukup mendesak' => 2,
                    'Sangat mendesak' => 3,
                    'Darurat' => 5,
                ]),
            ],
            [
                'question' => 'Apakah Anda pernah berkonsultasi tentang masalah ini sebelumnya?',
                'type' => 'radio',
                'options' => json_encode(['Belum pernah', 'Pernah, dengan hasil baik', 'Pernah, belum ada solusi']),
                'is_required' => true,
                'sort_order' => 3,
            ],
            [
                'question' => 'Ceritakan secara singkat masalah yang Anda hadapi',
                'type' => 'textarea',
                'is_required' => true,
                'helper_text' => 'Jelaskan dengan detail agar konsultan dapat memahami situasi Anda',
                'sort_order' => 4,
            ],
        ];

        foreach ($categories as $category) {
            foreach ($generalQuestions as $question) {
                ScreeningQuestion::firstOrCreate(
                    [
                        'category_id' => $category->id,
                        'question' => $question['question'],
                    ],
                    array_merge($question, ['category_id' => $category->id])
                );
            }
        }
    }

    private function seedEducationalContents(): void
    {
        $contents = [
            [
                'title' => 'Panduan Membangun Rumah Tangga Sakinah',
                'slug' => 'panduan-membangun-rumah-tangga-sakinah',
                'excerpt' => 'Tips dan panduan lengkap untuk membangun keluarga yang sakinah, mawaddah, wa rahmah.',
                'content' => '<h2>Membangun Keluarga Sakinah</h2><p>Rumah tangga sakinah adalah dambaan setiap pasangan Muslim. Berikut panduan lengkapnya...</p><h3>1. Komunikasi yang Baik</h3><p>Komunikasi adalah kunci utama dalam rumah tangga...</p><h3>2. Saling Menghormati</h3><p>Rasa hormat antara suami dan istri sangat penting...</p>',
                'type' => 'article',
                'category' => 'family_children',
                'tags' => json_encode(['pernikahan', 'keluarga', 'sakinah', 'mawaddah']),
                'level' => 'beginner',
                'reading_time_minutes' => 8,
                'is_published' => true,
                'is_featured' => true,
                'published_at' => now()->subDays(30),
                'views_count' => 1250,
                'likes_count' => 89,
            ],
            [
                'title' => 'Mendidik Anak di Era Digital',
                'slug' => 'mendidik-anak-di-era-digital',
                'excerpt' => 'Strategi mendidik anak dengan nilai-nilai Islam di tengah perkembangan teknologi.',
                'content' => '<h2>Tantangan Pendidikan di Era Digital</h2><p>Era digital membawa tantangan tersendiri bagi orang tua Muslim...</p>',
                'type' => 'article',
                'category' => 'family_children',
                'tags' => json_encode(['parenting', 'anak', 'digital', 'teknologi']),
                'level' => 'intermediate',
                'reading_time_minutes' => 12,
                'is_published' => true,
                'is_featured' => false,
                'published_at' => now()->subDays(15),
                'views_count' => 856,
                'likes_count' => 67,
            ],
            [
                'title' => 'Dasar-Dasar Keuangan Syariah',
                'slug' => 'dasar-dasar-keuangan-syariah',
                'excerpt' => 'Pelajari prinsip-prinsip dasar keuangan dalam Islam dan cara menerapkannya.',
                'content' => '<h2>Prinsip Keuangan Syariah</h2><p>Islam mengatur semua aspek kehidupan termasuk keuangan...</p>',
                'type' => 'guide',
                'category' => 'general',
                'tags' => json_encode(['keuangan', 'syariah', 'halal', 'investasi']),
                'level' => 'beginner',
                'reading_time_minutes' => 15,
                'is_published' => true,
                'is_featured' => true,
                'published_at' => now()->subDays(7),
                'views_count' => 2100,
                'likes_count' => 145,
            ],
            [
                'title' => 'Mengatasi Kecemasan dengan Dzikir',
                'slug' => 'mengatasi-kecemasan-dengan-dzikir',
                'excerpt' => 'Bagaimana dzikir dapat membantu menenangkan hati dan mengatasi kecemasan.',
                'content' => '<h2>Keutamaan Dzikir</h2><p>Allah SWT berfirman: "Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram." (QS. Ar-Ra\'d: 28)...</p>',
                'type' => 'article',
                'category' => 'psycho_spiritual',
                'tags' => json_encode(['dzikir', 'kecemasan', 'mental', 'spiritual']),
                'level' => 'beginner',
                'reading_time_minutes' => 6,
                'is_published' => true,
                'is_featured' => false,
                'published_at' => now()->subDays(3),
                'views_count' => 540,
                'likes_count' => 78,
            ],
            [
                'title' => 'Etika Bekerja dalam Islam',
                'slug' => 'etika-bekerja-dalam-islam',
                'excerpt' => 'Memahami prinsip dan etika bekerja sesuai dengan ajaran Islam.',
                'content' => '<h2>Bekerja sebagai Ibadah</h2><p>Dalam Islam, bekerja bukan hanya untuk mencari nafkah, tetapi juga merupakan ibadah...</p>',
                'type' => 'article',
                'category' => 'general',
                'tags' => json_encode(['karir', 'kerja', 'etika', 'profesional']),
                'level' => 'beginner',
                'reading_time_minutes' => 10,
                'is_published' => true,
                'is_featured' => false,
                'published_at' => now()->subDays(20),
                'views_count' => 720,
                'likes_count' => 52,
            ],
            [
                'title' => 'Video: Tata Cara Shalat yang Benar',
                'slug' => 'video-tata-cara-shalat-yang-benar',
                'excerpt' => 'Panduan visual lengkap tata cara shalat sesuai sunnah Rasulullah SAW.',
                'content' => '<p>Video tutorial lengkap tentang tata cara shalat...</p>',
                'type' => 'video',
                'category' => 'waswas_worship',
                'tags' => json_encode(['shalat', 'ibadah', 'tutorial', 'video']),
                'media_url' => 'https://example.com/videos/tata-cara-shalat.mp4',
                'duration_minutes' => 25,
                'level' => 'beginner',
                'is_published' => true,
                'is_featured' => true,
                'published_at' => now()->subDays(45),
                'views_count' => 5600,
                'likes_count' => 320,
            ],
        ];

        $admin = User::where('email', 'admin@admin.com')->first();

        foreach ($contents as $content) {
            EducationalContent::firstOrCreate(
                ['slug' => $content['slug']],
                array_merge($content, ['author_id' => $admin?->id])
            );
        }
    }

    private function seedMessageTemplates(): void
    {
        $templates = [
            [
                'title' => 'Salam Pembuka',
                'content' => "Assalamu'alaikum Warahmatullahi Wabarakatuh,\n\nTerimakasih telah mempercayakan konsultasi kepada kami. Semoga Allah SWT memudahkan urusan Anda.\n\nPerkenalkan, saya {nama_konsultan} yang akan mendampingi Anda. Silakan ceritakan masalah yang Anda hadapi dengan nyaman.",
                'type' => 'greeting',
                'is_global' => true,
                'is_active' => true,
            ],
            [
                'title' => 'Konfirmasi Screening',
                'content' => "Terimakasih atas informasi yang Anda berikan. Berdasarkan screening awal, saya dapat memahami situasi Anda.\n\nMari kita bahas lebih lanjut tentang langkah-langkah yang bisa kita ambil bersama untuk mengatasi masalah ini.",
                'type' => 'screening',
                'is_global' => true,
                'is_active' => true,
            ],
            [
                'title' => 'Nasihat Umum',
                'content' => "Berdasarkan masalah yang Anda sampaikan, berikut beberapa nasihat yang bisa saya berikan:\n\n1. {poin_1}\n2. {poin_2}\n3. {poin_3}\n\nSemoga bermanfaat. Jika ada yang ingin ditanyakan lebih lanjut, jangan ragu untuk menyampaikannya.",
                'type' => 'guidance',
                'is_global' => true,
                'is_active' => true,
            ],
            [
                'title' => 'Penutup Sesi',
                'content' => "Alhamdulillah, kita sudah sampai di akhir sesi.\n\nSemoga bimbingan ini bermanfaat untuk Anda. Jangan lupa untuk mengamalkan apa yang sudah kita bahas bersama.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh.",
                'type' => 'closing',
                'is_global' => true,
                'is_active' => true,
            ],
            [
                'title' => 'Referral ke Profesional',
                'content' => "Berdasarkan kondisi yang Anda sampaikan, saya menyarankan untuk juga berkonsultasi dengan profesional di bidang {bidang}.\n\nHal ini bukan berarti saya tidak bisa membantu, namun penanganan dari berbagai sisi akan memberikan hasil yang lebih optimal untuk Anda.",
                'type' => 'other',
                'is_global' => true,
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            MessageTemplate::firstOrCreate(
                ['title' => $template['title'], 'is_global' => true],
                $template
            );
        }
    }

    private function seedConsultationTickets(): void
    {
        $clients = User::whereHas('roles', function ($q) {
            $q->where('name', 'user');
        })->get();

        $consultants = Consultant::with('user')->where('is_active', true)->get();
        $categories = ConsultationCategory::all();

        if ($clients->isEmpty() || $consultants->isEmpty() || $categories->isEmpty()) {
            return;
        }

        $ticketData = [
            [
                'category' => 'Pernikahan & Keluarga',
                'problem' => 'Saya dan istri sering berbeda pendapat dalam mendidik anak. Bagaimana cara menyatukan pandangan kami?',
                'status' => 'completed',
                'risk_level' => 'low',
            ],
            [
                'category' => 'Kesehatan Mental',
                'problem' => 'Saya merasa cemas berlebihan akhir-akhir ini, terutama tentang pekerjaan dan masa depan.',
                'status' => 'in_progress',
                'risk_level' => 'medium',
            ],
            [
                'category' => 'Keuangan Syariah',
                'problem' => 'Saya ingin memulai investasi yang halal. Apa saja pilihan yang tersedia dan bagaimana memulainya?',
                'status' => 'waiting',
                'risk_level' => 'low',
            ],
            [
                'category' => 'Pendidikan Anak',
                'problem' => 'Anak saya kecanduan gadget dan sulit diajak shalat. Bagaimana cara mengatasinya?',
                'status' => 'in_progress',
                'risk_level' => 'medium',
            ],
            [
                'category' => 'Ibadah & Fiqih',
                'problem' => 'Saya ingin mengetahui tata cara shalat tahajud yang benar dan tips istiqomah melakukannya.',
                'status' => 'completed',
                'risk_level' => 'low',
            ],
        ];

        foreach ($ticketData as $index => $data) {
            $client = $clients->random();
            $category = $categories->where('name', $data['category'])->first();
            $consultant = $consultants->where('specialist_category', $data['category'])->first()
                ?? $consultants->random();

            $ticket = ConsultationTicket::firstOrCreate(
                [
                    'ticket_number' => 'TKT-' . now()->format('Ymd') . '-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                ],
                [
                    'user_id' => $client->id,
                    'consultant_id' => $data['status'] !== 'waiting' ? $consultant->id : null,
                    'category' => $data['category'],
                    'problem_description' => $data['problem'],
                    'status' => $data['status'],
                    'risk_level' => $data['risk_level'],
                    'urgency' => 'normal',
                    'assigned_at' => $data['status'] !== 'waiting' ? now()->subDays(rand(1, 7)) : null,
                    'completed_at' => $data['status'] === 'completed' ? now()->subDays(rand(1, 3)) : null,
                    'screening_answers' => json_encode([
                        'durasi' => '1-3 bulan',
                        'urgensi' => 'Cukup mendesak',
                        'riwayat' => 'Belum pernah',
                    ]),
                ]
            );
        }
    }

    private function seedTransactionsAndPrograms(): void
    {
        $tickets = ConsultationTicket::whereIn('status', ['in_progress', 'completed'])
            ->whereNotNull('consultant_id')
            ->get();

        $packages = Package::where('is_active', true)->get();

        if ($tickets->isEmpty() || $packages->isEmpty()) {
            return;
        }

        foreach ($tickets as $index => $ticket) {
            $package = $packages->random();
            $adminFee = 5000;

            $transaction = Transaction::firstOrCreate(
                [
                    'invoice_number' => 'INV-' . now()->format('Ymd') . '-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                ],
                [
                    'user_id' => $ticket->user_id,
                    'consultant_id' => $ticket->consultant_id,
                    'ticket_id' => $ticket->id,
                    'package_id' => $package->id,
                    'amount' => $package->price,
                    'admin_fee' => $adminFee,
                    'total_amount' => $package->price + $adminFee,
                    'status' => 'paid',
                    'payment_method' => 'payment_gateway',
                    'paid_at' => now()->subDays(rand(5, 14)),
                ]
            );

            // Create Program
            $program = Program::firstOrCreate(
                [
                    'program_code' => 'PRG-' . now()->format('Ymd') . '-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                ],
                [
                    'user_id' => $ticket->user_id,
                    'consultant_id' => $ticket->consultant_id,
                    'ticket_id' => $ticket->id,
                    'transaction_id' => $transaction->id,
                    'package_id' => $package->id,
                    'title' => 'Program Bimbingan - ' . $ticket->category,
                    'goals' => 'Membantu klien mengatasi masalah terkait ' . strtolower($ticket->category),
                    'status' => $ticket->status === 'completed' ? 'completed' : 'active',
                    'start_date' => now()->subDays(rand(7, 21)),
                    'end_date' => $ticket->status === 'completed' ? now()->subDays(rand(1, 5)) : now()->addDays(rand(30, 60)),
                    'total_sessions' => $package->sessions_count ?? 6,
                    'completed_sessions' => $ticket->status === 'completed' ? ($package->sessions_count ?? 6) : rand(1, 3),
                    'remaining_sessions' => $ticket->status === 'completed' ? 0 : rand(3, 5),
                    'progress_percentage' => $ticket->status === 'completed' ? 100 : rand(20, 50),
                    'completed_at' => $ticket->status === 'completed' ? now()->subDays(rand(1, 5)) : null,
                ]
            );

            // Create Sessions
            $this->createProgramSessions($program);
        }
    }

    private function createProgramSessions(Program $program): void
    {
        $sessionCount = $program->completed_sessions > 0 ? $program->completed_sessions : 2;

        for ($i = 1; $i <= $sessionCount; $i++) {
            $scheduledAt = now()->subDays(($sessionCount - $i + 1) * 7);
            $isCompleted = $i <= $program->completed_sessions;

            $session = SessionSchedule::firstOrCreate(
                [
                    'program_id' => $program->id,
                    'session_number' => $i,
                ],
                [
                    'consultant_id' => $program->consultant_id,
                    'user_id' => $program->user_id,
                    'title' => 'Sesi ' . $i . ' - ' . ($i === 1 ? 'Perkenalan & Assessment' : 'Bimbingan Lanjutan'),
                    'type' => 'chat',
                    'status' => $isCompleted ? 'completed' : 'scheduled',
                    'scheduled_at' => $scheduledAt,
                    'started_at' => $isCompleted ? $scheduledAt : null,
                    'ended_at' => $isCompleted ? $scheduledAt->addHour() : null,
                    'duration_minutes' => $isCompleted ? 60 : null,
                    'notes' => $isCompleted ? 'Sesi berjalan dengan baik. Klien kooperatif.' : null,
                ]
            );

            // Create tasks for completed sessions
            if ($isCompleted) {
                $this->createSessionTasks($session, $program);
            }
        }
    }

    private function createSessionTasks($session, Program $program): void
    {
        $tasks = [
            [
                'title' => 'Membaca materi yang diberikan',
                'type' => 'reading',
                'status' => 'completed',
            ],
            [
                'title' => 'Journaling harian',
                'type' => 'journaling',
                'status' => 'completed',
            ],
            [
                'title' => 'Praktik dzikir pagi dan sore',
                'type' => 'practice',
                'status' => $program->status === 'completed' ? 'completed' : 'in_progress',
            ],
        ];

        foreach ($tasks as $taskData) {
            ProgramTask::firstOrCreate(
                [
                    'program_id' => $program->id,
                    'session_id' => $session->id,
                    'title' => $taskData['title'],
                ],
                [
                    'description' => 'Tugas untuk membantu proses bimbingan',
                    'type' => $taskData['type'],
                    'status' => $taskData['status'],
                    'due_date' => now()->subDays(rand(1, 7)),
                    'completed_at' => $taskData['status'] === 'completed' ? now()->subDays(rand(1, 5)) : null,
                ]
            );
        }
    }
}
