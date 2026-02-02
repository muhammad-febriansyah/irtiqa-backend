<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AboutUsController;
use App\Http\Controllers\Api\ConsultantController;
use App\Http\Controllers\Api\ConsultationCategoryController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\ConsultantTeamController;
use App\Http\Controllers\Api\CrisisController;
use App\Http\Controllers\Api\ConsultantApplicationController;
use App\Http\Controllers\Api\DreamController;
use App\Http\Controllers\Api\EducationalContentController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\FormSubmissionController;
use App\Http\Controllers\Api\JournalController;
use App\Http\Controllers\Api\OnboardingController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\PractitionerController;
use App\Http\Controllers\Api\PrivacyController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\ScreeningFormController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\Admin\FormFieldController;
use App\Http\Controllers\Api\Admin\FormTemplateController;
use App\Http\Controllers\Api\PaymentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Duitku Payment Callback & Return (Public)
Route::prefix('payment')->group(function () {
    Route::post('callback', [PaymentController::class, 'callback'])->name('payment.callback');
    Route::get('return', [PaymentController::class, 'return'])->name('payment.return');
    Route::get('methods', [PaymentController::class, 'methods'])->name('payment.methods');
});

// Public routes
Route::prefix('v1')->group(function () {

    // Authentication routes
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
    });

    // Public content
    Route::get('educational-contents', [EducationalContentController::class, 'index']);
    Route::get('educational-contents/{id}', [EducationalContentController::class, 'show']);

    Route::get('faqs', [FaqController::class, 'index']);
    Route::get('faqs/{id}', [FaqController::class, 'show']);

    Route::get('packages', [PackageController::class, 'index']);
    Route::get('packages/{id}', [PackageController::class, 'show']);

    Route::get('consultation-categories', [ConsultationCategoryController::class, 'index']);

    Route::get('about-us', [AboutUsController::class, 'index']);

    // Screening Forms (Public - no auth required)
    Route::prefix('screening-forms')->group(function () {
        Route::get('', [ScreeningFormController::class, 'index']);
        Route::get('types', [ScreeningFormController::class, 'types']);
        Route::get('category/{categoryId}', [ScreeningFormController::class, 'getDefaultByCategory']);
        Route::get('slug/{slug}', [ScreeningFormController::class, 'showBySlug']);
        Route::get('{id}', [ScreeningFormController::class, 'show']);
    });

    // Settings (Public - no auth required)
    Route::get('settings/public', [SettingController::class, 'public']);
    Route::get('settings/group/{group}', [SettingController::class, 'byGroup']);

    Route::get('consultants', [ConsultantController::class, 'index']);
    Route::get('consultants/{id}', [ConsultantController::class, 'show']);

    Route::get('practitioners', [PractitionerController::class, 'index']);
    Route::get('practitioners/{id}', [PractitionerController::class, 'show']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {

        // Authentication
        Route::prefix('auth')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::put('profile', [AuthController::class, 'updateProfile']);
            Route::post('avatar', [AuthController::class, 'updateAvatar']);
            Route::put('password', [AuthController::class, 'changePassword']);
        });

        // User Profile
        Route::prefix('profile')->group(function () {
            Route::put('', [AuthController::class, 'updateUserProfile']);
            Route::get('disclaimer-status', [AuthController::class, 'getDisclaimerStatus']);
            Route::post('accept-disclaimer', [AuthController::class, 'acceptDisclaimer']);
        });

        // Onboarding
        Route::prefix('onboarding')->group(function () {
            Route::post('accept-disclaimer', [OnboardingController::class, 'acceptDisclaimer']);
            Route::get('disclaimer-status', [OnboardingController::class, 'disclaimerStatus']);
            Route::post('verify-age', [OnboardingController::class, 'verifyAge']);
            Route::post('complete', [OnboardingController::class, 'completeOnboarding']);
        });

        // Crisis Management
        Route::prefix('crisis')->group(function () {
            Route::post('panic-button', [CrisisController::class, 'panicButton']);
            Route::get('hotlines', [CrisisController::class, 'getHotlines']);
        });

        // Privacy & Data
        Route::prefix('privacy')->group(function () {
            Route::get('policy', [PrivacyController::class, 'getPolicy']);
            Route::get('terms', [PrivacyController::class, 'getTerms']);
            Route::get('my-data', [PrivacyController::class, 'exportMyData']);
            Route::get('download-data', [PrivacyController::class, 'downloadData']);
            Route::get('retention-info', [PrivacyController::class, 'getDataRetentionInfo']);
            Route::delete('delete-account', [PrivacyController::class, 'deleteAccount']);
        });

        // Journal
        Route::prefix('journal')->group(function () {
            Route::get('', [JournalController::class, 'index']);
            Route::post('', [JournalController::class, 'store']);
            Route::get('statistics', [JournalController::class, 'statistics']);
            Route::get('tags', [JournalController::class, 'getTags']);
            Route::get('{id}', [JournalController::class, 'show']);
            Route::put('{id}', [JournalController::class, 'update']);
            Route::delete('{id}', [JournalController::class, 'destroy']);
        });

        // Consultant Applications
        Route::prefix('consultant-applications')->group(function () {
            Route::post('', [ConsultantApplicationController::class, 'store']);
            Route::get('my-applications', [ConsultantApplicationController::class, 'myApplications']);
            Route::get('{id}', [ConsultantApplicationController::class, 'show']);
        });

        // Consultation Tickets
        Route::prefix('consultations')->group(function () {
            Route::get('', [ConsultationController::class, 'index']);
            Route::post('', [ConsultationController::class, 'store']);
            Route::get('{id}', [ConsultationController::class, 'show']);
            Route::put('{id}', [ConsultationController::class, 'update']);
            Route::post('{id}/messages', [ConsultationController::class, 'sendMessage']);
            Route::get('{id}/messages', [ConsultationController::class, 'getMessages']);
            Route::post('{id}/rate', [ConsultationController::class, 'rate']);
            Route::post('{id}/cancel', [ConsultationController::class, 'cancel']);
        });

        // Form Submissions
        Route::prefix('form-submissions')->group(function () {
            Route::post('', [FormSubmissionController::class, 'submit']);
            Route::get('my-submissions', [FormSubmissionController::class, 'mySubmissions']);
            Route::get('{id}', [FormSubmissionController::class, 'show']);
            Route::get('ticket/{ticketId}', [FormSubmissionController::class, 'getByTicket']);
        });

        // Consultant Team Management
        Route::prefix('tickets/{ticketId}/team')->group(function () {
            Route::get('', [ConsultantTeamController::class, 'index']);
            Route::post('invite', [ConsultantTeamController::class, 'inviteCollaborator']);
            Route::post('{teamMemberId}/approve', [ConsultantTeamController::class, 'approveCollaborator']);
            Route::post('{teamMemberId}/reject', [ConsultantTeamController::class, 'rejectCollaborator']);
            Route::post('refer', [ConsultantTeamController::class, 'referCase']);
            Route::delete('{teamMemberId}', [ConsultantTeamController::class, 'removeMember']);
        });

        Route::get('pending-approvals', [ConsultantTeamController::class, 'pendingApprovals']);

        // Dreams
        Route::prefix('dreams')->group(function () {
            Route::get('', [DreamController::class, 'index']);
            Route::post('', [DreamController::class, 'store']);
            Route::get('{id}', [DreamController::class, 'show']);
            Route::put('{id}', [DreamController::class, 'update']);
            Route::delete('{id}', [DreamController::class, 'destroy']);
        });

        // Programs (Counseling Programs)
        Route::prefix('programs')->group(function () {
            Route::get('', [ProgramController::class, 'index']);
            Route::post('', [ProgramController::class, 'store']);
            Route::get('{id}', [ProgramController::class, 'show']);
            Route::put('{id}', [ProgramController::class, 'update']);
            Route::post('{id}/sessions', [ProgramController::class, 'createSession']);
            Route::get('{id}/sessions', [ProgramController::class, 'getSessions']);
            Route::put('sessions/{sessionId}', [ProgramController::class, 'updateSession']);
            Route::post('{id}/messages', [ProgramController::class, 'sendMessage']);
            Route::get('{id}/messages', [ProgramController::class, 'getMessages']);
            Route::post('{id}/complete', [ProgramController::class, 'complete']);
            Route::post('{id}/rate', [ProgramController::class, 'rate']);
        });

        // Transactions
        Route::prefix('transactions')->group(function () {
            Route::get('', [TransactionController::class, 'index']);
            Route::post('', [TransactionController::class, 'store']);
            Route::get('{id}', [TransactionController::class, 'show']);
            Route::post('{id}/upload-proof', [TransactionController::class, 'uploadPaymentProof']);
            Route::post('{id}/cancel', [TransactionController::class, 'cancel']);
            Route::get('{id}/status', [TransactionController::class, 'checkStatus']);
        });

        // Consultant-only routes
        Route::middleware('role:consultant,kyai,admin')->group(function () {
            Route::prefix('consultant')->group(function () {
                Route::get('dashboard', [ConsultantController::class, 'dashboard']);
                Route::get('consultations', [ConsultantController::class, 'consultations']);
                Route::get('programs', [ConsultantController::class, 'programs']);
                Route::get('schedule', [ConsultantController::class, 'getSchedule']);
                Route::post('schedule', [ConsultantController::class, 'updateSchedule']);
                Route::get('earnings', [ConsultantController::class, 'earnings']);
            });
        });

        // Admin-only routes
        Route::middleware('role:admin')->prefix('admin')->group(function () {

            // Form Template Management
            Route::prefix('form-templates')->group(function () {
                Route::get('', [FormTemplateController::class, 'index']);
                Route::post('', [FormTemplateController::class, 'store']);
                Route::get('{id}', [FormTemplateController::class, 'show']);
                Route::put('{id}', [FormTemplateController::class, 'update']);
                Route::delete('{id}', [FormTemplateController::class, 'destroy']);
                Route::post('{id}/activate', [FormTemplateController::class, 'activate']);
                Route::post('{id}/deactivate', [FormTemplateController::class, 'deactivate']);
                Route::post('{id}/duplicate', [FormTemplateController::class, 'duplicate']);

                // Form Fields Management
                Route::prefix('{templateId}/fields')->group(function () {
                    Route::get('', [FormFieldController::class, 'index']);
                    Route::post('', [FormFieldController::class, 'store']);
                    Route::put('{fieldId}', [FormFieldController::class, 'update']);
                    Route::delete('{fieldId}', [FormFieldController::class, 'destroy']);
                    Route::post('reorder', [FormFieldController::class, 'reorder']);
                });
            });

            // Risk Statistics
            Route::get('risk-statistics', [FormSubmissionController::class, 'riskStatistics']);

            // Settings Management
            Route::prefix('settings')->group(function () {
                Route::get('', [SettingController::class, 'index']);
                Route::get('groups', [SettingController::class, 'groups']);
                Route::get('{key}', [SettingController::class, 'show']);
                Route::put('{key}', [SettingController::class, 'update']);
                Route::post('bulk-update', [SettingController::class, 'bulkUpdate']);
                Route::delete('{key}', [SettingController::class, 'destroy']);
            });

            // Crisis Alerts Management
            Route::prefix('crisis-alerts')->group(function () {
                Route::get('', [CrisisController::class, 'getAlerts']);
                Route::post('{id}/acknowledge', [CrisisController::class, 'acknowledgeAlert']);
                Route::post('{id}/resolve', [CrisisController::class, 'resolveAlert']);
            });

            // Consultant Applications Management
            Route::prefix('consultant-applications')->group(function () {
                Route::get('', [ConsultantApplicationController::class, 'index']);
                Route::get('statistics', [ConsultantApplicationController::class, 'statistics']);
                Route::post('{id}/approve', [ConsultantApplicationController::class, 'approve']);
                Route::post('{id}/reject', [ConsultantApplicationController::class, 'reject']);
            });
        });
    });
});
