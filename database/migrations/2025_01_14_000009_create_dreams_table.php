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
        Schema::create('dreams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('dream_content');
            $table->date('dream_date');
            $table->enum('dream_time', ['dawn', 'morning', 'afternoon', 'evening', 'night'])->nullable();

            $table->enum('physical_condition', ['healthy', 'sick', 'tired', 'stressed'])->nullable();
            $table->enum('emotional_condition', ['calm', 'happy', 'sad', 'anxious', 'angry'])->nullable();

            $table->enum('classification', [
                'khayali_nafsani',
                'emotional',
                'sensitive_indication',
                'needs_consultation'
            ])->nullable();

            $table->text('auto_analysis')->nullable();
            $table->json('suggested_actions')->nullable();

            $table->boolean('disclaimer_checked')->default(false);
            $table->boolean('requested_consultation')->default(false);
            $table->foreignId('consultation_ticket_id')->nullable()->constrained('consultation_tickets')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('classification');
            $table->index('dream_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dreams');
    }
};
