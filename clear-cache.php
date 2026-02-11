<?php
/**
 * Script untuk clear cache Laravel di cPanel tanpa SSH
 *
 * CARA PAKAI:
 * 1. Upload file ini ke root folder Laravel (sejajar dengan artisan)
 * 2. Akses via browser: https://irtiqa.id/clear-cache.php
 * 3. Setelah selesai, HAPUS file ini untuk keamanan
 */

// Security: Uncomment baris di bawah dan ganti dengan password rahasia
// $password = 'rahasia123';
// if (!isset($_GET['key']) || $_GET['key'] !== $password) {
//     die('Unauthorized');
// }

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

echo "<html><head><title>Clear Cache</title></head><body>";
echo "<h1>Laravel Cache Clearer</h1>";
echo "<pre>";

try {
    // Clear config cache
    Artisan::call('config:clear');
    echo "✓ Config cache cleared\n";

    // Clear application cache
    Artisan::call('cache:clear');
    echo "✓ Application cache cleared\n";

    // Clear route cache
    Artisan::call('route:clear');
    echo "✓ Route cache cleared\n";

    // Clear view cache
    Artisan::call('view:clear');
    echo "✓ View cache cleared\n";

    echo "\n<strong style='color: green;'>✓ All caches cleared successfully!</strong>\n";
    echo "\n<strong style='color: red;'>⚠️ PENTING: Segera hapus file clear-cache.php ini untuk keamanan!</strong>\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "</pre>";
echo "<p><a href='/login'>Go to Login Page</a></p>";
echo "</body></html>";
