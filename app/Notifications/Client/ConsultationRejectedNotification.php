<?php

namespace App\Notifications\Client;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ConsultationRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Consultation $consultation;
    protected $reason;

    public function __construct(Consultation $consultation, ?string $reason = null)
    {
        $this->consultation = $consultation;
        $this->reason = $reason;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'whatsapp', 'mailketing'];
    }

    public function toWhatsApp(object $notifiable): array
    {
        $appName = \App\Models\SystemSetting::get('app_name', config('app.name'));
        $consultant = $this->consultation->consultant;

        $message = "*{$appName}* - Jadwal Tidak Tersedia\n\n" .
            "Assalamu'alaikum {$notifiable->name},\n\n" .
            "Mohon maaf, konsultan tidak dapat menerima jadwal konsultasi Anda.\n\n" .
            "👤 Konsultan: {$consultant->user->name}\n" .
            "🎫 No. Tiket: {$this->consultation->ticket_number}\n";

        if ($this->reason) {
            $message .= "\n📝 Alasan: {$this->reason}\n";
        }

        $message .= "\nSilakan pilih jadwal lain atau konsultan lainnya.\n\n" .
            "Barakallahu fiikum 🌙";

        return [
            'phone' => $notifiable->profile->phone ?? $notifiable->phone,
            'message' => $message
        ];
    }

    public function toMail(object $notifiable): array
    {
        $consultant = $this->consultation->consultant;

        $body = "<p>Mohon maaf, konsultan tidak dapat menerima jadwal konsultasi Anda.</p>" .
            "<p><strong>Detail:</strong></p>" .
            "<ul>" .
            "<li>Konsultan: {$consultant->user->name}</li>" .
            "<li>No. Tiket: {$this->consultation->ticket_number}</li>";

        if ($this->reason) {
            $body .= "<li>Alasan: {$this->reason}</li>";
        }

        $body .= "</ul>";

        return [
            'subject' => 'Jadwal Konsultasi Tidak Tersedia - Irtiqa',
            'greeting' => "Assalamu'alaikum {$notifiable->name},",
            'intro' => '<p>Kami mohon maaf atas ketidaknyamanan ini.</p>',
            'body' => $body,
            'outro' => '<p>Silakan pilih jadwal lain atau konsultan lainnya yang sesuai dengan kebutuhan Anda.</p>' .
                '<p>Barakallahu fiikum 🌙</p>',
            'actionText' => 'Pilih Jadwal Baru',
            'actionUrl' => url('/consultations/create'),
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'consultation_rejected',
            'consultation_id' => $this->consultation->id,
            'ticket_number' => $this->consultation->ticket_number,
            'consultant_name' => $this->consultation->consultant->user->name,
            'reason' => $this->reason,
            'message' => 'Konsultan tidak dapat menerima jadwal ini',
            'url' => '/consultations/create',
        ];
    }
}
