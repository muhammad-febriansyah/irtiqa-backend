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
        Schema::table('transactions', function (Blueprint $table) {
            $table->timestamp('expiry_reminder_7d_sent_at')->nullable();
            $table->timestamp('expiry_reminder_3d_sent_at')->nullable();
            $table->timestamp('expired_notification_sent_at')->nullable();
            $table->timestamp('package_expires_at')->nullable(); // Track package expiry
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'expiry_reminder_7d_sent_at',
                'expiry_reminder_3d_sent_at',
                'expired_notification_sent_at',
                'package_expires_at'
            ]);
        });
    }
};
