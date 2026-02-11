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
        Schema::table('consultation_tickets', function (Blueprint $table) {
            $table->timestamp('day_before_reminder_sent_at')->nullable();
            $table->timestamp('hours_before_reminder_sent_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('consultation_tickets', function (Blueprint $table) {
            $table->dropColumn(['day_before_reminder_sent_at', 'hours_before_reminder_sent_at']);
        });
    }
};
