<?php

namespace App\Notifications\Channels;

use App\Models\SystemSetting;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MailketingChannel
{
    /**
     * Send the given notification.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        if (!method_exists($notification, 'toMail')) {
            return;
        }

        $mailData = $notification->toMail($notifiable);

        if (!$mailData) {
            return;
        }

        $email = $this->getEmail($notifiable, $mailData);

        if (!$email) {
            Log::warning('Email notification skipped: No email address', [
                'notifiable_type' => get_class($notifiable),
                'notifiable_id' => $notifiable->id ?? null,
            ]);
            return;
        }

        $mailApiKey = SystemSetting::get('mail_api_key');

        if ($mailApiKey) {
            $this->sendViaMailketing($email, $mailData, $mailApiKey);
        } else {
            $this->sendViaLaravelMail($email, $mailData);
        }
    }

    /**
     * Send via Mailketing API
     */
    protected function sendViaMailketing(string $email, array $mailData, string $apiKey): void
    {
        try {
            $fromEmail = SystemSetting::get('mail_from_address', config('mail.from.address'));
            $fromName = SystemSetting::get('mail_from_name', config('mail.from.name'));

            $subject = $mailData['subject'] ?? 'Notification from ' . config('app.name');
            $content = $this->buildEmailContent($mailData);

            $response = Http::timeout(30)
                ->asForm()
                ->post('https://api.mailketing.co.id/api/v1/send', [
                    'api_token' => $apiKey,
                    'from_name' => $fromName,
                    'from_email' => $fromEmail,
                    'recipient' => $email,
                    'subject' => $subject,
                    'content' => $content,
                ]);

            if (!$response->successful()) {
                Log::error('Mailketing API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'email' => $email,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Mailketing Exception: ' . $e->getMessage(), [
                'email' => $email,
            ]);
        }
    }

    /**
     * Fallback to Laravel Mail
     */
    protected function sendViaLaravelMail(string $email, array $mailData): void
    {
        try {
            $subject = $mailData['subject'] ?? 'Notification';
            $content = $this->buildEmailContent($mailData);

            \Mail::html($content, function ($message) use ($email, $subject) {
                $message->to($email)->subject($subject);
            });
        } catch (\Exception $e) {
            Log::error('Laravel Mail Exception: ' . $e->getMessage(), [
                'email' => $email,
            ]);
        }
    }

    /**
     * Build email content from mail data
     */
    protected function buildEmailContent(array $mailData): string
    {
        if (isset($mailData['html'])) {
            return $mailData['html'];
        }

        $appName = SystemSetting::get('app_name', config('app.name'));
        $greeting = $mailData['greeting'] ?? "Assalamu'alaikum";
        $intro = $mailData['intro'] ?? '';
        $body = $mailData['body'] ?? '';
        $outro = $mailData['outro'] ?? '';
        $actionText = $mailData['actionText'] ?? null;
        $actionUrl = $mailData['actionUrl'] ?? null;

        $html = <<<HTML
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #2D5A27 0%, #3a7030 100%); padding: 30px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
                .content { padding: 40px 30px; }
                .greeting { font-size: 18px; color: #2D5A27; font-weight: 600; margin-bottom: 20px; }
                .body { color: #4b5563; font-size: 15px; line-height: 1.6; }
                .button { display: inline-block; padding: 12px 30px; background: #2D5A27; color: #ffffff; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { background: #f8faf9; padding: 20px; text-align: center; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{$appName}</h1>
                    <p style="color: #e5e7eb; margin: 10px 0 0 0;">Pendampingan Psiko-Spiritual Islami</p>
                </div>
                <div class="content">
                    <div class="greeting">{$greeting}</div>
                    <div class="body">
                        {$intro}
                        {$body}
                        {$outro}
                    </div>
HTML;

        if ($actionText && $actionUrl) {
            $html .= <<<HTML
                    <p style="text-align: center;">
                        <a href="{$actionUrl}" class="button">{$actionText}</a>
                    </p>
HTML;
        }

        $html .= <<<HTML
                </div>
                <div class="footer">
                    <p style="margin: 0;">© 2026 {$appName}. All rights reserved.</p>
                    <p style="margin: 10px 0 0 0;">Email otomatis, mohon tidak membalas.</p>
                </div>
            </div>
        </body>
        </html>
HTML;

        return $html;
    }

    /**
     * Get email from notifiable or mail data
     */
    protected function getEmail(object $notifiable, array $mailData): ?string
    {
        if (isset($mailData['email'])) {
            return $mailData['email'];
        }

        if (isset($notifiable->email)) {
            return $notifiable->email;
        }

        if (method_exists($notifiable, 'routeNotificationForMail')) {
            return $notifiable->routeNotificationForMail();
        }

        return null;
    }
}
