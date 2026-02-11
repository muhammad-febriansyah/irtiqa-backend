<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Approval Flow Fields
            $table->enum('approval_status', ['pending', 'under_review', 'approved', 'rejected'])
                  ->default('pending')
                  ->after('status')
                  ->comment('Status approval oleh admin/kyai');

            $table->foreignId('approved_by')
                  ->nullable()
                  ->after('approval_status')
                  ->constrained('users')
                  ->nullOnDelete()
                  ->comment('Admin/Kyai yang approve');

            $table->timestamp('approved_at')
                  ->nullable()
                  ->after('approved_by')
                  ->comment('Waktu approval');

            // Consultant Assignment (by Admin/Kyai)
            $table->foreignId('assigned_consultant_id')
                  ->nullable()
                  ->after('consultant_id')
                  ->constrained('consultants')
                  ->nullOnDelete()
                  ->comment('Konsultan yang di-assign oleh admin/kyai');

            $table->text('assignment_notes')
                  ->nullable()
                  ->after('assigned_consultant_id')
                  ->comment('Catatan kenapa assign konsultan ini');

            $table->timestamp('assignment_notified_at')
                  ->nullable()
                  ->after('assignment_notes')
                  ->comment('Kapan konsultan di-notify');

            // Case Analysis by Admin/Kyai
            $table->text('case_analysis')
                  ->nullable()
                  ->after('notes')
                  ->comment('Analisa kasus oleh admin/kyai');

            $table->json('case_tags')
                  ->nullable()
                  ->after('case_analysis')
                  ->comment('Tags untuk kategorisasi kasus (trauma, waswas, mimpi, dll)');

            $table->enum('case_urgency', ['normal', 'urgent', 'emergency'])
                  ->default('normal')
                  ->after('case_tags')
                  ->comment('Tingkat urgensi kasus');

            // Rejection
            $table->text('rejection_reason')
                  ->nullable()
                  ->after('case_urgency')
                  ->comment('Alasan rejection jika di-reject');

            // Indexes
            $table->index('approval_status');
            $table->index('case_urgency');
            $table->index(['approval_status', 'paid_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['assigned_consultant_id']);

            $table->dropColumn([
                'approval_status',
                'approved_by',
                'approved_at',
                'assigned_consultant_id',
                'assignment_notes',
                'assignment_notified_at',
                'case_analysis',
                'case_tags',
                'case_urgency',
                'rejection_reason',
            ]);
        });
    }
};
