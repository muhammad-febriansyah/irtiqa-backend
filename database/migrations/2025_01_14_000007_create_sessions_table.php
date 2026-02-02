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
        Schema::create('sessions_schedule', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->foreignId('consultant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->integer('session_number');
            $table->string('title')->nullable();
            $table->text('description')->nullable();

            $table->enum('type', ['chat', 'voice', 'video', 'whatsapp'])->default('chat');
            $table->enum('status', ['scheduled', 'ongoing', 'completed', 'cancelled', 'rescheduled'])->default('scheduled');

            $table->dateTime('scheduled_at');
            $table->dateTime('started_at')->nullable();
            $table->dateTime('ended_at')->nullable();

            $table->integer('duration_minutes')->nullable();

            $table->text('agenda')->nullable();
            $table->text('notes')->nullable();
            $table->text('homework')->nullable();
            $table->text('consultant_evaluation')->nullable();

            $table->string('meeting_link')->nullable();
            $table->string('meeting_code')->nullable();

            $table->text('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();

            $table->index(['program_id', 'session_number']);
            $table->index('status');
            $table->index('scheduled_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions_schedule');
    }
};
