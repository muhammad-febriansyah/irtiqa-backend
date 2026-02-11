<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ConsultationCategory;

class ConsultationCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * IRTIQA - Platform Pendampingan Psiko-Spiritual Islami
     *
     * Kategori konsultasi sesuai spesifikasi:
     * - Tidak sugestif
     * - Edukatif
     * - Menenangkan
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Kegelisahan Batin',
                'slug' => 'inner_restlessness',
                'icon' => '🧠',
                'description' => 'Konsultasi untuk memahami kegelisahan dan keresahan batin secara bertahap',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Mimpi yang Mengganggu',
                'slug' => 'disturbing_dreams',
                'icon' => '🌙',
                'description' => 'Pendampingan untuk memahami mimpi yang menimbulkan kegelisahan, dengan pendekatan bijak dan tidak berlebihan',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Waswas & Ketenangan Ibadah',
                'slug' => 'waswas_worship',
                'icon' => '🕊️',
                'description' => 'Bantuan untuk mengatasi waswas dan meningkatkan ketenangan dalam ibadah',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Keluarga & Anak',
                'slug' => 'family_children',
                'icon' => '👨‍👩‍👧',
                'description' => 'Konsultasi seputar hubungan keluarga dan pendampingan perkembangan anak secara islami',
                'is_active' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Edukasi Psiko-Spiritual',
                'slug' => 'psycho_spiritual_education',
                'icon' => '📚',
                'description' => 'Pembelajaran dan penguatan pemahaman psiko-spiritual untuk pertumbuhan diri',
                'is_active' => true,
                'sort_order' => 5,
            ],
        ];

        foreach ($categories as $category) {
            ConsultationCategory::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }

        $this->command->info('✅ Consultation categories seeded successfully!');
        $this->command->info('   Total: ' . count($categories) . ' categories');
    }
}
