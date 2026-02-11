<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Rename whatsapp_number to whatsapp_sender in system_settings
        DB::table('system_settings')
            ->where('key', 'whatsapp_number')
            ->update(['key' => 'whatsapp_sender']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert whatsapp_sender back to whatsapp_number
        DB::table('system_settings')
            ->where('key', 'whatsapp_sender')
            ->update(['key' => 'whatsapp_number']);
    }
};
