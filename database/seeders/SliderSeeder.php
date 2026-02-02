<?php

namespace Database\Seeders;

use App\Models\Slider;
use App\Models\SystemSetting;
use App\Models\Banner;
use Illuminate\Database\Seeder;

class SliderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sliders = [
            [
                'title' => 'Temukan Ketenangan Hati',
                'desc' => 'Dapatkan pendampingan psiko-spiritual yang mendalam bersama konsultan ahli untuk membantu Anda menemukan kedamaian batin.',
                'image' => 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Bimbingan Islami Terpercaya',
                'desc' => 'Semua solusi yang kami tawarkan berlandaskan pada nilai-nilai Al-Qur\'an dan Sunnah, dipadukan dengan pendekatan psikologi modern.',
                'image' => 'https://images.unsplash.com/photo-1519781542704-957ff19000db?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Perjalanan Spiritual Anda Dimulai Di Sini',
                'desc' => 'Mulailah langkah pertama menuju diri yang lebih baik. Bergabunglah dengan ribuan pengguna yang telah merasakan manfaat IRTIQA.',
                'image' => 'https://images.unsplash.com/photo-1499209974431-9dac3adaf471?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($sliders as $slider) {
            Slider::create($slider);
        }

        // Nullify onboarding images
        SystemSetting::where('key', 'logo')->update(['value' => null]);
        Banner::query()->update(['image' => null]);
    }
}
