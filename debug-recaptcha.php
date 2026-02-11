<?php

// Debug reCAPTCHA issues
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== reCAPTCHA Configuration Check ===\n\n";
echo "Site Key: " . config('services.recaptcha.site_key') . "\n";
echo "Secret Key: " . substr(config('services.recaptcha.secret_key'), 0, 20) . "...\n";
echo "APP_URL: " . config('app.url') . "\n\n";

echo "=== Possible Issues ===\n\n";
echo "1. Domain Mismatch:\n";
echo "   - Your reCAPTCHA keys are registered for specific domains\n";
echo "   - Current APP_URL: " . config('app.url') . "\n";
echo "   - Actual domain in screenshot: irtiqa.id\n";
echo "   - If these don't match, you need to:\n";
echo "     a) Add 'irtiqa.id' to your reCAPTCHA domain list at:\n";
echo "        https://www.google.com/recaptcha/admin\n";
echo "     OR\n";
echo "     b) Generate new reCAPTCHA keys for 'irtiqa.id'\n\n";

echo "2. reCAPTCHA Version:\n";
echo "   - You're using reCAPTCHA v2 (checkbox)\n";
echo "   - Make sure your keys are for v2, not v3\n\n";

echo "3. Test Token Validation:\n";
echo "   - Testing with empty token...\n";

$response = \Illuminate\Support\Facades\Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
    'secret' => config('services.recaptcha.secret_key'),
    'response' => '',
    'remoteip' => '127.0.0.1',
]);

echo "   Response: " . json_encode($response->json(), JSON_PRETTY_PRINT) . "\n\n";

echo "=== Solution ===\n\n";
echo "Visit https://www.google.com/recaptcha/admin and:\n";
echo "1. Find your reCAPTCHA site (Site Key: " . config('services.recaptcha.site_key') . ")\n";
echo "2. Add 'irtiqa.id' to the list of domains\n";
echo "3. Save and try again\n\n";
echo "OR generate new keys with 'irtiqa.id' as the domain\n";
