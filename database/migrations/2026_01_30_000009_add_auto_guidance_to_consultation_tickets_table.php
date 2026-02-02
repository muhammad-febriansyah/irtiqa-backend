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
        Schema::table('consultation_tickets', function (Blueprint $table) {
            $table->boolean('auto_guidance_sent')->default(false)->after('recommendation');
            $table->text('auto_guidance_content')->nullable()->after('auto_guidance_sent');
            $table->timestamp('sla_deadline')->nullable()->after('auto_guidance_content'); // 24 hours from created_at
            $table->boolean('is_high_risk')->default(false)->after('sla_deadline');
            $table->timestamp('first_response_at')->nullable()->after('is_high_risk'); // When consultant first responds
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('consultation_tickets', function (Blueprint $table) {
            $table->dropColumn([
                'auto_guidance_sent',
                'auto_guidance_content',
                'sla_deadline',
                'is_high_risk',
                'first_response_at',
            ]);
        });
    }
};
