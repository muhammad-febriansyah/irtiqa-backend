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
        Schema::create('program_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->foreignId('session_id')->nullable()->constrained('sessions_schedule')->nullOnDelete();

            $table->string('title');
            $table->text('description')->nullable();
            $table->text('instructions')->nullable();

            $table->enum('type', ['practice', 'reading', 'journaling', 'meditation', 'assignment', 'other'])->default('practice');
            $table->enum('status', ['pending', 'in_progress', 'completed', 'skipped'])->default('pending');

            $table->date('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->text('user_submission')->nullable();
            $table->json('attachments')->nullable();

            $table->text('consultant_feedback')->nullable();
            $table->integer('feedback_rating')->nullable();

            $table->timestamps();

            $table->index('program_id');
            $table->index('status');
            $table->index('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('program_tasks');
    }
};
