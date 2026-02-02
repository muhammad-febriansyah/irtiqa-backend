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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->morphs('messageable');
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('recipient_id')->nullable()->constrained('users')->nullOnDelete();

            $table->enum('type', ['text', 'image', 'file', 'audio', 'video', 'system'])->default('text');
            $table->text('content')->nullable();
            $table->json('attachments')->nullable();

            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();

            $table->boolean('is_archived')->default(false);
            $table->boolean('is_important')->default(false);

            $table->foreignId('reply_to_message_id')->nullable()->constrained('messages')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('sender_id');
            $table->index('is_read');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
