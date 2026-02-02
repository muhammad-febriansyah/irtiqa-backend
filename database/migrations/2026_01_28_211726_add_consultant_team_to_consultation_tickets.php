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
        // Add fields for smart routing
        Schema::table('consultation_tickets', function (Blueprint $table) {
            $table->foreignId('form_submission_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->foreignId('assigned_by_id')->nullable()->after('consultant_id')->constrained('users')->nullOnDelete();
            $table->string('assigned_by_type')->nullable()->after('assigned_by_id'); // system, admin
            $table->text('override_reason')->nullable()->after('assigned_by_type');
            $table->integer('routing_score')->nullable()->after('override_reason');
            $table->json('routing_metadata')->nullable()->after('routing_score');
        });

        // Create consultant team table
        Schema::create('consultation_ticket_consultants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('consultant_id')->constrained()->cascadeOnDelete();
            $table->string('role')->default('primary'); // primary, collaborator, referred
            $table->foreignId('invited_by')->nullable()->constrained('consultants')->nullOnDelete();
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('user_approved_at')->nullable(); // User approval required for collaborators
            $table->boolean('is_active')->default(true);
            $table->text('internal_notes')->nullable(); // Notes from inviter, not visible to user
            $table->text('handover_notes')->nullable(); // For referrals
            $table->timestamps();

            $table->index(['consultation_ticket_id', 'is_active'], 'ctc_ticket_active_idx');
            $table->unique(['consultation_ticket_id', 'consultant_id', 'role'], 'ctc_ticket_consultant_role_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultation_ticket_consultants');

        Schema::table('consultation_tickets', function (Blueprint $table) {
            $table->dropForeign(['form_submission_id']);
            $table->dropForeign(['assigned_by_id']);
            $table->dropColumn([
                'form_submission_id',
                'assigned_by_id',
                'assigned_by_type',
                'override_reason',
                'routing_score',
                'routing_metadata',
            ]);
        });
    }
};
