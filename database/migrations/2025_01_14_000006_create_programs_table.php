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
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('program_code')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('consultant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ticket_id')->constrained('consultation_tickets')->cascadeOnDelete();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();

            $table->string('title');
            $table->text('goals')->nullable();
            $table->text('summary')->nullable();

            $table->enum('status', ['active', 'paused', 'completed', 'cancelled'])->default('active');

            $table->date('start_date');
            $table->date('end_date')->nullable();

            $table->integer('total_sessions')->default(0);
            $table->integer('completed_sessions')->default(0);
            $table->integer('remaining_sessions')->default(0);

            $table->integer('progress_percentage')->default(0);
            $table->text('current_phase')->nullable();

            $table->text('closing_summary')->nullable();
            $table->text('next_recommendations')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('program_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
