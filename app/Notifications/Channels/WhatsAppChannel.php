<?php

namespace App\Notifications\Channels;

use App\Services\WhatsAppService;
use Illuminate\Notifications\Notification;

class WhatsAppChannel
{
    protected WhatsAppService $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }

    /**
     * Send the given notification.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        if (!method_exists($notification, 'toWhatsApp')) {
            return;
        }

        $message = $notification->toWhatsApp($notifiable);

        if (!$message) {
            return;
        }

        $phone = $this->getPhoneNumber($notifiable, $message);

        if (!$phone) {
            \Log::warning('WhatsApp notification skipped: No phone number', [
                'notifiable_type' => get_class($notifiable),
                'notifiable_id' => $notifiable->id ?? null,
            ]);
            return;
        }

        $this->whatsappService->sendMessage(
            $phone,
            is_array($message) ? ($message['message'] ?? $message['content'] ?? '') : $message
        );
    }

    /**
     * Get phone number from notifiable or message
     */
    protected function getPhoneNumber(object $notifiable, mixed $message): ?string
    {
        if (is_array($message) && isset($message['phone'])) {
            return $message['phone'];
        }

        if (isset($notifiable->phone)) {
            return $notifiable->phone;
        }

        if (isset($notifiable->profile->phone)) {
            return $notifiable->profile->phone;
        }

        if (method_exists($notifiable, 'routeNotificationForWhatsApp')) {
            return $notifiable->routeNotificationForWhatsApp();
        }

        return null;
    }
}
