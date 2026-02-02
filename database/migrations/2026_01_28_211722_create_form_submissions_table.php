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
        Schema::create('form_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_template_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('consultation_ticket_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('total_risk_score')->default(0);
            $table->string('risk_level')->nullable(); // low, medium, high, critical
            $table->timestamp('submitted_at');
            $table->timestamps();

            $table->index(['user_id', 'submitted_at']);
            $table->index('consultation_ticket_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_submissions');
    }
};
