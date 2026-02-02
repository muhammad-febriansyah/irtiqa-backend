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
        Schema::create('form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_template_id')->constrained()->cascadeOnDelete();
            $table->string('field_key'); // unique key for this field, e.g., "question_1"
            $table->string('label'); // "Apakah Anda pernah mengalami..."
            $table->text('help_text')->nullable(); // Helper text below field
            $table->string('field_type'); // text, textarea, select, radio, checkbox, number, date, scale
            $table->json('validation_rules')->nullable(); // ['required' => true, 'min' => 3]
            $table->boolean('is_required')->default(false);
            $table->boolean('is_core_field')->default(false); // Core field yang tidak bisa dihapus
            $table->integer('order')->default(0); // For sorting
            $table->integer('risk_weight')->default(0); // Base risk score for this field
            $table->json('conditional_logic')->nullable(); // Show/hide based on other fields
            $table->timestamps();

            $table->index(['form_template_id', 'order']);
            $table->unique(['form_template_id', 'field_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_fields');
    }
};
