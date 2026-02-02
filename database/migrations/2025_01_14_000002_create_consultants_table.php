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
        Schema::create('consultants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('specialist_category')->nullable();
            $table->enum('level', ['junior', 'senior', 'expert'])->default('junior');
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->string('certificate_number')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->text('bio')->nullable();
            $table->decimal('rating_average', 3, 2)->default(0);
            $table->integer('total_cases')->default(0);
            $table->integer('total_ratings')->default(0);
            $table->json('working_hours')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultants');
    }
};
