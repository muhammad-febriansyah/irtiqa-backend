<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('entry_date');
            $table->string('mood', 20)->nullable(); // 'very_bad', 'bad', 'neutral', 'good', 'very_good'
            $table->text('content'); // Will be encrypted in application layer
            $table->boolean('is_encrypted')->default(true);
            $table->json('tags')->nullable(); // ['ibadah', 'keluarga', 'pekerjaan']
            $table->timestamps();

            $table->index(['user_id', 'entry_date']);
            $table->index(['user_id', 'mood']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};
