<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('follow_up_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('scheduled_at');
            $table->string('type', 20); // '1_week', '1_month', '3_months'
            $table->string('status', 20)->default('pending'); // 'pending', 'sent', 'completed', 'skipped'
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('response')->nullable();
            $table->json('questions')->nullable(); // Follow-up questions
            $table->json('answers')->nullable(); // User responses
            $table->timestamps();

            $table->index(['program_id', 'type']);
            $table->index(['status', 'scheduled_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('follow_up_schedules');
    }
};
