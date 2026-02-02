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
        Schema::create('crisis_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('ticket_id')->nullable()->constrained('consultation_tickets')->onDelete('set null');
            $table->foreignId('message_id')->nullable()->constrained()->onDelete('set null');
            $table->string('alert_type', 50); // 'keyword_detection', 'manual_panic', 'consultant_escalation'
            $table->json('detected_keywords')->nullable();
            $table->string('severity', 20)->default('medium'); // 'low', 'medium', 'high', 'critical'
            $table->string('status', 20)->default('pending'); // 'pending', 'acknowledged', 'resolved'
            $table->foreignId('assigned_to_admin_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->text('context')->nullable(); // Additional context (message content, etc)
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'severity']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crisis_alerts');
    }
};
