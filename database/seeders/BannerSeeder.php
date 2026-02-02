<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Banner;

class BannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Banner::create([
            'title' => 'Temukan Ketenangan Jiwa Bersama IRTIQA',
            'description' => 'Pendampingan Psiko-Spiritual Islami untuk membantu Anda menemukan makna dan kedamaian dalam setiap langkah perjalanan hidup.',
            'image' => '/assets/hero_serenity.png',
        ]);
    }
}
