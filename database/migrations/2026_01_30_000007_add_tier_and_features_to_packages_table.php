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
        Schema::table('packages', function (Blueprint $table) {
            // Only add columns that don't exist yet
            if (!Schema::hasColumn('packages', 'tier')) {
                $table->string('tier', 20)->nullable()->after('price');
            }
            if (!Schema::hasColumn('packages', 'is_public')) {
                $table->boolean('is_public')->default(true)->after('tier');
            }
            if (!Schema::hasColumn('packages', 'max_sessions')) {
                $table->integer('max_sessions')->nullable()->after('sessions_count');
            }
            if (!Schema::hasColumn('packages', 'includes_voice_call')) {
                $table->boolean('includes_voice_call')->default(false)->after('max_sessions');
            }
            if (!Schema::hasColumn('packages', 'voice_call_count')) {
                $table->integer('voice_call_count')->nullable()->after('includes_voice_call');
            }
            if (!Schema::hasColumn('packages', 'voice_call_duration_minutes')) {
                $table->integer('voice_call_duration_minutes')->nullable()->after('voice_call_count');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn([
                'tier',
                'is_public',
                'features',
                'duration_days',
                'max_sessions',
                'includes_voice_call',
                'voice_call_count',
                'voice_call_duration_minutes',
            ]);
        });
    }
};
