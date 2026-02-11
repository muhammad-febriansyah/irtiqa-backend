<?php

namespace App\Notifications\Client;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class SessionCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Consultation $consultation;

    public function __construct(Consultation $consultation)
    {
        $this->consultation = $consultation;
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
            'message' => "*{$appName}* - Sesi Selesai\n\n" .
                "Assalamu'alaikum {$notifiable->name},\n\n" .
                "✅ Sesi konsultasi Anda telah selesai.\n\n" .
                "👤 Konsultan: {$consultant->user->name}\n" .
                "🎫 No. Tiket: {$this->consultation->ticket_number}\n\n" .
                "Terima kasih telah mempercayai kami. Semoga sesi ini membawa manfaat dan keberkahan.\n\n" .
                "📝 Mohon luangkan waktu untuk memberikan rating dan feedback.\n\n" .
                "Barakallahu fiikum 🌙"
        ];
    }

    public function toMail(object $notifiable): array
    {
        $consultant = $this->consultation->consultant;

        return [
            'subject' => 'Sesi Konsultasi Selesai - Irtiqa',
            'greeting' => "Assalamu'alaikum {$notifiable->name},",
            'intro' => '<p>✅ Sesi konsultasi Anda telah selesai.</p>',
            'body' => "<p><strong>Detail Sesi:</strong></p>" .
                "<ul>" .
                "<li>Konsultan: {$consultant->user->name}</li>" .
                "<li>No. Tiket: {$this->consultation->ticket_number}</li>" .
                "</ul>" .
                "<p>Terima kasih telah mempercayai kami. Semoga sesi ini membawa manfaat dan keberkahan bagi perjalanan Anda.</p>",
            'outro' => '<p>Mohon luangkan waktu sejenak untuk memberikan rating dan feedback tentang sesi konsultasi Anda.</p>' .
                '<p>Barakallahu fiikum 🌙</p>',
            'actionText' => 'Berikan Rating',
            'actionUrl' => url('/consultations/' . $this->consultation->id . '/rate'),
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'session_completed',
            'consultation_id' => $this->consultation->id,
            'ticket_number' => $this->consultation->ticket_number,
            'consultant_name' => $this->consultation->consultant->user->name,
            'message' => 'Sesi konsultasi telah selesai',
            'url' => '/consultations/' . $this->consultation->id,
        ];
    }
}
