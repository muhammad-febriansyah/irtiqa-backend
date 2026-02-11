<?php

namespace App\Notifications\Client;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class PackageExpiredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $packageName;
    protected $expiredAt;

    public function __construct(string $packageName, $expiredAt)
    {
        $this->packageName = $packageName;
        $this->expiredAt = $expiredAt;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'whatsapp', 'mailketing'];
    }

    public function toWhatsApp(object $notifiable): array
    {
        $appName = \App\Models\SystemSetting::get('app_name', config('app.name'));

        return [
            'phone' => $notifiable->profile->phone ?? $notifiable->phone,
            'message' => "*{$appName}* - Paket Berakhir\n\n" .
                "Assalamu'alaikum {$notifiable->name},\n\n" .
                "📋 Masa aktif paket Anda telah berakhir.\n\n" .
                "📦 Paket: {$this->packageName}\n\n" .
                "Untuk melanjutkan konsultasi, silakan perpanjang atau pilih paket baru yang sesuai dengan kebutuhan Anda.\n\n" .
                "Terima kasih telah mempercayai kami sebagai bagian dari perjalanan Anda.\n\n" .
                "Barakallahu fiikum 🌙"
        ];
    }

    public function toMail(object $notifiable): array
    {
        return [
            'subject' => 'Paket Telah Berakhir - Irtiqa',
            'greeting' => "Assalamu'alaikum {$notifiable->name},",
            'intro' => '<p>Masa aktif paket konsultasi Anda telah berakhir.</p>',
            'body' => "<p><strong>Paket:</strong> {$this->packageName}</p>" .
                "<p>Untuk melanjutkan konsultasi dan mendapat pendampingan dari tim konsultan kami, silakan perpanjang atau pilih paket baru.</p>",
            'outro' => '<p>Terima kasih telah mempercayai kami sebagai bagian dari perjalanan spiritual Anda.</p>' .
                '<p>Barakallahu fiikum 🌙</p>',
            'actionText' => 'Lihat Paket',
            'actionUrl' => url('/packages'),
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'package_expired',
            'package_name' => $this->packageName,
            'expired_at' => $this->expiredAt,
            'message' => "Paket {$this->packageName} telah berakhir",
            'url' => '/packages',
        ];
    }
}
