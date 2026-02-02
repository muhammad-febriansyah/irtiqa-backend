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
        Schema::create('consultation_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('consultant_id')->nullable()->constrained()->nullOnDelete();
            $table->string('category');
            $table->text('problem_description');
            $table->json('screening_answers')->nullable();
            $table->enum('status', ['waiting', 'in_progress', 'completed', 'referred', 'rejected'])->default('waiting');
            $table->enum('risk_level', ['low', 'medium', 'high', 'critical'])->nullable();
            $table->enum('urgency', ['normal', 'urgent', 'emergency'])->default('normal');
            $table->text('consultant_notes')->nullable();
            $table->text('screening_conclusion')->nullable();
            $table->enum('recommendation', [
                'continue_guidance',
                'self_education',
                'refer_to_another',
                'not_suitable',
                'refer_to_professional'
            ])->nullable();
            $table->foreignId('referred_to_consultant_id')->nullable()->constrained('consultants')->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('category');
            $table->index('risk_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultation_tickets');
    }
};
