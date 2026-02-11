<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware('web')
                ->group(base_path('routes/consultant.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['sidebar_state']);

        // Exclude API and Sanctum routes from CSRF protection
        $middleware->validateCsrfTokens(except: [
            'api/*',
            'sanctum/*',
        ]);

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'consultant' => \App\Http\Middleware\EnsureUserIsConsultant::class,
        ]);
    })
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        // Check consultation reminders every 15 minutes
        $schedule->job(new \App\Jobs\SendConsultationReminders)
            ->everyFifteenMinutes()
            ->name('send-consultation-reminders')
            ->withoutOverlapping();

        // Check expiring packages daily at 09:00
        $schedule->job(new \App\Jobs\CheckExpiringPackages)
            ->dailyAt('09:00')
            ->name('check-expiring-packages')
            ->withoutOverlapping();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
