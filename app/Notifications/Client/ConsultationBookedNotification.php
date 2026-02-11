<?php

namespace App\Notifications\Client;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ConsultationBookedNotification extends Notification implements ShouldQueue
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
        $scheduledAt = \Carbon\Carbon::parse($this->consultation->scheduled_at)->format('d F Y, H:i');

        return [
            'phone' => $notifiable->profile->phone ?? $notifiable->phone,
            'message' => "*{$appName}* - Booking Konsultasi\n\n" .
                "Assalamu'alaikum {$notifiable->name},\n\n" .
                "✅ Booking konsultasi Anda berhasil dibuat!\n\n" .
                "👤 Konsultan: {$consultant->user->name}\n" .
                "📅 Jadwal: {$scheduledAt}\n" .
                "🎫 No. Tiket: {$this->consultation->ticket_number}\n" .
                "📋 Status: Menunggu konfirmasi konsultan\n\n" .
                "Kami akan memberitahu Anda setelah konsultan mengkonfirmasi jadwal.\n\n" .
                "Barakallahu fiikum 🌙"
        ];
    }

    public function toMail(object $notifiable): array
    {
        $consultant = $this->consultation->consultant;
        $scheduledAt = \Carbon\Carbon::parse($this->consultation->scheduled_at)->format('d F Y, H:i');

        return [
            'subject' => 'Booking Konsultasi Berhasil - Irtiqa',
            'greeting' => "Assalamu'alaikum {$notifiable->name},",
            'intro' => '<p>✅ Booking konsultasi Anda berhasil dibuat!</p>',
            'body' => "<p><strong>Detail Konsultasi:</strong></p>" .
                "<ul>" .
                "<li>Konsultan: {$consultant->user->name}</li>" .
                "<li>Jadwal: {$scheduledAt}</li>" .
                "<li>No. Tiket: {$this->consultation->ticket_number}</li>" .
                "<li>Status: Menunggu konfirmasi</li>" .
                "</ul>",
            'outro' => '<p>Kami akan memberitahu Anda setelah konsultan mengkonfirmasi jadwal. Terima kasih atas kepercayaan Anda.</p>' .
                '<p>Barakallahu fiikum 🌙</p>',
            'actionText' => 'Lihat Detail',
            'actionUrl' => url('/consultations/' . $this->consultation->id),
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'consultation_booked',
            'consultation_id' => $this->consultation->id,
            'ticket_number' => $this->consultation->ticket_number,
            'consultant_name' => $this->consultation->consultant->user->name,
            'scheduled_at' => $this->consultation->scheduled_at,
            'message' => 'Booking konsultasi berhasil dibuat',
            'url' => '/consultations/' . $this->consultation->id,
        ];
    }
}
