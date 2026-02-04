<?php

// Test reCAPTCHA validation
// Run this with: php test-recaptcha.php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$siteKey = config('services.recaptcha.site_key');
$secretKey = config('services.recaptcha.secret_key');

echo "Site Key: " . ($siteKey ?: 'NOT SET') . PHP_EOL;
echo "Secret Key: " . ($secretKey ? substr($secretKey, 0, 20) . '...' : 'NOT SET') . PHP_EOL;
echo PHP_EOL;

// Test with a dummy token
$testToken = 'test-token-12345';

$response = \Illuminate\Support\Facades\Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
    'secret' => $secretKey,
    'response' => $testToken,
    'remoteip' => '127.0.0.1',
]);

echo "Google reCAPTCHA Response:" . PHP_EOL;
echo json_encode($response->json(), JSON_PRETTY_PRINT) . PHP_EOL;
