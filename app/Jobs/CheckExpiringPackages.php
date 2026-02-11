<?php

namespace App\Jobs;

use App\Models\Transaction;
use App\Notifications\Client\PackageExpiringSoonNotification;
use App\Notifications\Client\PackageExpiredNotification;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CheckExpiringPackages implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('CheckExpiringPackages: Starting job');

        $this->checkPackagesExpiringSoon(7);

        $this->checkPackagesExpiringSoon(3);

        $this->checkExpiredPackages();

        Log::info('CheckExpiringPackages: Job completed');
    }

    /**
     * Check packages expiring soon
     */
    protected function checkPackagesExpiringSoon(int $daysLeft): void
    {
        $targetDate = Carbon::now()->addDays($daysLeft)->startOfDay();

        $transactions = Transaction::where('status', 'paid')
            ->whereDate('expires_at', $targetDate)
            ->whereNull("expiry_reminder_{$daysLeft}d_sent_at")
            ->with(['user', 'package'])
            ->get();

        foreach ($transactions as $transaction) {
            try {
                $transaction->user->notify(
                    new PackageExpiringSoonNotification(
                        $transaction->package->name,
                        $transaction->expires_at,
                        $daysLeft
                    )
                );

                $transaction->update(["expiry_reminder_{$daysLeft}d_sent_at" => now()]);

                Log::info('Package expiring reminder sent', [
                    'transaction_id' => $transaction->id,
                    'days_left' => $daysLeft,
                    'user_id' => $transaction->user_id,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send expiring reminder', [
                    'transaction_id' => $transaction->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Check and notify expired packages
     */
    protected function checkExpiredPackages(): void
    {
        $transactions = Transaction::where('status', 'paid')
            ->where('expires_at', '<', Carbon::now())
            ->whereNull('expired_notification_sent_at')
            ->with(['user', 'package'])
            ->get();

        foreach ($transactions as $transaction) {
            try {
                $transaction->user->notify(
                    new PackageExpiredNotification(
                        $transaction->package->name,
                        $transaction->expires_at
                    )
                );

                $transaction->update([
                    'status' => 'expired',
                    'expired_notification_sent_at' => now(),
                ]);

                Log::info('Package expired notification sent', [
                    'transaction_id' => $transaction->id,
                    'user_id' => $transaction->user_id,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send expired notification', [
                    'transaction_id' => $transaction->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
