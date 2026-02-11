<?php

namespace App\Notifications\Client;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class RatingRequestNotification extends Notification implements ShouldQueue
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
            'message' => "*{$appName}* - Feedback & Rating\n\n" .
                "Assalamu'alaikum {$notifiable->name},\n\n" .
                "⭐ Bagaimana pengalaman Anda dengan sesi konsultasi?\n\n" .
                "👤 Konsultan: {$consultant->user->name}\n" .
                "🎫 No. Tiket: {$this->consultation->ticket_number}\n\n" .
                "Feedback Anda sangat berharga untuk kami meningkatkan kualitas layanan.\n\n" .
                "Terima kasih atas partisipasinya!\n\n" .
                "Barakallahu fiikum 🌙"
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'rating_request',
            'consultation_id' => $this->consultation->id,
            'ticket_number' => $this->consultation->ticket_number,
            'consultant_name' => $this->consultation->consultant->user->name,
            'message' => 'Berikan rating untuk sesi konsultasi Anda',
            'url' => '/consultations/' . $this->consultation->id . '/rate',
        ];
    }
}
