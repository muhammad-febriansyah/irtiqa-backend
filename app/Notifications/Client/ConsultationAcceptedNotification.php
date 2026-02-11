<?php

namespace App\Notifications\Client;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ConsultationAcceptedNotification extends Notification implements ShouldQueue
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
            'message' => "*{$appName}* - Jadwal Dikonfirmasi\n\n" .
                "Assalamu'alaikum {$notifiable->name},\n\n" .
                "✅ Konsultan telah menerima jadwal konsultasi Anda!\n\n" .
                "👤 Konsultan: {$consultant->user->name}\n" .
                "📅 Jadwal: {$scheduledAt}\n" .
                "🎫 No. Tiket: {$this->consultation->ticket_number}\n\n" .
                "Pastikan Anda hadir tepat waktu. Kami akan mengirim pengingat menjelang sesi.\n\n" .
                "Barakallahu fiikum 🌙"
        ];
    }

    public function toMail(object $notifiable): array
    {
        $consultant = $this->consultation->consultant;
        $scheduledAt = \Carbon\Carbon::parse($this->consultation->scheduled_at)->format('d F Y, H:i');

        return [
            'subject' => 'Jadwal Konsultasi Dikonfirmasi - Irtiqa',
            'greeting' => "Assalamu'alaikum {$notifiable->name},",
            'intro' => '<p>✅ Konsultan telah menerima dan mengkonfirmasi jadwal konsultasi Anda!</p>',
            'body' => "<p><strong>Detail Konsultasi:</strong></p>" .
                "<ul>" .
                "<li>Konsultan: <strong>{$consultant->user->name}</strong></li>" .
                "<li>Jadwal: {$scheduledAt}</li>" .
                "<li>No. Tiket: {$this->consultation->ticket_number}</li>" .
                "</ul>",
            'outro' => '<p>Pastikan Anda hadir tepat waktu. Kami akan mengirim pengingat menjelang sesi dimulai.</p>' .
                '<p>Barakallahu fiikum 🌙</p>',
            'actionText' => 'Lihat Detail',
            'actionUrl' => url('/consultations/' . $this->consultation->id),
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'consultation_accepted',
            'consultation_id' => $this->consultation->id,
            'ticket_number' => $this->consultation->ticket_number,
            'consultant_name' => $this->consultation->consultant->user->name,
            'scheduled_at' => $this->consultation->scheduled_at,
            'message' => 'Konsultan telah menerima jadwal konsultasi Anda',
            'url' => '/consultations/' . $this->consultation->id,
        ];
    }
}
