<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->registerNotificationChannels();
    }

    /**
     * Register custom notification channels
     */
    protected function registerNotificationChannels(): void
    {
        \Illuminate\Notifications\Channels\DatabaseChannel::class;

        $this->app->make('Illuminate\Notifications\ChannelManager')->extend('whatsapp', function ($app) {
            return new \App\Notifications\Channels\WhatsAppChannel(
                $app->make(\App\Services\WhatsAppService::class)
            );
        });

        $this->app->make('Illuminate\Notifications\ChannelManager')->extend('mailketing', function ($app) {
            return new \App\Notifications\Channels\MailketingChannel();
        });
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}
