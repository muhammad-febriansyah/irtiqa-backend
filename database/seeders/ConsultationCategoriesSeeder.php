<?php

namespace Database\Seeders;

use App\Models\ConsultationCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ConsultationCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Konsultasi Kegelisahan Batin',
                'slug' => 'kegelisahan-batin',
                'description' => 'Jika ada kegelisahan yang ingin dipahami dengan tenang. Kami mendampingi untuk menjernihkan kondisi batin secara bertahap.',
                'icon' => '🧠',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Mimpi yang Mengganggu',
                'slug' => 'mimpi-mengganggu',
                'description' => 'Tidak semua mimpi perlu ditafsirkan. Kami membantu memahami sikap yang tepat terhadap mimpi secara syar\'i dan psikologis.',
                'icon' => '🌙',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Waswas & Ketenangan Ibadah',
                'slug' => 'waswas-ibadah',
                'description' => 'Pendampingan untuk mengatasi waswas dan menemukan ketenangan dalam beribadah dengan cara yang benar dan tenang.',
                'icon' => '🕊️',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Keluarga & Anak',
                'slug' => 'keluarga-anak',
                'description' => 'Pendampingan dalam menghadapi dinamika keluarga dan perkembangan anak dengan pendekatan Islami yang bijaksana.',
                'icon' => '👨‍👩‍👧',
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($categories as $category) {
            ConsultationCategory::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
