<?php

namespace App\Notifications\Client;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ConsultationReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Consultation $consultation;
    protected string $reminderType; // 'day_before' or 'hours_before'

    public function __construct(Consultation $consultation, string $reminderType = 'hours_before')
    {
        $this->consultation = $consultation;
        $this->reminderType = $reminderType;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'whatsapp', 'mailketing'];
    }

    public function toWhatsApp(object $notifiable): array
    {
        $appName = \App\Models\SystemSetting::get('app_name', config('app.name'));
        $consultant = $this->consultation->consultant;
        $scheduledAt = \Carbon\Carbon::parse($this->consultation->scheduled_at);

        $timeInfo = $this->reminderType === 'day_before'
            ? 'besok pada ' . $scheduledAt->format('H:i')
            : 'dalam 2 jam (' . $scheduledAt->format('H:i') . ')';

        return [
            'phone' => $notifiable->profile->phone ?? $notifiable->phone,
            'message' => "*{$appName}* - Pengingat Konsultasi\n\n" .
                "Assalamu'alaikum {$notifiable->name},\n\n" .
                "🗓️ Pengingat: Anda memiliki jadwal konsultasi {$timeInfo}\n\n" .
                "👤 Konsultan: *{$consultant->user->name}*\n" .
                "📅 Waktu: {$scheduledAt->format('d F Y, H:i')}\n" .
                "🎫 No. Tiket: {$this->consultation->ticket_number}\n\n" .
                "Pastikan Anda sudah siap untuk sesi konsultasi. Semoga bermanfaat!\n\n" .
                "Barakallahu fiikum 🌙"
        ];
    }

    public function toMail(object $notifiable): array
    {
        $consultant = $this->consultation->consultant;
        $scheduledAt = \Carbon\Carbon::parse($this->consultation->scheduled_at);

        $timeInfo = $this->reminderType === 'day_before'
            ? 'besok'
            : 'dalam 2 jam';

        return [
            'subject' => 'Pengingat Konsultasi - Irtiqa',
            'greeting' => "Assalamu'alaikum {$notifiable->name},",
            'intro' => "<p>🗓️ Pengingat: Anda memiliki jadwal konsultasi <strong>{$timeInfo}</strong></p>",
            'body' => "<p><strong>Detail Konsultasi:</strong></p>" .
                "<ul>" .
                "<li>Konsultan: <strong>{$consultant->user->name}</strong></li>" .
                "<li>Waktu: {$scheduledAt->format('d F Y, H:i')}</li>" .
                "<li>No. Tiket: {$this->consultation->ticket_number}</li>" .
                "</ul>",
            'outro' => '<p>Pastikan Anda sudah siap untuk sesi konsultasi. Semoga bermanfaat dan membawa keberkahan!</p>' .
                '<p>Barakallahu fiikum 🌙</p>',
            'actionText' => 'Lihat Detail',
            'actionUrl' => url('/consultations/' . $this->consultation->id),
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'consultation_reminder',
            'consultation_id' => $this->consultation->id,
            'ticket_number' => $this->consultation->ticket_number,
            'consultant_name' => $this->consultation->consultant->user->name,
            'scheduled_at' => $this->consultation->scheduled_at,
            'reminder_type' => $this->reminderType,
            'message' => 'Pengingat: Konsultasi akan dimulai segera',
            'url' => '/consultations/' . $this->consultation->id,
        ];
    }
}
