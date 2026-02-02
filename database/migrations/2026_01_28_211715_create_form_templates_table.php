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
        Schema::create('form_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Screening Konseling Umum"
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('type')->default('screening'); // screening, dream_interpretation, etc
            $table->foreignId('category_id')->nullable()->constrained('consultation_categories')->nullOnDelete();
            $table->boolean('is_active')->default(false);
            $table->boolean('is_default')->default(false); // default form for category
            $table->integer('version')->default(1);
            $table->json('settings')->nullable(); // additional settings
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['type', 'is_active']);
            $table->index(['category_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_templates');
    }
};
