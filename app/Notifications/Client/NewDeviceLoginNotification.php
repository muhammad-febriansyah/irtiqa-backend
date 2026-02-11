<?php

namespace App\Notifications\Client;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class NewDeviceLoginNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $deviceName;
    protected string $ipAddress;
    protected string $location;
    protected $loginAt;

    public function __construct(string $deviceName, string $ipAddress, string $location, $loginAt)
    {
        $this->deviceName = $deviceName;
        $this->ipAddress = $ipAddress;
        $this->location = $location;
        $this->loginAt = $loginAt;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'whatsapp', 'mailketing'];
    }

    public function toWhatsApp(object $notifiable): array
    {
        $appName = \App\Models\SystemSetting::get('app_name', config('app.name'));
        $loginTime = \Carbon\Carbon::parse($this->loginAt)->format('d F Y, H:i');

        return [
            'phone' => $notifiable->profile->phone ?? $notifiable->phone,
            'message' => "*{$appName}* - Login Device Baru\n\n" .
                "Assalamu'alaikum {$notifiable->name},\n\n" .
                "🔐 Terdeteksi login dari device baru:\n\n" .
                "📱 Device: {$this->deviceName}\n" .
                "🌍 Lokasi: {$this->location}\n" .
                "🕐 Waktu: {$loginTime}\n" .
                "📍 IP: {$this->ipAddress}\n\n" .
                "Jika ini bukan Anda, segera ubah password dan hubungi kami.\n\n" .
                "Barakallahu fiikum 🌙"
        ];
    }

    public function toMail(object $notifiable): array
    {
        $loginTime = \Carbon\Carbon::parse($this->loginAt)->format('d F Y, H:i');

        return [
            'subject' => 'Login dari Device Baru - Irtiqa',
            'greeting' => "Assalamu'alaikum {$notifiable->name},",
            'intro' => '<p>🔐 Kami mendeteksi login ke akun Anda dari device baru.</p>',
            'body' => "<p><strong>Detail Login:</strong></p>" .
                "<ul>" .
                "<li>Device: {$this->deviceName}</li>" .
                "<li>Lokasi: {$this->location}</li>" .
                "<li>Waktu: {$loginTime}</li>" .
                "<li>IP Address: {$this->ipAddress}</li>" .
                "</ul>" .
                "<p><strong style='color:#dc2626;'>⚠️ Jika ini bukan Anda:</strong></p>" .
                "<ul>" .
                "<li>Segera ubah password akun Anda</li>" .
                "<li>Hubungi tim support kami</li>" .
                "<li>Periksa aktivitas akun Anda</li>" .
                "</ul>",
            'outro' => '<p>Keamanan akun Anda adalah prioritas kami.</p>' .
                '<p>Barakallahu fiikum 🌙</p>',
            'actionText' => 'Ubah Password',
            'actionUrl' => url('/settings/security'),
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_device_login',
            'device_name' => $this->deviceName,
            'ip_address' => $this->ipAddress,
            'location' => $this->location,
            'login_at' => $this->loginAt,
            'message' => 'Login dari device baru terdeteksi',
            'url' => '/settings/security',
        ];
    }
}
