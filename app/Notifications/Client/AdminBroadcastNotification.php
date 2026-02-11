<?php

namespace App\Notifications\Client;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AdminBroadcastNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $title;
    protected string $message;
    protected ?string $actionUrl;
    protected ?string $actionText;

    public function __construct(
        string $title,
        string $message,
        ?string $actionUrl = null,
        ?string $actionText = null
    ) {
        $this->title = $title;
        $this->message = $message;
        $this->actionUrl = $actionUrl;
        $this->actionText = $actionText;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'whatsapp', 'mailketing'];
    }

    public function toWhatsApp(object $notifiable): array
    {
        $appName = \App\Models\SystemSetting::get('app_name', config('app.name'));

        $whatsappMessage = "*{$appName}* - Pengumuman\n\n" .
            "Assalamu'alaikum {$notifiable->name},\n\n" .
            "📢 *{$this->title}*\n\n" .
            "{$this->message}\n\n";

        if ($this->actionUrl && $this->actionText) {
            $whatsappMessage .= "🔗 {$this->actionText}: {$this->actionUrl}\n\n";
        }

        $whatsappMessage .= "Barakallahu fiikum 🌙";

        return [
            'phone' => $notifiable->profile->phone ?? $notifiable->phone,
            'message' => $whatsappMessage
        ];
    }

    public function toMail(object $notifiable): array
    {
        return [
            'subject' => $this->title . ' - Irtiqa',
            'greeting' => "Assalamu'alaikum {$notifiable->name},",
            'intro' => '<p>📢 <strong>' . $this->title . '</strong></p>',
            'body' => '<div style="background:#f8faf9;padding:20px;border-left:4px solid #2D5A27;margin:20px 0;">' .
                nl2br(e($this->message)) .
                '</div>',
            'outro' => '<p>Terima kasih atas perhatian Anda.</p>' .
                '<p>Barakallahu fiikum 🌙</p>',
            'actionText' => $this->actionText,
            'actionUrl' => $this->actionUrl,
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'admin_broadcast',
            'title' => $this->title,
            'message' => $this->message,
            'action_url' => $this->actionUrl,
            'action_text' => $this->actionText,
            'url' => $this->actionUrl,
        ];
    }
}
