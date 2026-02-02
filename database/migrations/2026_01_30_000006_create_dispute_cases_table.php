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
        Schema::create('dispute_cases', function (Blueprint $table) {
            $table->id();
            $table->string('case_number', 50)->unique();
            $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade'); // User who reports
            $table->foreignId('reported_id')->constrained('users')->onDelete('cascade'); // User/consultant being reported
            $table->foreignId('related_ticket_id')->nullable()->constrained('consultation_tickets')->onDelete('set null');
            $table->foreignId('related_program_id')->nullable()->constrained('programs')->onDelete('set null');
            $table->string('issue_type', 50); // 'consultant_behavior', 'payment', 'service_quality', 'other'
            $table->text('description');
            $table->json('evidence')->nullable(); // Screenshots, files, etc
            $table->string('status', 20)->default('pending'); // 'pending', 'investigating', 'resolved', 'closed'
            $table->foreignId('assigned_to_admin_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('resolution')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('case_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispute_cases');
    }
};
