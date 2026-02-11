<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SiteSettingRequest;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SiteSettingController extends Controller
{
    /**
     * Display the site settings form.
     */
    public function index(): Response
    {
        $settings = [
            'app_name' => SystemSetting::get('app_name', config('app.name')),
            'tagline' => SystemSetting::get('tagline', ''),
            'description' => SystemSetting::get('description', ''),
            'logo' => $this->getFileUrl('logo'),
            'favicon' => $this->getFileUrl('favicon'),

            'seo_title' => SystemSetting::get('seo_title', ''),
            'seo_description' => SystemSetting::get('seo_description', ''),
            'seo_keywords' => SystemSetting::get('seo_keywords', ''),

            'contact_email' => SystemSetting::get('contact_email', ''),
            'contact_phone' => SystemSetting::get('contact_phone', ''),
            'contact_address' => SystemSetting::get('contact_address', ''),
            'contact_hours' => SystemSetting::get('contact_hours', 'Senin - Jumat | 09:00 - 17:00 WIB'),

            'facebook_url' => SystemSetting::get('facebook_url', ''),
            'instagram_url' => SystemSetting::get('instagram_url', ''),
            'twitter_url' => SystemSetting::get('twitter_url', ''),
            'tiktok_url' => SystemSetting::get('tiktok_url', ''),

            'mail_from_name' => SystemSetting::get('mail_from_name', config('mail.from.name', '')),
            'mail_from_address' => SystemSetting::get('mail_from_address', config('mail.from.address', '')),
            'mail_username' => SystemSetting::get('mail_username', config('mail.mailers.smtp.username', '')),
            'mail_password' => SystemSetting::get('mail_password', ''), // Don't show actual password
            'mail_api_key' => SystemSetting::get('mail_api_key', ''),

            'whatsapp_api_key' => SystemSetting::get('whatsapp_api_key', ''),
            'whatsapp_sender' => SystemSetting::get('whatsapp_sender', ''),

            'duitku_merchant_code' => SystemSetting::get('duitku_merchant_code', ''),
            'duitku_api_key' => SystemSetting::get('duitku_api_key', ''),
            'duitku_environment' => SystemSetting::get('duitku_environment', 'sandbox'),
        ];

        return Inertia::render('admin/site-settings/index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update the site settings.
     */
    public function update(SiteSettingRequest $request)
    {
        try {
            DB::beginTransaction();

            $this->handleFileUpload($request, 'logo', 'site_branding');
            $this->handleFileUpload($request, 'favicon', 'site_branding');

            $textSettings = [
                'app_name' => ['value' => $request->app_name, 'group' => 'site_branding'],
                'tagline' => ['value' => $request->tagline, 'group' => 'site_branding'],
                'description' => ['value' => $request->description, 'group' => 'site_branding'],

                'seo_title' => ['value' => $request->seo_title, 'group' => 'site_seo'],
                'seo_description' => ['value' => $request->seo_description, 'group' => 'site_seo'],
                'seo_keywords' => ['value' => $request->seo_keywords, 'group' => 'site_seo'],

                'contact_email' => ['value' => $request->contact_email, 'group' => 'site_contact'],
                'contact_phone' => ['value' => $request->contact_phone, 'group' => 'site_contact'],
                'contact_address' => ['value' => $request->contact_address, 'group' => 'site_contact'],
                'contact_hours' => ['value' => $request->contact_hours, 'group' => 'site_contact'],

                'facebook_url' => ['value' => $request->facebook_url, 'group' => 'site_social'],
                'instagram_url' => ['value' => $request->instagram_url, 'group' => 'site_social'],
                'twitter_url' => ['value' => $request->twitter_url, 'group' => 'site_social'],
                'tiktok_url' => ['value' => $request->tiktok_url, 'group' => 'site_social'],

                'mail_from_name' => ['value' => $request->mail_from_name, 'group' => 'mail'],
                'mail_from_address' => ['value' => $request->mail_from_address, 'group' => 'mail'],
                'mail_username' => ['value' => $request->mail_username, 'group' => 'mail'],
                'mail_api_key' => ['value' => $request->mail_api_key, 'group' => 'mail'],

                'whatsapp_api_key' => ['value' => $request->whatsapp_api_key, 'group' => 'whatsapp'],
                'whatsapp_sender' => ['value' => $request->whatsapp_sender, 'group' => 'whatsapp'],

                'duitku_merchant_code' => ['value' => $request->duitku_merchant_code, 'group' => 'payment'],
                'duitku_api_key' => ['value' => $request->duitku_api_key, 'group' => 'payment'],
                'duitku_environment' => ['value' => $request->duitku_environment, 'group' => 'payment'],
            ];

            if ($request->filled('mail_password')) {
                $textSettings['mail_password'] = ['value' => $request->mail_password, 'group' => 'mail'];
            }

            foreach ($textSettings as $key => $data) {
                SystemSetting::updateOrCreate(
                    ['key' => $key],
                    [
                        'value' => $data['value'],
                        'type' => 'text',
                        'group' => $data['group'],
                    ]
                );
            }

            DB::commit();

            return redirect()->back()->with('success', 'Pengaturan situs berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Gagal memperbarui pengaturan: ' . $e->getMessage());
        }
    }

    /**
     * Test email configuration by sending a test email.
     */
    public function testEmail(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'test_email' => 'required|email',
            ]);

            $appName = SystemSetting::get('app_name', config('app.name'));

            \Log::info('Attempting to send test email', [
                'to' => $validated['test_email'],
                'app_name' => $appName,
            ]);

            Mail::raw('Ini adalah email test dari aplikasi ' . $appName . '. Jika Anda menerima email ini, berarti konfigurasi email sudah benar.', function ($message) use ($validated, $appName) {
                $message->to($validated['test_email'])
                    ->subject('Test Email - ' . $appName);
            });

            \Log::info('Test email sent successfully', ['to' => $validated['test_email']]);

            return response()->json([
                'success' => true,
                'message' => 'Email test berhasil dikirim ke ' . $validated['test_email'],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Email test validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal: ' . collect($e->errors())->flatten()->first(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Email test failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Test WhatsApp configuration by sending a test message.
     */
    public function testWhatsApp(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'test_phone' => 'required|string',
            ]);

            $whatsapp = new \App\Services\WhatsAppService();

            if (!$whatsapp->isConfigured()) {
                return response()->json([
                    'success' => false,
                    'message' => 'WhatsApp gateway belum dikonfigurasi. Silakan isi API Key dan Nomor Pengirim terlebih dahulu.',
                ], 422);
            }

            $result = $whatsapp->testConnection($request->test_phone);

            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Pesan WhatsApp test berhasil dikirim ke ' . $request->test_phone,
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'] ?? 'Gagal mengirim pesan WhatsApp',
                ], 422);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Handle file upload for logo or favicon.
     */
    private function handleFileUpload(SiteSettingRequest $request, string $fieldName, string $group): void
    {
        if ($request->hasFile($fieldName)) {
            $oldFile = SystemSetting::get($fieldName);
            if ($oldFile && Storage::disk('public')->exists($oldFile)) {
                Storage::disk('public')->delete($oldFile);
            }

            $file = $request->file($fieldName);
            $filename = $fieldName . '-' . time() . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('site-settings', $filename, 'public');

            SystemSetting::updateOrCreate(
                ['key' => $fieldName],
                [
                    'value' => $filePath,
                    'type' => 'text',
                    'group' => $group,
                ]
            );
        }
    }

    /**
     * Get the full URL for a file setting.
     */
    private function getFileUrl(string $key): ?string
    {
        $filePath = SystemSetting::get($key);

        if ($filePath && Storage::disk('public')->exists($filePath)) {
            return asset('storage/' . $filePath);
        }

        return null;
    }
}
