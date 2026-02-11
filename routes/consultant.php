<?php

use App\Http\Controllers\Consultant\ConsultantApplicationPageController;
use App\Http\Controllers\Consultant\ConsultantConsultationController;
use App\Http\Controllers\Consultant\ConsultantDashboardController;
use App\Http\Controllers\Consultant\ConsultantEarningController;
use App\Http\Controllers\Consultant\ConsultantProfileController;
use App\Http\Controllers\Consultant\ConsultantScheduleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Consultant Routes
|--------------------------------------------------------------------------
|
| Routes for consultant dashboard and features.
| All routes require authentication and consultant role.
|
*/

Route::middleware(['auth', 'verified', 'consultant'])->prefix('consultant')->name('consultant.')->group(function () {

    // Dashboard
    Route::get('dashboard', [ConsultantDashboardController::class, 'index'])->name('dashboard');

    // Schedule & Availability
    Route::prefix('schedule')->name('schedule.')->group(function () {
        Route::get('/', [ConsultantScheduleController::class, 'index'])->name('index');
        Route::post('/', [ConsultantScheduleController::class, 'store'])->name('store');
        Route::put('{schedule}', [ConsultantScheduleController::class, 'update'])->name('update');
        Route::delete('{schedule}', [ConsultantScheduleController::class, 'destroy'])->name('destroy');
    });

    // Consultations
    Route::prefix('consultations')->name('consultations.')->group(function () {
        Route::get('/', [ConsultantConsultationController::class, 'index'])->name('index');
        Route::get('{ticket}', [ConsultantConsultationController::class, 'show'])->name('show');
        Route::post('{ticket}/respond', [ConsultantConsultationController::class, 'respond'])->name('respond');
        Route::put('{ticket}/status', [ConsultantConsultationController::class, 'updateStatus'])->name('updateStatus');
    });

    // Earnings & Withdrawals
    Route::prefix('earnings')->name('earnings.')->group(function () {
        Route::get('/', [ConsultantEarningController::class, 'index'])->name('index');
        Route::get('transactions', [ConsultantEarningController::class, 'transactions'])->name('transactions');
        Route::post('withdrawal', [ConsultantEarningController::class, 'requestWithdrawal'])->name('withdrawal.request');
        Route::get('withdrawals', [ConsultantEarningController::class, 'withdrawalHistory'])->name('withdrawals');
    });

    // Consultant Application
    Route::get('application', [ConsultantApplicationPageController::class, 'index'])->name('application.index');
    Route::get('application/data', [ConsultantApplicationPageController::class, 'getApplications'])->name('application.data');

    // Profile & Specializations
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('edit', [ConsultantProfileController::class, 'edit'])->name('edit');
        Route::put('/', [ConsultantProfileController::class, 'update'])->name('update');
        Route::put('specializations', [ConsultantProfileController::class, 'updateSpecializations'])->name('specializations.update');
    });
});
