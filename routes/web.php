<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use App\Models\Banner;
use App\Models\Slider;
use App\Models\SystemSetting;

Route::get('/', [\App\Http\Controllers\HomeController::class, 'index'])->name('home');

Route::get('/tentang-kami', [\App\Http\Controllers\AboutController::class, 'index'])->name('about');
Route::get('/layanan', [\App\Http\Controllers\ServiceController::class, 'index'])->name('services');

Route::prefix('artikel')->name('articles.')->group(function () {
    Route::get('/', [\App\Http\Controllers\ArticleController::class, 'index'])->name('index');
    Route::get('/{slug}', [\App\Http\Controllers\ArticleController::class, 'show'])->name('show');
});

Route::prefix('konsultan')->name('consultants.')->group(function () {
    Route::get('/', [\App\Http\Controllers\ConsultantController::class, 'index'])->name('index');
    Route::get('/{consultant}', [\App\Http\Controllers\ConsultantController::class, 'show'])->name('show');
});
Route::get('/cara-kerja', [\App\Http\Controllers\HowItWorksController::class, 'index'])->name('how-it-works');
Route::get('/faq', [\App\Http\Controllers\FaqController::class, 'index'])->name('faq');
Route::get('/kontak', [\App\Http\Controllers\ContactController::class, 'index'])->name('contact');
Route::post('/kontak', [\App\Http\Controllers\ContactController::class, 'store'])->name('contact.store');

Route::get('/kebijakan-privasi', [\App\Http\Controllers\LegalController::class, 'privacy'])->name('privacy');
Route::get('/syarat-ketentuan', [\App\Http\Controllers\LegalController::class, 'terms'])->name('terms');

require __DIR__ . '/settings.php';
require __DIR__ . '/admin.php';
