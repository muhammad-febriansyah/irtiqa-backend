<?php

namespace App\Notifications;

use App\Models\CrisisAlert;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;

class CrisisAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected CrisisAlert $alert;

    /**
     * Create a new notification instance.
     */
    public function __construct(CrisisAlert $alert)
    {
        $this->alert = $alert;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'alert_id' => $this->alert->id,
            'user_id' => $this->alert->user_id,
            'user_name' => $this->alert->user?->name ?? 'User',
            'alert_type' => $this->alert->alert_type,
            'severity' => $this->alert->severity,
            'context' => $this->alert->context,
            'message' => 'Laporan krisis baru terdeteksi: ' . $this->alert->severity,
            'url' => '/admin/crisis-alerts/' . $this->alert->id,
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'alert_id' => $this->alert->id,
            'severity' => $this->alert->severity,
            'message' => 'Laporan krisis baru: ' . $this->alert->severity,
        ]);
    }
}
