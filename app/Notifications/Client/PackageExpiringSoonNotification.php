<?php

namespace App\Notifications\Client;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class PackageExpiringSoonNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $packageName;
    protected $expiresAt;
    protected $daysLeft;

    public function __construct(string $packageName, $expiresAt, int $daysLeft)
    {
        $this->packageName = $packageName;
        $this->expiresAt = $expiresAt;
        $this->daysLeft = $daysLeft;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'whatsapp', 'mailketing'];
    }

    public function toWhatsApp(object $notifiable): array
    {
        $appName = \App\Models\SystemSetting::get('app_name', config('app.name'));
        $expiryDate = \Carbon\Carbon::parse($this->expiresAt)->format('d F Y');

        return [
            'phone' => $notifiable->profile->phone ?? $notifiable->phone,
            'message' => "*{$appName}* - Pengingat Paket\n\n" .
                "Assalamu'alaikum {$notifiable->name},\n\n" .
                "⚠️ Masa aktif paket Anda akan segera berakhir!\n\n" .
                "📦 Paket: {$this->packageName}\n" .
                "⏰ Berakhir: {$expiryDate}\n" .
                "📅 Sisa: {$this->daysLeft} hari lagi\n\n" .
                "Jangan lewatkan kesempatan untuk melanjutkan konsultasi Anda. Perpanjang sekarang!\n\n" .
                "Barakallahu fiikum 🌙"
        ];
    }

    public function toMail(object $notifiable): array
    {
        $expiryDate = \Carbon\Carbon::parse($this->expiresAt)->format('d F Y');

        return [
            'subject' => 'Paket Akan Berakhir - Irtiqa',
            'greeting' => "Assalamu'alaikum {$notifiable->name},",
            'intro' => '<p>⚠️ Masa aktif paket konsultasi Anda akan segera berakhir!</p>',
            'body' => "<p><strong>Detail Paket:</strong></p>" .
                "<ul>" .
                "<li>Paket: {$this->packageName}</li>" .
                "<li>Berakhir pada: {$expiryDate}</li>" .
                "<li>Sisa waktu: <strong>{$this->daysLeft} hari</strong></li>" .
                "</ul>" .
                "<p>Jangan lewatkan kesempatan untuk melanjutkan perjalanan konsultasi Anda.</p>",
            'outro' => '<p>Perpanjang paket sekarang untuk terus mendapat pendampingan dari tim konsultan kami.</p>' .
                '<p>Barakallahu fiikum 🌙</p>',
            'actionText' => 'Perpanjang Paket',
            'actionUrl' => url('/packages'),
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'package_expiring_soon',
            'package_name' => $this->packageName,
            'expires_at' => $this->expiresAt,
            'days_left' => $this->daysLeft,
            'message' => "Paket {$this->packageName} akan berakhir dalam {$this->daysLeft} hari",
            'url' => '/packages',
        ];
    }
}
