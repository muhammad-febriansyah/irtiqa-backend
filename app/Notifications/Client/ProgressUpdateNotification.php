<?php

namespace App\Notifications\Client;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue::ShouldQueue;
use Illuminate\Notifications\Notification;

class ProgressUpdateNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Consultation $consultation;
    protected string $updateMessage;

    public function __construct(Consultation $consultation, string $updateMessage)
    {
        $this->consultation = $consultation;
        $this->updateMessage = $updateMessage;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'whatsapp', 'mailketing'];
    }

    public function toWhatsApp(object $notifiable): array
    {
        $appName = \App\Models\SystemSetting::get('app_name', config('app.name'));
        $consultant = $this->consultation->consultant;

        return [
            'phone' => $notifiable->profile->phone ?? $notifiable->phone,
            'message' => "*{$appName}* - Update Progress\n\n" .
                "Assalamu'alaikum {$notifiable->name},\n\n" .
                "📊 Konsultan Anda memberikan update progress:\n\n" .
                "👤 Konsultan: {$consultant->user->name}\n" .
                "📝 Update:\n{$this->updateMessage}\n\n" .
                "Terus semangat dalam perjalanan Anda!\n\n" .
                "Barakallahu fiikum 🌙"
        ];
    }

    public function toMail(object $notifiable): array
    {
        $consultant = $this->consultation->consultant;

        return [
            'subject' => 'Update Progress Pembimbingan - Irtiqa',
            'greeting' => "Assalamu'alaikum {$notifiable->name},",
            'intro' => '<p>📊 Konsultan Anda memberikan update tentang progress pembimbingan Anda.</p>',
            'body' => "<p><strong>Dari Konsultan:</strong> {$consultant->user->name}</p>" .
                "<div style='background:#f8faf9;padding:15px;border-left:4px solid #2D5A27;margin:20px 0;'>" .
                $this->updateMessage .
                "</div>",
            'outro' => '<p>Terus semangat dalam perjalanan spiritual Anda!</p>' .
                '<p>Barakallahu fiikum 🌙</p>',
            'actionText' => 'Lihat Detail',
            'actionUrl' => url('/consultations/' . $this->consultation->id),
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'progress_update',
            'consultation_id' => $this->consultation->id,
            'consultant_name' => $this->consultation->consultant->user->name,
            'update_message' => $this->updateMessage,
            'message' => 'Konsultan memberikan update progress',
            'url' => '/consultations/' . $this->consultation->id,
        ];
    }
}
