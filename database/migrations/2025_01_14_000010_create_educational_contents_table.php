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
        Schema::create('educational_contents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content');

            $table->enum('type', ['article', 'video', 'audio', 'infographic', 'guide'])->default('article');
            $table->string('category')->nullable();
            $table->json('tags')->nullable();

            $table->string('thumbnail')->nullable();
            $table->string('media_url')->nullable();
            $table->integer('duration_minutes')->nullable();

            $table->enum('level', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->integer('reading_time_minutes')->nullable();

            $table->boolean('is_published')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable();

            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();

            $table->integer('views_count')->default(0);
            $table->integer('likes_count')->default(0);
            $table->integer('shares_count')->default(0);

            $table->json('seo_meta')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('slug');
            $table->index('type');
            $table->index('category');
            $table->index('is_published');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('educational_contents');
    }
};
