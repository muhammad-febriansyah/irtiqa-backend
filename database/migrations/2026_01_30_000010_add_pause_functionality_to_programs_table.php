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
        Schema::table('programs', function (Blueprint $table) {
            $table->timestamp('pause_requested_at')->nullable()->after('completed_at');
            $table->text('pause_reason')->nullable()->after('pause_requested_at');
            $table->string('paused_by', 20)->nullable()->after('pause_reason'); // 'user', 'consultant', 'admin'
            $table->timestamp('paused_at')->nullable()->after('paused_by');
            $table->timestamp('resumed_at')->nullable()->after('paused_at');
            $table->integer('pause_count')->default(0)->after('resumed_at'); // Track how many times paused
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn([
                'pause_requested_at',
                'pause_reason',
                'paused_by',
                'paused_at',
                'resumed_at',
                'pause_count',
            ]);
        });
    }
};
