<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\TransactionController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\PackageController;
use App\Http\Controllers\Admin\ConsultationCategoryController;
use App\Http\Controllers\Admin\ScreeningQuestionController;
use App\Http\Controllers\Admin\MessageTemplateController;
use App\Http\Controllers\Admin\EducationalContentController;
use App\Http\Controllers\Admin\ConsultantController;
use App\Http\Controllers\Admin\SystemSettingController;
use App\Http\Controllers\Admin\SiteSettingController;
use App\Http\Controllers\Admin\TicketController;
use App\Http\Controllers\Admin\DreamController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\PractitionerController;
use App\Http\Controllers\Admin\CrisisAlertController;
use App\Http\Controllers\Admin\ConsultantApplicationController as AdminConsultantApplicationController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\SliderController;
use App\Http\Controllers\Admin\AboutUsController;
use App\Http\Controllers\Admin\LegalPageController;
use App\Http\Controllers\Admin\ContactMessageController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Banners
    Route::resource('banners', BannerController::class)->except(['show', 'create', 'edit']);

    // Sliders
    Route::resource('sliders', SliderController::class)->except(['show', 'create', 'edit']);

    // About Us
    Route::get('about-us', [AboutUsController::class, 'edit'])->name('about-us.edit');
    Route::post('about-us', [AboutUsController::class, 'update'])->name('about-us.update');

    // Legal Pages (Terms & Privacy)
    Route::get('legal/{slug}', [LegalPageController::class, 'edit'])->name('legal.edit');
    Route::post('legal/{slug}', [LegalPageController::class, 'update'])->name('legal.update');

    // Contact Messages
    Route::get('contact-messages', [ContactMessageController::class, 'index'])->name('contact-messages.index');
    Route::get('contact-messages/{id}', [ContactMessageController::class, 'show'])->name('contact-messages.show');
    Route::patch('contact-messages/{id}/status', [ContactMessageController::class, 'updateStatus'])->name('contact-messages.update-status');
    Route::post('contact-messages/{id}/reply', [ContactMessageController::class, 'reply'])->name('contact-messages.reply');
    Route::delete('contact-messages/{id}', [ContactMessageController::class, 'destroy'])->name('contact-messages.destroy');

    // Transactions
    Route::get('transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::get('transactions/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
    Route::post('transactions/{transaction}/verify', [TransactionController::class, 'verify'])->name('transactions.verify');

    // Users
    Route::resource('users', UserController::class)->except(['show', 'create', 'edit']);
    Route::post('users/{user}/toggle-verification', [UserController::class, 'toggleVerification'])->name('users.toggle-verification');

    // Packages
    Route::resource('packages', PackageController::class);

    // Consultation Categories
    Route::resource('consultation-categories', ConsultationCategoryController::class)->except(['show', 'create', 'edit']);

    // Screening Questions
    Route::resource('screening-questions', ScreeningQuestionController::class)->except(['show', 'create', 'edit']);

    // Message Templates
    Route::resource('message-templates', MessageTemplateController::class)->except(['show', 'create', 'edit']);

    // Educational Contents
    Route::resource('educational-contents', EducationalContentController::class)->except(['show']);

    // Consultants
    Route::resource('consultants', ConsultantController::class)->except(['show']);

    // System Settings
    Route::resource('system-settings', SystemSettingController::class)->except(['show', 'create', 'edit', 'destroy']);

    // Site Settings
    Route::get('site-settings', [SiteSettingController::class, 'index'])->name('site-settings.index');
    Route::post('site-settings', [SiteSettingController::class, 'update'])->name('site-settings.update');
    Route::post('site-settings/test-email', [SiteSettingController::class, 'testEmail'])->name('site-settings.test-email');

    // Tickets (Consultation Tickets Management)
    Route::get('tickets', [TicketController::class, 'index'])->name('tickets.index');
    Route::get('tickets/{ticket}', [TicketController::class, 'show'])->name('tickets.show');
    Route::post('tickets/{ticket}/assign', [TicketController::class, 'assign'])->name('tickets.assign');
    Route::post('tickets/{ticket}/update-status', [TicketController::class, 'updateStatus'])->name('tickets.update-status');
    Route::post('tickets/{ticket}/update-risk-level', [TicketController::class, 'updateRiskLevel'])->name('tickets.update-risk-level');

    // Dreams Management
    Route::get('dreams', [DreamController::class, 'index'])->name('dreams.index');
    Route::get('dreams/{dream}', [DreamController::class, 'show'])->name('dreams.show');
    Route::delete('dreams/{dream}', [DreamController::class, 'destroy'])->name('dreams.destroy');

    // FAQs
    Route::resource('faqs', FaqController::class)->except(['show', 'create', 'edit']);
    Route::post('faqs/{faq}/toggle-publish', [FaqController::class, 'togglePublish'])->name('faqs.toggle-publish');
    Route::post('faqs/reorder', [FaqController::class, 'reorder'])->name('faqs.reorder');

    // Practitioners (Referral System)
    Route::resource('practitioners', PractitionerController::class)->except(['show', 'create', 'edit']);
    Route::post('practitioners/{practitioner}/verify', [PractitionerController::class, 'verify'])->name('practitioners.verify');
    Route::post('practitioners/{practitioner}/reject', [PractitionerController::class, 'reject'])->name('practitioners.reject');
    Route::post('practitioners/{practitioner}/toggle-active', [PractitionerController::class, 'toggleActive'])->name('practitioners.toggle-active');

    // Crisis Alerts Management
    Route::get('crisis-alerts', [CrisisAlertController::class, 'index'])->name('crisis-alerts.index');
    Route::get('crisis-alerts/{crisisAlert}', [CrisisAlertController::class, 'show'])->name('crisis-alerts.show');
    Route::post('crisis-alerts/{crisisAlert}/acknowledge', [CrisisAlertController::class, 'acknowledge'])->name('crisis-alerts.acknowledge');
    Route::post('crisis-alerts/{crisisAlert}/resolve', [CrisisAlertController::class, 'resolve'])->name('crisis-alerts.resolve');

    // Consultant Applications Management
    Route::get('consultant-applications', [AdminConsultantApplicationController::class, 'index'])->name('consultant-applications.index');
    Route::get('consultant-applications/{consultantApplication}', [AdminConsultantApplicationController::class, 'show'])->name('consultant-applications.show');
    Route::post('consultant-applications/{consultantApplication}/approve', [AdminConsultantApplicationController::class, 'approve'])->name('consultant-applications.approve');
    Route::post('consultant-applications/{consultantApplication}/reject', [AdminConsultantApplicationController::class, 'reject'])->name('consultant-applications.reject');
});
