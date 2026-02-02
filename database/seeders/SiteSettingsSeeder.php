<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SiteSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Site Branding
            [
                'key' => 'app_name',
                'value' => 'Irtiqa',
                'type' => 'text',
                'group' => 'site_branding',
                'description' => 'Nama website',
                'is_public' => true,
            ],
            [
                'key' => 'tagline',
                'value' => 'Pendampingan Psiko-Spiritual Islami',
                'type' => 'text',
                'group' => 'site_branding',
                'description' => 'Tagline website',
                'is_public' => true,
            ],
            [
                'key' => 'description',
                'value' => 'Platform konsultasi islami yang menghubungkan Anda dengan konsultan berpengalaman untuk mendapatkan bimbingan spiritual dan solusi kehidupan sehari-hari berdasarkan Al-Quran dan Hadits.',
                'type' => 'text',
                'group' => 'site_branding',
                'description' => 'Deskripsi website',
                'is_public' => true,
            ],

            // SEO
            [
                'key' => 'seo_title',
                'value' => 'Irtiqa - Platform Konsultasi Islami Online Terpercaya',
                'type' => 'text',
                'group' => 'site_seo',
                'description' => 'SEO title untuk meta tag',
                'is_public' => true,
            ],
            [
                'key' => 'seo_description',
                'value' => 'Dapatkan konsultasi islami dari konsultan berpengalaman. Bimbingan spiritual, solusi masalah kehidupan, dan nasihat agama berdasarkan Al-Quran dan Hadits.',
                'type' => 'text',
                'group' => 'site_seo',
                'description' => 'SEO description untuk meta tag',
                'is_public' => true,
            ],
            [
                'key' => 'seo_keywords',
                'value' => 'konsultasi islami, bimbingan spiritual, konsultan agama, tanya jawab islam, nasihat islami, konseling syariah, kajian islam',
                'type' => 'text',
                'group' => 'site_seo',
                'description' => 'SEO keywords untuk meta tag',
                'is_public' => true,
            ],

            // Contact
            [
                'key' => 'contact_email',
                'value' => 'info@irtiqa.com',
                'type' => 'text',
                'group' => 'site_contact',
                'description' => 'Email kontak',
                'is_public' => true,
            ],
            [
                'key' => 'contact_phone',
                'value' => '+62 812 3456 7890',
                'type' => 'text',
                'group' => 'site_contact',
                'description' => 'Nomor telepon kontak',
                'is_public' => true,
            ],
            [
                'key' => 'contact_address',
                'value' => 'Jl. Masjid Agung No. 123, Jakarta Pusat 10110, Indonesia',
                'type' => 'text',
                'group' => 'site_contact',
                'description' => 'Alamat kantor',
                'is_public' => true,
            ],

            // Social Media
            [
                'key' => 'facebook_url',
                'value' => 'https://facebook.com/irtiqa',
                'type' => 'text',
                'group' => 'site_social',
                'description' => 'URL Facebook',
                'is_public' => true,
            ],
            [
                'key' => 'instagram_url',
                'value' => 'https://instagram.com/irtiqa',
                'type' => 'text',
                'group' => 'site_social',
                'description' => 'URL Instagram',
                'is_public' => true,
            ],
            [
                'key' => 'twitter_url',
                'value' => 'https://twitter.com/irtiqa',
                'type' => 'text',
                'group' => 'site_social',
                'description' => 'URL Twitter',
                'is_public' => true,
            ],
            [
                'key' => 'tiktok_url',
                'value' => 'https://tiktok.com/@irtiqa',
                'type' => 'text',
                'group' => 'site_social',
                'description' => 'URL TikTok',
                'is_public' => true,
            ],

            // Duitku Payment Settings
            [
                'key' => 'duitku_merchant_code',
                'value' => '',
                'type' => 'text',
                'group' => 'payment',
                'description' => 'Merchant Code Duitku',
                'is_public' => false,
            ],
            [
                'key' => 'duitku_api_key',
                'value' => '',
                'type' => 'text',
                'group' => 'payment',
                'description' => 'API Key Duitku',
                'is_public' => false,
            ],
            [
                'key' => 'duitku_environment',
                'value' => 'sandbox',
                'type' => 'text',
                'group' => 'payment',
                'description' => 'Environment Duitku (sandbox/production)',
                'is_public' => false,
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('Site settings seeded successfully!');
    }
}
