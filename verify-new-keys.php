<?php

// Verify new reCAPTCHA keys
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Verifying New reCAPTCHA Keys ===\n\n";

$siteKey = config('services.recaptcha.site_key');
$secretKey = config('services.recaptcha.secret_key');

echo "Site Key: " . $siteKey . "\n";
echo "Secret Key: " . substr($secretKey, 0, 20) . "...\n\n";

// Verify the keys are updated
if ($siteKey === '6LcrQmAsAAAAAPwVoqbOMoGbSLhd7DmaiiPPKvss') {
    echo "✓ Site Key updated successfully!\n";
} else {
    echo "✗ Site Key not updated. Current: " . $siteKey . "\n";
}

if (strpos($secretKey, '6LcrQmAsAAAAAA2-0LwTmLpZxUAyB8Ja') === 0) {
    echo "✓ Secret Key updated successfully!\n\n";
} else {
    echo "✗ Secret Key not updated. Current: " . substr($secretKey, 0, 20) . "...\n\n";
}

echo "=== Important Notes ===\n\n";
echo "1. Make sure these keys are registered for domain: irtiqa.id\n";
echo "2. If using www, also add: www.irtiqa.id\n";
echo "3. For local testing, also add: localhost\n\n";

echo "Next steps:\n";
echo "1. Restart your development server (npm run dev)\n";
echo "2. Clear browser cache or use incognito mode\n";
echo "3. Try logging in again at irtiqa.id/login\n";
