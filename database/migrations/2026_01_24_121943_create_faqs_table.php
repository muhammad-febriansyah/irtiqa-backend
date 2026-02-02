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
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('question');
            $table->text('answer');
            $table->string('category')->nullable(); // Psiko-Spiritual, Mimpi & Tidur, Waswas & Ibadah, etc
            $table->integer('order')->default(0);
            $table->boolean('is_published')->default(true);
            $table->integer('views_count')->default(0);
            $table->integer('helpful_count')->default(0);
            $table->json('tags')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('category');
            $table->index('is_published');
            $table->index('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faqs');
    }
};
