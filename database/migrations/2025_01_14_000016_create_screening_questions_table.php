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
        Schema::create('screening_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('consultation_categories')->nullOnDelete();
            $table->string('question');
            $table->enum('type', ['text', 'textarea', 'radio', 'checkbox', 'select', 'date', 'number'])->default('text');
            $table->json('options')->nullable(); // For radio, checkbox, select
            $table->boolean('is_required')->default(true);
            $table->text('helper_text')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);

            // Risk assessment scoring
            $table->json('risk_scoring')->nullable(); // Scoring rules for risk assessment

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('screening_questions');
    }
};
