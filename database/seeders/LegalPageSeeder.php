<?php

namespace Database\Seeders;

use App\Models\LegalPage;
use Illuminate\Database\Seeder;

class LegalPageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        LegalPage::create([
            'slug' => 'terms-and-conditions',
            'title' => 'Syarat & Ketentuan',
            'content' => '<h1>Syarat & Ketentuan</h1><p>Ini adalah halaman syarat dan ketentuan penggunaan platform IRTIQA.</p><ol><li><strong>Keanggotaan</strong>: Pengguna harus mendaftar untuk mendapatkan layanan.</li><li><strong>Tanggung Jawab</strong>: IRTIQA adalah platform pendampingan, bukan pengganti medis.</li></ol>',
        ]);

        LegalPage::create([
            'slug' => 'privacy-policy',
            'title' => 'Kebijakan Privasi',
            'content' => '<h1>Kebijakan Privasi</h1><p>Kami menjaga data pribadi Anda dengan sangat hati-hati.</p><ul><li>Kami tidak menyebarluaskan data Anda kepada pihak ketiga.</li><li>Data enkripsi digunakan untuk keamanan interaksi.</li></ul>',
        ]);
    }
}
