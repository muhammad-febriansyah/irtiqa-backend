<?php

namespace App\Services;

use App\Models\OtpVerification;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Exception;

class OtpService
{
    /**
     * Generate 6-digit OTP code
     */
    public function generateOtpCode(): string
    {
        return str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Create and send OTP
     *
     * @param string $identifier  Unique key for OTP record (email)
     * @param string $type        Delivery channel: 'email' or 'whatsapp'
     * @param string $purpose     OTP purpose
     * @param string|null $recipient  Actual delivery target (phone for WhatsApp). Defaults to $identifier.
     */
    public function sendOtp(
        string $identifier,
        string $type = 'email',
        string $purpose = 'registration',
        ?string $recipient = null
    ): array {
        try {
            OtpVerification::where('identifier', $identifier)
                ->where('purpose', $purpose)
                ->where('type', $type)
                ->delete();

            $otpCode = $this->generateOtpCode();

            $otp = OtpVerification::create([
                'identifier' => $identifier,
                'otp_code' => $otpCode,
                'type' => $type,
                'purpose' => $purpose,
                'expires_at' => now()->addMinutes(10), // 10 minutes expiry (extended for better UX)
                'attempts' => 0,
                'is_used' => false,
            ]);

            $target = $recipient ?? $identifier;

            if ($type === 'email') {
                $sent = $this->sendOtpViaEmail($target, $otpCode, $purpose);
            } else {
                $sent = $this->sendOtpViaWhatsApp($target, $otpCode, $purpose);
            }

            if (!$sent) {
                throw new Exception('Failed to send OTP');
            }

            return [
                'success' => true,
                'message' => 'OTP sent successfully',
                'expires_at' => $otp->expires_at->toISOString(),
            ];
        } catch (Exception $e) {
            Log::error('OTP Send Error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Failed to send OTP. Please try again.',
            ];
        }
    }

    /**
     * Send OTP to multiple channels (email and WhatsApp) with same code
     */
    public function sendOtpMultiChannel(
        string $identifier,
        string $phone,
        string $purpose = 'registration'
    ): array {
        try {
            // Delete ALL old OTPs for this identifier and purpose
            OtpVerification::where('identifier', $identifier)
                ->where('purpose', $purpose)
                ->delete();

            // Generate OTP code ONCE
            $otpCode = $this->generateOtpCode();

            // Create OTP record (single record for both channels)
            $otp = OtpVerification::create([
                'identifier' => $identifier,
                'otp_code' => $otpCode,
                'type' => 'email', // Primary type
                'purpose' => $purpose,
                'expires_at' => now()->addMinutes(10),
                'attempts' => 0,
                'is_used' => false,
            ]);

            $sentVia = [];

            // Send via Email
            $emailSent = $this->sendOtpViaEmail($identifier, $otpCode, $purpose);
            if ($emailSent) {
                $sentVia[] = 'email';
            }

            // Send via WhatsApp (same code)
            $whatsappSent = $this->sendOtpViaWhatsApp($phone, $otpCode, $purpose);
            if ($whatsappSent) {
                $sentVia[] = 'whatsapp';
            }

            // If both failed
            if (empty($sentVia)) {
                throw new Exception('Failed to send OTP via any channel');
            }

            return [
                'success' => true,
                'message' => 'Kode OTP telah dikirim ke ' . implode(' dan ', $sentVia),
                'sent_via' => $sentVia,
                'expires_at' => $otp->expires_at->toISOString(),
            ];
        } catch (Exception $e) {
            Log::error('OTP Multi-Channel Send Error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Gagal mengirim OTP. Silakan coba lagi.',
                'sent_via' => [],
            ];
        }
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(
        string $identifier,
        string $otpCode,
        string $purpose = 'registration'
    ): array {
        // Debug: Check all OTPs for this identifier
        $allOtps = OtpVerification::where('identifier', $identifier)
            ->where('purpose', $purpose)
            ->get();

        Log::info('OTP Verification Debug', [
            'identifier' => $identifier,
            'otp_code_received' => $otpCode,
            'purpose' => $purpose,
            'total_otps_found' => $allOtps->count(),
            'current_time' => now()->toISOString(),
        ]);

        foreach ($allOtps as $otpRecord) {
            Log::info('OTP Record Found', [
                'id' => $otpRecord->id,
                'code' => $otpRecord->otp_code,
                'type' => $otpRecord->type,
                'created_at' => $otpRecord->created_at->toISOString(),
                'expires_at' => $otpRecord->expires_at->toISOString(),
                'is_expired' => $otpRecord->isExpired(),
                'is_used' => $otpRecord->is_used,
                'attempts' => $otpRecord->attempts,
                'is_valid' => $otpRecord->isValid(),
            ]);
        }

        $otp = OtpVerification::where('identifier', $identifier)
            ->where('otp_code', $otpCode)
            ->where('purpose', $purpose)
            ->active()
            ->first();

        if (!$otp) {
            Log::warning('OTP Not Found or Invalid', [
                'identifier' => $identifier,
                'otp_code' => $otpCode,
                'purpose' => $purpose,
            ]);

            return [
                'success' => false,
                'message' => 'Invalid or expired OTP code',
            ];
        }

        $otp->incrementAttempts();

        if (!$otp->isValid()) {
            return [
                'success' => false,
                'message' => 'OTP has expired or exceeded maximum attempts',
            ];
        }

        $otp->markAsVerified();

        return [
            'success' => true,
            'message' => 'OTP verified successfully',
        ];
    }

    /**
     * Send OTP via Email (using Mailketing or SMTP)
     */
    private function sendOtpViaEmail(string $email, string $otpCode, string $purpose): bool
    {
        try {
            $appName = SystemSetting::get('app_name', config('app.name'));
            $mailApiKey = SystemSetting::get('mail_api_key');

            $purposeMessage = match ($purpose) {
                'registration' => 'untuk menyelesaikan pendaftaran akun',
                'login' => 'untuk login ke akun Anda',
                'forgot_password' => 'untuk reset password',
                default => 'untuk verifikasi',
            };

            $subject = "Kode OTP Verifikasi - {$appName}";
            $message = $this->getEmailTemplate($otpCode, $purposeMessage, $appName);

            if ($mailApiKey) {
                return $this->sendViaMailketing($email, $subject, $message, $mailApiKey);
            }

            Mail::html($message, function ($mail) use ($email, $subject) {
                $mail->to($email)
                    ->subject($subject);
            });

            return true;
        } catch (Exception $e) {
            Log::error('Email OTP Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send OTP via WhatsApp Gateway (Notifwabiz)
     */
    private function sendOtpViaWhatsApp(string $phone, string $otpCode, string $purpose): bool
    {
        try {
            $whatsappApiKey = SystemSetting::get('whatsapp_api_key');
            $whatsappSender = SystemSetting::get('whatsapp_sender'); // Sender number/ID
            $appName = SystemSetting::get('app_name', config('app.name'));

            if (!$whatsappApiKey || !$whatsappSender) {
                Log::warning('WhatsApp API key or sender not configured', [
                    'has_api_key' => !empty($whatsappApiKey),
                    'has_sender' => !empty($whatsappSender),
                ]);
                return false;
            }

            $purposeMessage = match ($purpose) {
                'registration' => 'menyelesaikan pendaftaran',
                'login' => 'login',
                'forgot_password' => 'reset password',
                default => 'verifikasi',
            };

            $phone = preg_replace('/[^0-9]/', '', $phone);
            if (!str_starts_with($phone, '62')) {
                $phone = '62' . ltrim($phone, '0');
            }

            $message = "*{$appName}* - Pendampingan Psiko-Spiritual Islami\n\n"
                . "*Kode OTP Verifikasi*\n\n"
                . "Kode OTP Anda: *{$otpCode}*\n\n"
                . "Gunakan kode ini untuk {$purposeMessage}.\n\n"
                . "Berlaku selama 10 menit\n"
                . "Jangan berikan kode ini kepada siapapun\n\n"
                . "_Abaikan pesan ini jika Anda tidak merasa meminta OTP_";

            $params = [
                'api_key' => $whatsappApiKey,
                'sender' => $whatsappSender,
                'number' => $phone,
                'message' => $message,
            ];

            $apiUrl = config('services.whatsapp.api_url', 'https://m2.notifwabiz.my.id/send-message');
            $response = Http::timeout(30)->get($apiUrl, $params);

            Log::info('WhatsApp API Request', [
                'url' => $apiUrl,
                'sender' => $whatsappSender,
                'recipient' => $phone,
            ]);

            if (!$response->successful()) {
                Log::error('Notifwabiz Error Response', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }

            return $response->successful();
        } catch (Exception $e) {
            Log::error('WhatsApp OTP Error: ' . $e->getMessage(), [
                'phone' => $phone ?? null,
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    /**
     * Send via Mailketing API
     *
     * Docs: https://mailketing.co.id/docs/send-email-via-api/
     */
    private function sendViaMailketing(string $email, string $subject, string $message, string $apiKey): bool
    {
        try {
            $fromEmail = SystemSetting::get('mail_from_address', config('mail.from.address'));
            $fromName = SystemSetting::get('mail_from_name', config('mail.from.name'));

            $endpoint = 'https://api.mailketing.co.id/api/v1/send';

            $response = Http::timeout(30)
                ->asForm()
                ->post($endpoint, [
                    'api_token' => $apiKey,
                    'from_name' => $fromName,
                    'from_email' => $fromEmail,
                    'recipient' => $email,
                    'subject' => $subject,
                    'content' => $message,
                ]);

            if (!$response->successful()) {
                Log::error('Mailketing API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'email' => $email,
                ]);
            }

            return $response->successful();
        } catch (Exception $e) {
            Log::error('Mailketing Exception: ' . $e->getMessage(), [
                'email' => $email,
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    /**
     * Get email template for OTP
     */
    private function getEmailTemplate(string $otpCode, string $purposeMessage, string $appName): string
    {
        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #2D5A27 0%, #3a7030 100%); padding: 30px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
                .content { padding: 40px 30px; }
                .otp-box { background: #f8faf9; border: 2px dashed #2D5A27; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0; }
                .otp-code { font-size: 36px; font-weight: bold; color: #2D5A27; letter-spacing: 8px; margin: 10px 0; }
                .info-box { background: #fff8e1; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
                .footer { background: #f8faf9; padding: 20px; text-align: center; color: #666; font-size: 12px; }
                .warning { color: #dc2626; font-weight: 500; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{$appName}</h1>
                    <p style="color: #e5e7eb; margin: 10px 0 0 0;">Pendampingan Psiko-Spiritual Islami</p>
                </div>

                <div class="content">
                    <h2 style="color: #2D5A27; margin-top: 0;">Kode Verifikasi OTP</h2>
                    <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
                        Assalamu'alaikum,<br><br>
                        Gunakan kode OTP berikut {$purposeMessage}:
                    </p>

                    <div class="otp-box">
                        <p style="margin: 0; color: #6b7280; font-size: 14px;">Kode OTP Anda</p>
                        <div class="otp-code">{$otpCode}</div>
                        <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 13px;">Berlaku selama 10 menit</p>
                    </div>

                    <div class="info-box">
                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                            <strong>Keamanan Penting:</strong><br>
                            Jangan bagikan kode ini kepada siapapun, termasuk tim {$appName}.
                            Kami tidak akan pernah meminta kode OTP Anda.
                        </p>
                    </div>

                    <p class="warning" style="font-size: 14px; text-align: center;">
                        Abaikan email ini jika Anda tidak merasa meminta kode OTP.
                    </p>
                </div>

                <div class="footer">
                    <p style="margin: 0;">© 2026 {$appName}. All rights reserved.</p>
                    <p style="margin: 10px 0 0 0;">Email otomatis, mohon tidak membalas.</p>
                </div>
            </div>
        </body>
        </html>
        HTML;
    }
}
