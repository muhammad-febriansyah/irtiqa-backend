<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use App\Models\Consultant;
use App\Models\ConsultationTicket;
use App\Models\ConsultationCategory;
use App\Models\EducationalContent;
use App\Models\Package;
use App\Models\Practitioner;
use App\Models\Dream;
use App\Models\Faq;
use App\Models\Transaction;
use App\Models\Program;
use App\Models\Rating;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdditionalDummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🌱 Menambahkan data dummy tambahan...');

        $this->seedAdditionalUsers();
        $this->seedAdditionalConsultants();
        $this->seedAdditionalPractitioners();
        $this->seedAdditionalDreams();
        $this->seedAdditionalTickets();
        $this->seedAdditionalEducationalContents();
        $this->seedAdditionalFaqs();
        $this->seedRatings();

        $this->command->info('✅ Data dummy tambahan berhasil ditambahkan!');
    }

    private function seedAdditionalUsers(): void
    {
        $this->command->info('👥 Menambahkan user tambahan...');

        $userRole = Role::where('name', 'user')->first();

        $additionalUsers = [
            ['name' => 'Fajar Ramadhan', 'email' => 'fajar.ramadhan@gmail.com', 'gender' => 'male', 'city' => 'Bekasi', 'province' => 'Jawa Barat'],
            ['name' => 'Nurul Hidayah', 'email' => 'nurul.hidayah@gmail.com', 'gender' => 'female', 'city' => 'Tangerang', 'province' => 'Banten'],
            ['name' => 'Irfan Hakim', 'email' => 'irfan.hakim@gmail.com', 'gender' => 'male', 'city' => 'Depok', 'province' => 'Jawa Barat'],
            ['name' => 'Maya Sari', 'email' => 'maya.sari@gmail.com', 'gender' => 'female', 'city' => 'Bogor', 'province' => 'Jawa Barat'],
            ['name' => 'Ridwan Kamil', 'email' => 'ridwan.kamil@gmail.com', 'gender' => 'male', 'city' => 'Cirebon', 'province' => 'Jawa Barat'],
            ['name' => 'Laila Sari', 'email' => 'laila.sari@gmail.com', 'gender' => 'female', 'city' => 'Solo', 'province' => 'Jawa Tengah'],
            ['name' => 'Zainul Arifin', 'email' => 'zainul.arifin@gmail.com', 'gender' => 'male', 'city' => 'Malang', 'province' => 'Jawa Timur'],
            ['name' => 'Rina Wijayanti', 'email' => 'rina.wijayanti@gmail.com', 'gender' => 'female', 'city' => 'Bali', 'province' => 'Bali'],
            ['name' => 'Dimas Prasetyo', 'email' => 'dimas.prasetyo@gmail.com', 'gender' => 'male', 'city' => 'Palembang', 'province' => 'Sumatera Selatan'],
            ['name' => 'Sinta Dewi', 'email' => 'sinta.dewi@gmail.com', 'gender' => 'female', 'city' => 'Padang', 'province' => 'Sumatera Barat'],
            ['name' => 'Arif Budiman', 'email' => 'arif.budiman@gmail.com', 'gender' => 'male', 'city' => 'Lampung', 'province' => 'Lampung'],
            ['name' => 'Mega Wati', 'email' => 'mega.wati@gmail.com', 'gender' => 'female', 'city' => 'Banjarmasin', 'province' => 'Kalimantan Selatan'],
            ['name' => 'Taufik Hidayat', 'email' => 'taufik.hidayat@gmail.com', 'gender' => 'male', 'city' => 'Samarinda', 'province' => 'Kalimantan Timur'],
            ['name' => 'Lestari Indah', 'email' => 'lestari.indah@gmail.com', 'gender' => 'female', 'city' => 'Manado', 'province' => 'Sulawesi Utara'],
            ['name' => 'Bambang Sutrisno', 'email' => 'bambang.sutrisno@gmail.com', 'gender' => 'male', 'city' => 'Pekanbaru', 'province' => 'Riau'],
        ];

        foreach ($additionalUsers as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
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
                    'birth_date' => now()->subYears(rand(20, 50))->subDays(rand(1, 365)),
                    'gender' => $userData['gender'],
                    'phone' => '08' . rand(100000000, 999999999),
                    'city' => $userData['city'],
                    'province' => $userData['province'],
                    'address' => 'Jl. ' . $userData['city'] . ' No. ' . rand(1, 100),
                    'disclaimer_accepted' => true,
                    'disclaimer_accepted_at' => now(),
                ]
            );
        }

        $this->command->info('   ✓ Berhasil menambahkan ' . count($additionalUsers) . ' user');
    }

    private function seedAdditionalConsultants(): void
    {
        $this->command->info('👨‍⚕️ Menambahkan konsultan tambahan...');

        $consultantRole = Role::where('name', 'consultant')->first();

        $additionalConsultants = [
            [
                'name' => 'Ustadz Hamzah Ali',
                'email' => 'hamzah.ali@irtiqa.com',
                'specialist_category' => 'Pernikahan & Keluarga',
                'level' => 'senior',
                'city' => 'Tangerang',
                'province' => 'Banten',
                'bio' => 'Konselor keluarga bersertifikat dengan fokus pada resolusi konflik rumah tangga. Telah menangani lebih dari 200 kasus.',
                'certificate_number' => 'CERT-2022-007',
            ],
            [
                'name' => 'Ustadzah Zahra Salma',
                'email' => 'zahra.salma@irtiqa.com',
                'specialist_category' => 'Kesehatan Mental',
                'level' => 'expert',
                'city' => 'Depok',
                'province' => 'Jawa Barat',
                'bio' => 'Psikolog klinis Muslim dengan spesialisasi terapi trauma dan anxiety. Pendekatan holistik Islamic Psychology.',
                'certificate_number' => 'CERT-2020-008',
            ],
            [
                'name' => 'Ustadz Fahmi Rahman',
                'email' => 'fahmi.rahman@irtiqa.com',
                'specialist_category' => 'Ibadah & Fiqih',
                'level' => 'expert',
                'city' => 'Malang',
                'province' => 'Jawa Timur',
                'bio' => 'Alumni Universitas Islam Madinah. Ahli fiqih dengan pengalaman mengajar 20 tahun di berbagai pesantren.',
                'certificate_number' => 'CERT-2018-009',
            ],
            [
                'name' => 'Ustadzah Nadia Kusuma',
                'email' => 'nadia.kusuma@irtiqa.com',
                'specialist_category' => 'Pendidikan Anak',
                'level' => 'junior',
                'city' => 'Solo',
                'province' => 'Jawa Tengah',
                'bio' => 'Praktisi parenting Islami muda. Aktif memberikan workshop pengasuhan anak di berbagai komunitas.',
                'certificate_number' => 'CERT-2023-010',
            ],
        ];

        foreach ($additionalConsultants as $consultantData) {
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

            Consultant::firstOrCreate(
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
                    'rating_average' => rand(42, 50) / 10,
                    'total_cases' => rand(15, 100),
                    'total_ratings' => rand(8, 80),
                ]
            );
        }

        $this->command->info('   ✓ Berhasil menambahkan ' . count($additionalConsultants) . ' konsultan');
    }

    private function seedAdditionalPractitioners(): void
    {
        $this->command->info('🏥 Menambahkan praktisi rujukan...');

        $practitioners = [
            [
                'name' => 'Dr. Ahmad Saifuddin, M.Psi',
                'title' => 'Dr.',
                'province' => 'DKI Jakarta',
                'city' => 'Jakarta Selatan',
                'phone' => '081234567890',
                'whatsapp' => '081234567890',
                'email' => 'ahmad.saifuddin@clinic.com',
                'address' => 'Jl. Psikologi No. 15, Jakarta Selatan',
                'specialties' => ['Psikologi Klinis', 'Terapi Trauma', 'Konseling Keluarga'],
                'bio' => 'Psikolog klinis bersertifikat dengan pengalaman 15 tahun. Spesialisasi dalam penanganan trauma dan gangguan kecemasan.',
            ],
            [
                'name' => 'dr. Fatimah Azzahra, Sp.KJ',
                'title' => 'dr.',
                'province' => 'Jawa Barat',
                'city' => 'Bandung',
                'phone' => '082345678901',
                'whatsapp' => '082345678901',
                'email' => 'fatimah.azzahra@hospital.com',
                'address' => 'RS Islam Bandung, Jl. Soekarno-Hatta',
                'specialties' => ['Psikiatri', 'Kesehatan Mental', 'Terapi Obat'],
                'bio' => 'Dokter spesialis kejiwaan dengan fokus pada penanganan depresi dan bipolar disorder.',
            ],
            [
                'name' => 'Ustadz Yusuf Mansur, M.A',
                'title' => 'Ustadz',
                'province' => 'Jawa Timur',
                'city' => 'Surabaya',
                'phone' => '083456789012',
                'whatsapp' => '083456789012',
                'email' => 'yusuf.mansur@pesantren.com',
                'address' => 'Pondok Pesantren Al-Hidayah, Surabaya',
                'specialties' => ['Konseling Spiritual', 'Ruqyah Syariah', 'Bimbingan Agama'],
                'bio' => 'Ustadz berpengalaman dalam bimbingan spiritual dan ruqyah syariah. Lulusan Al-Azhar University.',
            ],
            [
                'name' => 'H. Abdullah Nasution, S.E., M.M',
                'title' => 'H.',
                'province' => 'DKI Jakarta',
                'city' => 'Jakarta Pusat',
                'phone' => '084567890123',
                'whatsapp' => '084567890123',
                'email' => 'abdullah.nasution@finance.com',
                'address' => 'Gedung Keuangan Syariah, Jakarta Pusat',
                'specialties' => ['Keuangan Syariah', 'Investasi Halal', 'Perencanaan Keuangan'],
                'bio' => 'Praktisi keuangan syariah bersertifikat. Konsultan untuk berbagai lembaga keuangan Islam.',
            ],
            [
                'name' => 'Ustadzah Khadijah Hasan, M.Pd',
                'title' => 'Ustadzah',
                'province' => 'Jawa Tengah',
                'city' => 'Semarang',
                'phone' => '085678901234',
                'whatsapp' => '085678901234',
                'email' => 'khadijah.hasan@school.com',
                'address' => 'Sekolah Islam Terpadu, Semarang',
                'specialties' => ['Pendidikan Anak', 'Parenting Islami', 'Kurikulum Pendidikan'],
                'bio' => 'Pakar pendidikan Islam dengan fokus pada pengembangan karakter anak. Penulis buku parenting Islami.',
            ],
        ];

        foreach ($practitioners as $data) {
            Practitioner::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'title' => $data['title'],
                    'province' => $data['province'],
                    'city' => $data['city'],
                    'phone' => $data['phone'],
                    'whatsapp' => $data['whatsapp'],
                    'address' => $data['address'],
                    'specialties' => json_encode($data['specialties']),
                    'bio' => $data['bio'],
                    'verification_status' => 'verified',
                    'is_active' => true,
                    'accepting_referrals' => true,
                    'verified_at' => now(),
                    'referral_count' => rand(5, 30),
                    'average_rating' => rand(42, 50) / 10,
                ]
            );
        }

        $this->command->info('   ✓ Berhasil menambahkan ' . count($practitioners) . ' praktisi rujukan');
    }

    private function seedAdditionalDreams(): void
    {
        $this->command->info('💭 Menambahkan laporan mimpi...');

        $users = User::whereHas('roles', function ($q) {
            $q->where('name', 'user');
        })->get();

        if ($users->isEmpty()) {
            $this->command->warn('   ⚠ Tidak ada user, skip menambahkan dreams');
            return;
        }

        $dreamContents = [
            'Saya bermimpi sedang shalat di masjid yang sangat indah dan penuh cahaya',
            'Dalam mimpi saya bertemu dengan orang tua yang sudah meninggal, beliau terlihat bahagia',
            'Saya bermimpi sedang membaca Al-Quran dengan lancar meskipun saya tidak hafal',
            'Mimpi saya menunjukkan air yang sangat jernih mengalir di sungai',
            'Saya bermimpi sedang naik haji bersama keluarga',
            'Dalam mimpi saya melihat bulan purnama yang sangat terang',
            'Saya bermimpi sedang dalam keadaan bahaya tetapi ada seseorang yang menolong',
            'Mimpi saya menunjukkan saya sedang terbang di langit',
            'Saya bermimpi sedang berbicara dengan seseorang berpakaian putih',
            'Dalam mimpi saya sedang mencari jalan keluar dari tempat yang gelap',
            'Saya bermimpi sedang mendapat hadiah yang sangat berharga',
            'Mimpi saya menunjukkan kebakaran di rumah saya',
            'Saya bermimpi sedang kehilangan sesuatu yang penting',
            'Dalam mimpi saya melihat cahaya hijau yang sangat indah',
            'Saya bermimpi sedang berjalan di taman yang penuh bunga',
        ];

        $classifications = ['khayali_nafsani', 'emotional', 'sensitive_indication', null];

        foreach ($dreamContents as $index => $content) {
            $user = $users->random();
            $classification = $classifications[array_rand($classifications)];
            $requestConsultation = rand(0, 1) === 1 || $classification === 'sensitive_indication';

            Dream::create([
                'user_id' => $user->id,
                'dream_content' => $content,
                'dream_date' => now()->subDays(rand(1, 30))->format('Y-m-d'),
                'dream_time' => ['dini_hari', 'pagi', 'siang', 'sore', 'malam'][array_rand(['dini_hari', 'pagi', 'siang', 'sore', 'malam'])],
                'classification' => $classification,
                'requested_consultation' => $requestConsultation,
                'created_at' => now()->subDays(rand(1, 30)),
            ]);
        }

        $this->command->info('   ✓ Berhasil menambahkan ' . count($dreamContents) . ' laporan mimpi');
    }

    private function seedAdditionalTickets(): void
    {
        $this->command->info('🎫 Menambahkan tiket konsultasi...');

        $users = User::whereHas('roles', function ($q) {
            $q->where('name', 'user');
        })->get();

        $consultants = Consultant::where('is_active', true)->get();
        $categories = ConsultationCategory::all();

        if ($users->isEmpty() || $consultants->isEmpty() || $categories->isEmpty()) {
            $this->command->warn('   ⚠ Data tidak lengkap, skip menambahkan tickets');
            return;
        }

        $problems = [
            'Saya merasa hubungan dengan pasangan mulai renggang setelah punya anak',
            'Anak saya sulit fokus belajar dan sering tantrum',
            'Bagaimana cara memulai bisnis yang berkah menurut Islam?',
            'Saya ingin belajar lebih dalam tentang hukum waris dalam Islam',
            'Merasa overwhelmed dengan pekerjaan dan ibadah',
            'Kesulitan mengatur keuangan keluarga dengan gaji pas-pasan',
            'Ingin menikah tapi orang tua tidak merestui',
            'Anak remaja mulai menjauh dari agama',
            'Konflik dengan mertua yang tinggal serumah',
            'Dilema antara karir dan keluarga',
        ];

        $statuses = ['waiting', 'in_progress', 'completed'];
        $riskLevels = ['low', 'medium', 'high'];

        for ($i = 0; $i < 10; $i++) {
            $user = $users->random();
            $category = $categories->random();
            $consultant = $consultants->where('specialist_category', $category->name)->first()
                ?? $consultants->random();
            $status = $statuses[array_rand($statuses)];
            $riskLevel = $riskLevels[array_rand($riskLevels)];

            ConsultationTicket::create([
                'ticket_number' => 'TKT-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6)),
                'user_id' => $user->id,
                'consultant_id' => $status !== 'waiting' ? $consultant->id : null,
                'category' => $category->name,
                'problem_description' => $problems[array_rand($problems)],
                'status' => $status,
                'risk_level' => $riskLevel,
                'urgency' => ['normal', 'high', 'urgent'][array_rand(['normal', 'high', 'urgent'])],
                'assigned_at' => $status !== 'waiting' ? now()->subDays(rand(1, 10)) : null,
                'completed_at' => $status === 'completed' ? now()->subDays(rand(1, 5)) : null,
                'screening_answers' => json_encode([
                    'durasi' => ['Kurang dari 1 minggu', '1-4 minggu', '1-3 bulan', 'Lebih dari 3 bulan'][rand(0, 3)],
                    'urgensi' => ['Tidak mendesak', 'Cukup mendesak', 'Sangat mendesak'][rand(0, 2)],
                ]),
                'created_at' => now()->subDays(rand(1, 30)),
            ]);
        }

        $this->command->info('   ✓ Berhasil menambahkan 10 tiket konsultasi');
    }

    private function seedAdditionalEducationalContents(): void
    {
        $this->command->info('📚 Menambahkan konten edukasi...');

        $admin = User::whereHas('roles', function ($q) {
            $q->where('name', 'admin');
        })->first();

        if (!$admin) {
            $this->command->warn('   ⚠ Tidak ada admin, skip menambahkan educational contents');
            return;
        }

        $contents = [
            [
                'title' => '7 Cara Membangun Komunikasi Efektif dalam Rumah Tangga',
                'slug' => '7-cara-komunikasi-efektif-rumah-tangga',
                'excerpt' => 'Komunikasi adalah fondasi rumah tangga yang harmonis. Pelajari teknik komunikasi yang efektif.',
                'content' => '<h2>Komunikasi dalam Perspektif Islam</h2><p>Allah SWT berfirman untuk berbicara dengan perkataan yang baik...</p>',
                'type' => 'article',
                'category' => 'Pernikahan & Keluarga',
                'tags' => ['komunikasi', 'pernikahan', 'keluarga'],
                'level' => 'beginner',
                'reading_time_minutes' => 10,
            ],
            [
                'title' => 'Mengajarkan Anak Puasa Sejak Dini',
                'slug' => 'mengajarkan-anak-puasa-sejak-dini',
                'excerpt' => 'Panduan praktis memperkenalkan ibadah puasa kepada anak-anak.',
                'content' => '<h2>Kapan Mulai Mengajarkan Puasa?</h2><p>Para ulama merekomendasikan...</p>',
                'type' => 'guide',
                'category' => 'Pendidikan Anak',
                'tags' => ['puasa', 'anak', 'ibadah', 'ramadhan'],
                'level' => 'beginner',
                'reading_time_minutes' => 8,
            ],
            [
                'title' => 'Investasi Reksadana Syariah untuk Pemula',
                'slug' => 'investasi-reksadana-syariah-pemula',
                'excerpt' => 'Memulai investasi halal dengan reksadana syariah. Panduan lengkap untuk pemula.',
                'content' => '<h2>Apa itu Reksadana Syariah?</h2><p>Reksadana syariah adalah instrumen investasi...</p>',
                'type' => 'guide',
                'category' => 'Keuangan Syariah',
                'tags' => ['investasi', 'reksadana', 'syariah', 'halal'],
                'level' => 'intermediate',
                'reading_time_minutes' => 15,
            ],
            [
                'title' => 'Adab Tidur dan Bangun Tidur dalam Islam',
                'slug' => 'adab-tidur-bangun-dalam-islam',
                'excerpt' => 'Pelajari sunnah-sunnah Rasulullah SAW saat tidur dan bangun tidur.',
                'content' => '<h2>Doa Sebelum Tidur</h2><p>Rasulullah SAW mengajarkan doa...</p>',
                'type' => 'article',
                'category' => 'Ibadah & Fiqih',
                'tags' => ['adab', 'tidur', 'doa', 'sunnah'],
                'level' => 'beginner',
                'reading_time_minutes' => 5,
            ],
            [
                'title' => 'Terapi Quranic Healing untuk Kesehatan Mental',
                'slug' => 'terapi-quranic-healing-kesehatan-mental',
                'excerpt' => 'Bagaimana Al-Quran dapat menjadi terapi untuk kesehatan mental kita.',
                'content' => '<h2>Al-Quran sebagai Syifa</h2><p>Allah berfirman bahwa Al-Quran adalah obat...</p>',
                'type' => 'article',
                'category' => 'Kesehatan Mental',
                'tags' => ['quran', 'mental', 'terapi', 'healing'],
                'level' => 'intermediate',
                'reading_time_minutes' => 12,
            ],
        ];

        foreach ($contents as $content) {
            EducationalContent::firstOrCreate(
                ['slug' => $content['slug']],
                array_merge($content, [
                    'author_id' => $admin->id,
                    'is_published' => true,
                    'is_featured' => rand(0, 1) === 1,
                    'published_at' => now()->subDays(rand(1, 60)),
                    'views_count' => rand(100, 3000),
                    'likes_count' => rand(10, 200),
                    'tags' => json_encode($content['tags']),
                ])
            );
        }

        $this->command->info('   ✓ Berhasil menambahkan ' . count($contents) . ' konten edukasi');
    }

    private function seedAdditionalFaqs(): void
    {
        $this->command->info('❓ Menambahkan FAQ...');

        $faqs = [
            [
                'question' => 'Bagaimana cara memilih konsultan yang tepat?',
                'answer' => 'Anda dapat memilih konsultan berdasarkan kategori masalah, tingkat pengalaman, dan rating dari klien sebelumnya. Setiap konsultan memiliki spesialisasi yang berbeda.',
                'category' => 'Konsultasi',
                'order' => 1,
            ],
            [
                'question' => 'Apakah data konsultasi saya dijamin kerahasiaannya?',
                'answer' => 'Ya, semua data konsultasi Anda dijamin kerahasiaannya sesuai dengan kode etik konseling dan kebijakan privasi kami.',
                'category' => 'Privasi',
                'order' => 2,
            ],
            [
                'question' => 'Berapa lama durasi satu sesi konsultasi?',
                'answer' => 'Durasi satu sesi konsultasi biasanya 60 menit. Namun dapat disesuaikan dengan kebutuhan dan paket yang dipilih.',
                'category' => 'Konsultasi',
                'order' => 3,
            ],
            [
                'question' => 'Apa yang harus saya siapkan sebelum konsultasi?',
                'answer' => 'Siapkan deskripsi masalah yang jelas, catatan kejadian penting, dan pertanyaan yang ingin ditanyakan. Pastikan juga koneksi internet stabil.',
                'category' => 'Konsultasi',
                'order' => 4,
            ],
            [
                'question' => 'Bagaimana sistem pembayarannya?',
                'answer' => 'Kami menerima berbagai metode pembayaran termasuk transfer bank, e-wallet, dan payment gateway. Pembayaran dilakukan di awal sebelum konsultasi dimulai.',
                'category' => 'Pembayaran',
                'order' => 5,
            ],
            [
                'question' => 'Apakah ada garansi jika tidak puas dengan konsultasi?',
                'answer' => 'Kami memiliki sistem rating dan feedback. Jika ada masalah serius, Anda dapat menghubungi customer service untuk penyelesaian.',
                'category' => 'Layanan',
                'order' => 6,
            ],
            [
                'question' => 'Apakah konsultasi bisa dilakukan secara offline?',
                'answer' => 'Saat ini layanan kami fokus pada konsultasi online untuk memberikan kemudahan akses. Namun beberapa konsultan mungkin menawarkan sesi offline.',
                'category' => 'Konsultasi',
                'order' => 7,
            ],
            [
                'question' => 'Bagaimana jika saya perlu membatalkan jadwal konsultasi?',
                'answer' => 'Pembatalan dapat dilakukan maksimal 24 jam sebelum jadwal konsultasi. Silakan hubungi customer service atau ubah jadwal melalui aplikasi.',
                'category' => 'Layanan',
                'order' => 8,
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::firstOrCreate(
                ['question' => $faq['question']],
                [
                    'answer' => $faq['answer'],
                    'category' => $faq['category'],
                    'order' => $faq['order'],
                    'is_published' => true,
                    'views_count' => rand(50, 500),
                ]
            );
        }

        $this->command->info('   ✓ Berhasil menambahkan ' . count($faqs) . ' FAQ');
    }

    private function seedRatings(): void
    {
        $this->command->info('⭐ Menambahkan rating & review...');

        $completedTickets = ConsultationTicket::where('status', 'completed')
            ->whereNotNull('consultant_id')
            ->get();

        if ($completedTickets->isEmpty()) {
            $this->command->warn('   ⚠ Tidak ada tiket selesai, skip menambahkan ratings');
            return;
        }

        $reviews = [
            'Konsultasinya sangat membantu. Ustadz/ah sangat sabar dan memberikan solusi yang aplikatif.',
            'Alhamdulillah, saya merasa lebih tenang setelah konsultasi. Jazakallah khairan.',
            'Penjelasannya mudah dipahami dan sangat bermanfaat. Recommended!',
            'Masya Allah, konsultan sangat profesional dan empati terhadap masalah saya.',
            'Sangat puas dengan pelayanan dan bimbingannya. Semoga berkah.',
            'Solusi yang diberikan sangat praktis dan sesuai syariat. Terima kasih banyak.',
            'Ustadz/ah nya sangat memahami masalah saya. Alhamdulillah terbantu.',
            'Konsultasi yang sangat berkesan. Saya mendapat insight baru.',
            'Pelayanan cepat dan responsif. Terima kasih atas bimbingannya.',
            'Sangat memuaskan. Akan konsultasi lagi jika ada masalah.',
        ];

        foreach ($completedTickets->take(15) as $ticket) {
            if (!Rating::where('ticket_id', $ticket->id)->exists()) {
                Rating::create([
                    'user_id' => $ticket->user_id,
                    'consultant_id' => $ticket->consultant_id,
                    'ticket_id' => $ticket->id,
                    'rating' => rand(4, 5),
                    'review' => $reviews[array_rand($reviews)],
                    'created_at' => $ticket->completed_at ?? now(),
                ]);
            }
        }

        $this->command->info('   ✓ Berhasil menambahkan rating & review');
    }
}
