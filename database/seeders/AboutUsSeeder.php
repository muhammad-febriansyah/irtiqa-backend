<?php

namespace Database\Seeders;

use App\Models\AboutUs;
use Illuminate\Database\Seeder;

class AboutUsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AboutUs::create([
            'title' => 'Tentang IRTIQA',
            'desc' => '<p><strong>IRTIQA</strong> adalah platform pendampingan psiko-spiritual Islami yang menekankan proses bertahap, adab, dan kehati-hatian.</p><p>IRTIQA membantu pengguna memahami kondisi batin, mimpi, dan kegelisahan secara jernih melalui edukasi, konsultasi terarah, dan rujukan yang bertanggung jawab—tanpa klaim kepastian ghaib dan tanpa menggantikan peran tenaga medis atau ulama.</p><h3>Visi</h3><p>Menjadi platform pendampingan psiko-spiritual Islami yang aman, beradab, dan bertanggung jawab, dalam menuntun masyarakat menuju kejernihan batin dan kedewasaan spiritual.</p><h3>Misi</h3><ul><li>Menyediakan pendampingan psiko-spiritual yang bertahap, tidak menghakimi, dan berbasis kehati-hatian.</li><li>Menjernihkan pemahaman masyarakat dari sugesti berlebihan dan klaim ghaib yang tidak bertanggung jawab.</li><li>Mengedukasi pengguna agar mampu mengenali kondisi batin secara rasional dan spiritual.</li><li>Menjadi jembatan rujukan yang beretika dan proporsional antara kebutuhan batin, pendampingan ruhani, dan bantuan profesional.</li></ul>',
            'image' => null,
        ]);
    }
}
