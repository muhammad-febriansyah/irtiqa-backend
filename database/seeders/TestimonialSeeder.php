<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $testimonials = [
            [
                'name' => 'Andi Saputra',
                'role' => 'Pengusaha',
                'quote' => 'Sangat membantu dalam mengelola kecemasan bisnis saya melalui perspektif yang menenangkan.',
                'rating' => 5,
                'is_active' => true,
                'order' => 1,
            ],
            [
                'name' => 'Siti Maryam',
                'role' => 'Ibu Rumah Tangga',
                'quote' => 'Bimbingan parenting-nya sangat berdasar dan sesuai dengan nilai-nilai yang kami anut sekeluarga.',
                'rating' => 5,
                'is_active' => true,
                'order' => 2,
            ],
            [
                'name' => 'Reza Fahlevi',
                'role' => 'Mahasiswa',
                'quote' => 'Analisis mimpi yang diberikan memberikan kejernihan pikiran di saat saya merasa buntu.',
                'rating' => 5,
                'is_active' => true,
                'order' => 3,
            ],
            [
                'name' => 'Dewi Lestari',
                'role' => 'Karyawan Swasta',
                'quote' => 'Platform yang sangat membantu dalam menemukan konselor yang tepat sesuai kebutuhan saya.',
                'rating' => 5,
                'is_active' => true,
                'order' => 4,
            ],
            [
                'name' => 'Ahmad Fauzi',
                'role' => 'Guru',
                'quote' => 'Konsultasi yang diberikan sangat profesional dan sesuai dengan nilai-nilai Islam.',
                'rating' => 5,
                'is_active' => true,
                'order' => 5,
            ],
            [
                'name' => 'Nurul Hidayah',
                'role' => 'Dokter',
                'quote' => 'Pendekatan holistik yang menggabungkan psikologi dan spiritualitas sangat membantu pasien saya.',
                'rating' => 5,
                'is_active' => true,
                'order' => 6,
            ],
            [
                'name' => 'Budi Santoso',
                'role' => 'Karyawan',
                'quote' => 'Konseling yang saya terima membantu saya menemukan keseimbangan antara pekerjaan dan kehidupan pribadi.',
                'rating' => 5,
                'is_active' => true,
                'order' => 7,
            ],
            [
                'name' => 'Fatimah Zahra',
                'role' => 'Mahasiswi',
                'quote' => 'Sangat terbantu dalam mengatasi anxiety dan menemukan kedamaian dalam menjalani kuliah.',
                'rating' => 5,
                'is_active' => true,
                'order' => 8,
            ],
        ];

        foreach ($testimonials as $testimonial) {
            Testimonial::create($testimonial);
        }
    }
}
