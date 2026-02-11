<?php

namespace App\Jobs;

use App\Models\Consultation;
use App\Notifications\Client\ConsultationReminderNotification;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendConsultationReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('SendConsultationReminders: Starting job');

        $this->sendDayBeforeReminders();

        $this->sendHoursBeforeReminders();

        Log::info('SendConsultationReminders: Job completed');
    }

    /**
     * Send reminders 24 hours before consultation
     */
    protected function sendDayBeforeReminders(): void
    {
        $tomorrow = Carbon::now()->addDay()->startOfDay();
        $endOfTomorrow = Carbon::now()->addDay()->endOfDay();

        $consultations = Consultation::where('status', 'confirmed')
            ->whereBetween('scheduled_at', [$tomorrow, $endOfTomorrow])
            ->whereNull('day_before_reminder_sent_at')
            ->with(['user', 'consultant.user'])
            ->get();

        foreach ($consultations as $consultation) {
            try {
                $consultation->user->notify(
                    new ConsultationReminderNotification($consultation, 'day_before')
                );

                $consultation->update(['day_before_reminder_sent_at' => now()]);

                Log::info('Day-before reminder sent', [
                    'consultation_id' => $consultation->id,
                    'user_id' => $consultation->user_id,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send day-before reminder', [
                    'consultation_id' => $consultation->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Send reminders 2 hours before consultation
     */
    protected function sendHoursBeforeReminders(): void
    {
        $twoHoursLater = Carbon::now()->addHours(2);
        $startRange = $twoHoursLater->copy()->subMinutes(15);
        $endRange = $twoHoursLater->copy()->addMinutes(15);

        $consultations = Consultation::where('status', 'confirmed')
            ->whereBetween('scheduled_at', [$startRange, $endRange])
            ->whereNull('hours_before_reminder_sent_at')
            ->with(['user', 'consultant.user'])
            ->get();

        foreach ($consultations as $consultation) {
            try {
                $consultation->user->notify(
                    new ConsultationReminderNotification($consultation, 'hours_before')
                );

                $consultation->update(['hours_before_reminder_sent_at' => now()]);

                Log::info('2-hours-before reminder sent', [
                    'consultation_id' => $consultation->id,
                    'user_id' => $consultation->user_id,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send 2-hours-before reminder', [
                    'consultation_id' => $consultation->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
