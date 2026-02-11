<?php

namespace App\Notifications\Client;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class PaymentConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Transaction $transaction;

    public function __construct(Transaction $transaction)
    {
        $this->transaction = $transaction;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'whatsapp', 'mailketing'];
    }

    public function toWhatsApp(object $notifiable): array
    {
        $appName = \App\Models\SystemSetting::get('app_name', config('app.name'));
        $amount = number_format($this->transaction->amount, 0, ',', '.');

        return [
            'phone' => $notifiable->profile->phone ?? $notifiable->phone,
            'message' => "*{$appName}* - Konfirmasi Pembayaran\n\n" .
                "Assalamu'alaikum {$notifiable->name},\n\n" .
                "✅ Pembayaran Anda telah diterima!\n\n" .
                "💰 Jumlah: Rp {$amount}\n" .
                "🔖 ID Transaksi: {$this->transaction->id}\n" .
                "📦 Paket: {$this->transaction->package->name}\n\n" .
                "Paket Anda telah aktif dan siap digunakan.\n\n" .
                "Terima kasih atas kepercayaan Anda.\n\n" .
                "Barakallahu fiikum 🌙"
        ];
    }

    public function toMail(object $notifiable): array
    {
        $amount = number_format($this->transaction->amount, 0, ',', '.');

        return [
            'subject' => 'Konfirmasi Pembayaran - Irtiqa',
            'greeting' => "Assalamu'alaikum {$notifiable->name},",
            'intro' => '<p>Pembayaran Anda telah berhasil diproses!</p>',
            'body' => "<p><strong>Detail Pembayaran:</strong></p>" .
                "<ul>" .
                "<li>Jumlah: <strong>Rp {$amount}</strong></li>" .
                "<li>ID Transaksi: {$this->transaction->id}</li>" .
                "<li>Paket: {$this->transaction->package->name}</li>" .
                "<li>Status: Aktif</li>" .
                "</ul>",
            'outro' => '<p>Paket Anda sudah aktif dan siap digunakan. Terima kasih atas kepercayaan Anda.</p>' .
                '<p>Barakallahu fiikum 🌙</p>',
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'payment_confirmation',
            'transaction_id' => $this->transaction->id,
            'amount' => $this->transaction->amount,
            'package_name' => $this->transaction->package->name,
            'message' => 'Pembayaran Anda telah berhasil diproses',
            'url' => '/transactions/' . $this->transaction->id,
        ];
    }
}
