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
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('consultant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();

            $table->integer('rating')->unsigned();
            $table->text('review')->nullable();

            $table->integer('communication_rating')->nullable();
            $table->integer('professionalism_rating')->nullable();
            $table->integer('knowledge_rating')->nullable();
            $table->integer('helpfulness_rating')->nullable();

            $table->boolean('is_anonymous')->default(false);
            $table->boolean('is_approved')->default(true);
            $table->boolean('is_featured')->default(false);

            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'program_id']);
            $table->index('consultant_id');
            $table->index('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
