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
        Schema::create('form_field_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_field_id')->constrained()->cascadeOnDelete();
            $table->string('label'); // "Ya" / "Tidak" / "Kadang-kadang"
            $table->string('value'); // value yang disimpan
            $table->integer('risk_score')->default(0); // 0-10
            $table->integer('order')->default(0);
            $table->boolean('requires_explanation')->default(false); // Jika pilih ini, wajib isi text
            $table->json('metadata')->nullable(); // Additional data
            $table->timestamps();

            $table->index(['form_field_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_field_options');
    }
};
