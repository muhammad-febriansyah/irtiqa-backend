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
        Schema::table('dreams', function (Blueprint $table) {
            // Only add columns that don't exist yet
            if (!Schema::hasColumn('dreams', 'sleep_hours')) {
                $table->integer('sleep_hours')->nullable()->after('disclaimer_checked');
            }
            if (!Schema::hasColumn('dreams', 'sleep_time')) {
                $table->time('sleep_time')->nullable()->after('sleep_hours');
            }
            if (!Schema::hasColumn('dreams', 'ate_before_sleep')) {
                $table->boolean('ate_before_sleep')->nullable()->after('sleep_time');
            }
            if (!Schema::hasColumn('dreams', 'stressed_today')) {
                $table->boolean('stressed_today')->nullable()->after('ate_before_sleep');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dreams', function (Blueprint $table) {
            $table->dropColumn([
                'classification',
                'auto_response',
                'disclaimer_accepted',
                'sleep_hours',
                'sleep_time',
                'ate_before_sleep',
                'stressed_today',
            ]);
        });
    }
};
