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
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();

            // Identitas Dasar
            $table->string('title');
            $table->text('content');
            $table->string('excerpt', 500)->nullable();

            // Kategorisasi
            $table->enum('type', ['info', 'warning', 'urgent', 'maintenance', 'feature', 'event'])
                  ->default('info');
            $table->string('category')->nullable();
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');

            // Target Audience
            $table->enum('target_role', ['all', 'user', 'consultant', 'admin', 'kyai'])
                  ->default('all');
            $table->json('target_user_ids')->nullable();
            $table->boolean('is_for_verified_only')->default(false);

            // Display Settings
            $table->string('image')->nullable();
            $table->string('icon')->nullable();
            $table->string('background_color', 7)->nullable(); // Hex color
            $table->string('text_color', 7)->nullable(); // Hex color
            $table->boolean('is_dismissible')->default(true);
            $table->boolean('show_on_home')->default(false);
            $table->boolean('is_popup')->default(false);
            $table->enum('display_position', ['top', 'middle', 'bottom'])->default('middle');

            // CTA (Call to Action)
            $table->string('link_url')->nullable();
            $table->string('link_text')->nullable();
            $table->enum('link_target', ['_self', '_blank'])->default('_self');

            // Scheduling
            $table->enum('status', ['draft', 'published', 'scheduled', 'archived'])
                  ->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            // Tracking & Analytics
            $table->unsignedInteger('view_count')->default(0);
            $table->unsignedInteger('click_count')->default(0);
            $table->unsignedInteger('dismiss_count')->default(0);

            // Audit & Management
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('type');
            $table->index('priority');
            $table->index('target_role');
            $table->index('status');
            $table->index('published_at');
            $table->index('expired_at');
            $table->index(['status', 'published_at', 'expired_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
