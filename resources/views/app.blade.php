@php
    use App\Models\SystemSetting;
    use Illuminate\Support\Facades\Storage;

    $appName = SystemSetting::get('app_name', config('app.name'));
    $favicon = SystemSetting::get('favicon');
    $faviconUrl = $favicon && Storage::disk('public')->exists($favicon)
        ? asset('storage/' . $favicon)
        : '/favicon-irtiqa.svg';
@endphp

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(0.983 0.007 250);
            }
        </style>

        <title inertia>{{ $appName }}</title>

        <link rel="icon" href="{{ $faviconUrl }}" sizes="any">
        <link rel="icon" href="{{ $faviconUrl }}" type="image/svg+xml">
        <link rel="apple-touch-icon" href="{{ $faviconUrl }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=poppins:300,400,500,600,700" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
