<?php

namespace App\Http\Controllers\Consultant;

use App\Http\Controllers\Controller;
use App\Models\Consultant;
use App\Models\ConsultantSchedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConsultantScheduleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $consultant = Consultant::where('user_id', $user->id)->firstOrFail();

        $schedules = ConsultantSchedule::where('consultant_id', $consultant->id)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(function ($schedule) {
                $startTime = $schedule->start_time;
                $endTime = $schedule->end_time;

                if ($startTime instanceof \Carbon\Carbon) {
                    $startTime = $startTime->format('H:i');
                } else {
                    $startTime = substr(str_replace('.', ':', $startTime), 0, 5);
                }

                if ($endTime instanceof \Carbon\Carbon) {
                    $endTime = $endTime->format('H:i');
                } else {
                    $endTime = substr(str_replace('.', ':', $endTime), 0, 5);
                }

                return [
                    'id' => $schedule->id,
                    'day_of_week' => $schedule->day_of_week,
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'is_available' => $schedule->is_available,
                ];
            });

        return Inertia::render('consultant/schedule/index', [
            'schedules' => $schedules,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $consultant = Consultant::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|different:start_time',
            'is_available' => 'boolean',
        ], [
            'day_of_week.in' => 'Hari yang dipilih tidak valid.',
            'start_time.date_format' => 'Format waktu mulai tidak valid.',
            'end_time.date_format' => 'Format waktu selesai tidak valid.',
            'end_time.different' => 'Waktu selesai harus berbeda dari waktu mulai.',
        ]);

        $schedule = ConsultantSchedule::create([
            'consultant_id' => $consultant->id,
            ...$validated,
        ]);

        return redirect()->back()->with('success', 'Jadwal berhasil ditambahkan');
    }

    public function update(Request $request, ConsultantSchedule $schedule)
    {
        $user = $request->user();
        $consultant = Consultant::where('user_id', $user->id)->firstOrFail();

        if ($schedule->consultant_id !== $consultant->id) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|different:start_time',
            'is_available' => 'boolean',
        ], [
            'day_of_week.in' => 'Hari yang dipilih tidak valid.',
            'start_time.date_format' => 'Format waktu mulai tidak valid.',
            'end_time.date_format' => 'Format waktu selesai tidak valid.',
            'end_time.different' => 'Waktu selesai harus berbeda dari waktu mulai.',
        ]);

        $schedule->update($validated);

        return redirect()->back()->with('success', 'Jadwal berhasil diperbarui');
    }

    public function destroy(ConsultantSchedule $schedule)
    {
        $user = request()->user();
        $consultant = Consultant::where('user_id', $user->id)->firstOrFail();

        if ($schedule->consultant_id !== $consultant->id) {
            abort(403, 'Unauthorized');
        }

        $schedule->delete();

        return redirect()->back()->with('success', 'Jadwal berhasil dihapus');
    }
}
