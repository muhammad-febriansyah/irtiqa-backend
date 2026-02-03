<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SiteSettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Site Branding
            'app_name' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:10240',
            'favicon' => 'nullable|file|mimes:ico,png|max:10240',

            // SEO
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'seo_keywords' => 'nullable|string|max:500',

            // Contact
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'contact_address' => 'nullable|string|max:500',
            'contact_hours' => 'nullable|string|max:255',

            // Social Media
            'facebook_url' => 'nullable|url|max:255',
            'instagram_url' => 'nullable|url|max:255',
            'twitter_url' => 'nullable|url|max:255',
            'tiktok_url' => 'nullable|url|max:255',

            // Email/SMTP Settings
            'mail_from_name' => 'nullable|string|max:255',
            'mail_from_address' => 'nullable|email|max:255',
            'mail_username' => 'nullable|string|max:255',
            'mail_password' => 'nullable|string|max:255',
            'mail_api_key' => 'nullable|string|max:500',

            // WhatsApp Settings
            'whatsapp_number' => 'nullable|string|max:20',
            'whatsapp_api_key' => 'nullable|string|max:500',

            // Duitku Payment Settings
            'duitku_merchant_code' => 'nullable|string|max:255',
            'duitku_api_key' => 'nullable|string|max:500',
            'duitku_environment' => 'nullable|string|in:sandbox,production',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'app_name' => 'nama website',
            'tagline' => 'tagline',
            'description' => 'deskripsi',
            'logo' => 'logo',
            'favicon' => 'favicon',
            'seo_title' => 'SEO title',
            'seo_description' => 'SEO description',
            'seo_keywords' => 'SEO keywords',
            'contact_email' => 'email kontak',
            'contact_phone' => 'telepon kontak',
            'contact_address' => 'alamat kontak',
            'contact_hours' => 'jam operasional',
            'facebook_url' => 'URL Facebook',
            'instagram_url' => 'URL Instagram',
            'twitter_url' => 'URL Twitter',
            'tiktok_url' => 'URL TikTok',
            'mail_from_name' => 'nama pengirim',
            'mail_from_address' => 'email pengirim',
            'mail_username' => 'username email',
            'mail_password' => 'password email',
            'mail_api_key' => 'API key email',
            'whatsapp_number' => 'nomor WhatsApp',
            'whatsapp_api_key' => 'API key WhatsApp',
            'duitku_merchant_code' => 'merchant code Duitku',
            'duitku_api_key' => 'API key Duitku',
            'duitku_environment' => 'environment Duitku',
        ];
    }
}
