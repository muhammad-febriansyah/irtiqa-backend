<?php

namespace App\Notifications\Client;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ConsultantReferralNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Consultation $originalConsultation;
    protected $newConsultant;
    protected $reason;

    public function __construct(Consultation $originalConsultation, $newConsultant, ?string $reason = null)
    {
        $this->originalConsultation = $originalConsultation;
        $this->newConsultant = $newConsultant;
        $this->reason = $reason;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'whatsapp', 'mailketing'];
    }

    public function toWhatsApp(object $notifiable): array
    {
        $appName = \App\Models\SystemSetting::get('app_name', config('app.name'));
        $oldConsultant = $this->originalConsultation->consultant;

        $message = "*{$appName}* - Rujukan Konsultan\n\n" .
            "Assalamu'alaikum {$notifiable->name},\n\n" .
            "📋 Kasus Anda telah dirujuk ke konsultan lain yang lebih sesuai.\n\n" .
            "👤 Konsultan Sebelumnya: {$oldConsultant->user->name}\n" .
            "👨‍⚕️ Konsultan Baru: {$this->newConsultant->user->name}\n";

        if ($this->reason) {
            $message .= "📝 Alasan: {$this->reason}\n";
        }

        $message .= "\nTim konsultan baru akan segera menghubungi Anda.\n\n" .
            "Barakallahu fiikum 🌙";

        return [
            'phone' => $notifiable->profile->phone ?? $notifiable->phone,
            'message' => $message
        ];
    }

    public function toMail(object $notifiable): array
    {
        $oldConsultant = $this->originalConsultation->consultant;

        $body = "<p>Kasus Anda telah dirujuk ke konsultan yang lebih sesuai dengan kebutuhan Anda.</p>" .
            "<p><strong>Detail Rujukan:</strong></p>" .
            "<ul>" .
            "<li>Konsultan Sebelumnya: {$oldConsultant->user->name}</li>" .
            "<li>Konsultan Baru: <strong>{$this->newConsultant->user->name}</strong></li>";

        if ($this->reason) {
            $body .= "<li>Alasan Rujukan: {$this->reason}</li>";
        }

        $body .= "</ul>";

        return [
            'subject' => 'Rujukan ke Konsultan Lain - Irtiqa',
            'greeting' => "Assalamu'alaikum {$notifiable->name},",
            'intro' => '<p>Kami ingin memberitahu Anda tentang perubahan konsultan untuk kasus Anda.</p>',
            'body' => $body,
            'outro' => '<p>Konsultan baru kami akan segera menghubungi Anda. Terima kasih atas pengertian Anda.</p>' .
                '<p>Barakallahu fiikum 🌙</p>',
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'consultant_referral',
            'consultation_id' => $this->originalConsultation->id,
            'old_consultant' => $this->originalConsultation->consultant->user->name,
            'new_consultant' => $this->newConsultant->user->name,
            'reason' => $this->reason,
            'message' => 'Kasus Anda telah dirujuk ke konsultan lain',
            'url' => '/consultations',
        ];
    }
}
