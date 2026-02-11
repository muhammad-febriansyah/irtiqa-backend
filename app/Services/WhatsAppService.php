<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * WhatsApp Service - NotifWaBiz Integration
 *
 * API Docs: https://m2.notifwabiz.my.id/
 */
class WhatsAppService
{
    private string $apiUrl;
    private ?string $apiKey;
    private ?string $sender;

    public function __construct()
    {
        $this->apiUrl = config('services.whatsapp.api_url', 'https://m2.notifwabiz.my.id/send-message');
        $this->apiKey = SystemSetting::get('whatsapp_api_key');
        $this->sender = SystemSetting::get('whatsapp_sender');
    }

    /**
     * Check if WhatsApp is configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey) && !empty($this->sender);
    }

    /**
     * Send WhatsApp message
     *
     * @param string $phone Phone number (e.g., 628123456789)
     * @param string $message Message content
     * @return array Response with success status
     */
    public function sendMessage(string $phone, string $message): array
    {
        try {
            if (!$this->isConfigured()) {
                return [
                    'success' => false,
                    'message' => 'WhatsApp gateway not configured. Please set API key and sender number in settings.',
                ];
            }

            $phone = $this->formatPhoneNumber($phone);

            $params = [
                'api_key' => $this->apiKey,
                'sender' => $this->sender,
                'number' => $phone,
                'message' => $message,
            ];

            $response = Http::timeout(30)->get($this->apiUrl, $params);

            Log::info('WhatsApp Message Sent', [
                'recipient' => $phone,
                'status' => $response->status(),
                'sender' => $this->sender,
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'WhatsApp message sent successfully',
                    'response' => $response->json(),
                ];
            }

            Log::error('WhatsApp API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
                'recipient' => $phone,
            ]);

            return [
                'success' => false,
                'message' => 'Failed to send WhatsApp message',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('WhatsApp Service Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'recipient' => $phone ?? null,
            ]);

            return [
                'success' => false,
                'message' => 'An error occurred while sending WhatsApp message',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Format phone number to international format (62xxx)
     *
     * @param string $phone
     * @return string
     */
    private function formatPhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        $phone = ltrim($phone, '0');

        if (!str_starts_with($phone, '62')) {
            $phone = '62' . $phone;
        }

        return $phone;
    }

    /**
     * Send OTP via WhatsApp
     *
     * @param string $phone
     * @param string $otpCode
     * @param string $purpose
     * @return array
     */
    public function sendOtp(string $phone, string $otpCode, string $purpose = 'verification'): array
    {
        $appName = SystemSetting::get('app_name', config('app.name'));

        $purposeMessage = match ($purpose) {
            'registration' => 'menyelesaikan pendaftaran',
            'login' => 'login',
            'forgot_password' => 'reset password',
            default => 'verifikasi',
        };

        $message = "*{$appName}* - Pendampingan Psiko-Spiritual Islami\n\n"
            . "🔐 *Kode OTP Verifikasi*\n\n"
            . "Kode OTP Anda: *{$otpCode}*\n\n"
            . "Gunakan kode ini untuk {$purposeMessage}.\n\n"
            . "⏰ Berlaku selama 5 menit\n"
            . "🔒 Jangan berikan kode ini kepada siapapun\n\n"
            . "_Abaikan pesan ini jika Anda tidak merasa meminta OTP_";

        return $this->sendMessage($phone, $message);
    }

    /**
     * Send consultation reminder
     *
     * @param string $phone
     * @param string $userName
     * @param string $consultantName
     * @param string $scheduledAt
     * @return array
     */
    public function sendConsultationReminder(
        string $phone,
        string $userName,
        string $consultantName,
        string $scheduledAt
    ): array {
        $appName = SystemSetting::get('app_name', config('app.name'));

        $message = "*{$appName}* - Pengingat Konsultasi\n\n"
            . "Assalamu'alaikum {$userName},\n\n"
            . "🗓️ Anda memiliki jadwal konsultasi:\n\n"
            . "👤 Konsultan: *{$consultantName}*\n"
            . "📅 Waktu: *{$scheduledAt}*\n\n"
            . "Pastikan Anda sudah siap untuk sesi konsultasi.\n\n"
            . "Barakallahu fiikum 🌙";

        return $this->sendMessage($phone, $message);
    }

    /**
     * Send payment confirmation
     *
     * @param string $phone
     * @param string $userName
     * @param string $amount
     * @param string $transactionId
     * @return array
     */
    public function sendPaymentConfirmation(
        string $phone,
        string $userName,
        string $amount,
        string $transactionId
    ): array {
        $appName = SystemSetting::get('app_name', config('app.name'));

        $message = "*{$appName}* - Konfirmasi Pembayaran\n\n"
            . "Assalamu'alaikum {$userName},\n\n"
            . "✅ Pembayaran Anda telah diterima!\n\n"
            . "💰 Jumlah: Rp {$amount}\n"
            . "🔖 ID Transaksi: {$transactionId}\n\n"
            . "Terima kasih atas kepercayaan Anda.\n\n"
            . "Barakallahu fiikum 🌙";

        return $this->sendMessage($phone, $message);
    }

    /**
     * Send ticket assignment notification
     *
     * @param string $phone
     * @param string $consultantName
     * @param string $ticketNumber
     * @return array
     */
    public function sendTicketAssignment(
        string $phone,
        string $consultantName,
        string $ticketNumber
    ): array {
        $appName = SystemSetting::get('app_name', config('app.name'));

        $message = "*{$appName}* - Tiket Konsultasi Baru\n\n"
            . "Assalamu'alaikum {$consultantName},\n\n"
            . "📋 Anda mendapat tiket konsultasi baru!\n\n"
            . "🎫 Nomor Tiket: *{$ticketNumber}*\n\n"
            . "Silakan cek dashboard untuk detail lengkap.\n\n"
            . "Barakallahu fiikum 🌙";

        return $this->sendMessage($phone, $message);
    }

    /**
     * Test WhatsApp connection
     *
     * @param string $phone
     * @return array
     */
    public function testConnection(string $phone): array
    {
        $appName = SystemSetting::get('app_name', config('app.name'));

        $message = "*{$appName}* - Test Koneksi\n\n"
            . "✅ WhatsApp Gateway berhasil terhubung!\n\n"
            . "Pesan ini adalah test koneksi dari sistem.\n\n"
            . "Timestamp: " . now()->format('d/m/Y H:i:s');

        return $this->sendMessage($phone, $message);
    }
}
