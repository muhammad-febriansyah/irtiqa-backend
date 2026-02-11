<?php

namespace App\Notifications\Client;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class SessionStartingNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Consultation $consultation;

    public function __construct(Consultation $consultation)
    {
        $this->consultation = $consultation;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'whatsapp'];
    }

    public function toWhatsApp(object $notifiable): array
    {
        $appName = \App\Models\SystemSetting::get('app_name', config('app.name'));
        $consultant = $this->consultation->consultant;

        return [
            'phone' => $notifiable->profile->phone ?? $notifiable->phone,
            'message' => "*{$appName}* - Sesi Dimulai\n\n" .
                "Assalamu'alaikum {$notifiable->name},\n\n" .
                "🚀 Sesi konsultasi Anda akan dimulai dalam 15 menit!\n\n" .
                "👤 Konsultan: {$consultant->user->name}\n" .
                "🎫 No. Tiket: {$this->consultation->ticket_number}\n\n" .
                "Silakan bersiap dan masuk ke ruang konsultasi.\n\n" .
                "Barakallahu fiikum 🌙"
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'session_starting',
            'consultation_id' => $this->consultation->id,
            'ticket_number' => $this->consultation->ticket_number,
            'consultant_name' => $this->consultation->consultant->user->name,
            'message' => 'Sesi konsultasi akan dimulai dalam 15 menit',
            'url' => '/consultations/' . $this->consultation->id,
        ];
    }
}
