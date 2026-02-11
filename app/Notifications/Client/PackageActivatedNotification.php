<?php

namespace App\Notifications\Client;

use App\Models\Package;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class PackageActivatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Package $package;
    protected $expiresAt;

    public function __construct(Package $package, $expiresAt)
    {
        $this->package = $package;
        $this->expiresAt = $expiresAt;
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
            'message' => "*{$appName}* - Paket Aktif\n\n" .
                "Assalamu'alaikum {$notifiable->name},\n\n" .
                "🎉 Selamat! Paket Anda telah aktif!\n\n" .
                "📦 Paket: *{$this->package->name}*\n" .
                "⏰ Masa Aktif: Hingga {$expiryDate}\n" .
                "💬 Sesi: {$this->package->session_count} sesi konsultasi\n\n" .
                "Anda sekarang dapat memulai konsultasi dengan tim konsultan kami.\n\n" .
                "Barakallahu fiikum 🌙"
        ];
    }

    public function toMail(object $notifiable): array
    {
        $expiryDate = \Carbon\Carbon::parse($this->expiresAt)->format('d F Y');

        return [
            'subject' => 'Paket Anda Telah Aktif - Irtiqa',
            'greeting' => "Assalamu'alaikum {$notifiable->name},",
            'intro' => '<p>🎉 Selamat! Paket konsultasi Anda telah aktif!</p>',
            'body' => "<p><strong>Detail Paket:</strong></p>" .
                "<ul>" .
                "<li>Nama Paket: <strong>{$this->package->name}</strong></li>" .
                "<li>Jumlah Sesi: {$this->package->session_count} sesi</li>" .
                "<li>Masa Aktif: Hingga {$expiryDate}</li>" .
                "</ul>",
            'outro' => '<p>Anda sekarang dapat memulai konsultasi dengan tim konsultan kami. Semoga perjalanan Anda membawa keberkahan.</p>' .
                '<p>Barakallahu fiikum 🌙</p>',
            'actionText' => 'Mulai Konsultasi',
            'actionUrl' => url('/consultations/create'),
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'package_activated',
            'package_id' => $this->package->id,
            'package_name' => $this->package->name,
            'expires_at' => $this->expiresAt,
            'message' => 'Paket ' . $this->package->name . ' telah aktif',
            'url' => '/packages',
        ];
    }
}
