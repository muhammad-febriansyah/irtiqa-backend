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
            $table->enum('type', ['initial_free', 'paid_program'])
                ->default('initial_free')
                ->after('status')
                ->comment('Type of consultation: initial_free for screening, paid_program for structured program');
        });
    }

    /**
     * Down the migrations.
     */
    public function down(): void
    {
        Schema::table('consultation_tickets', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
