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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('text'); // text, number, boolean, json, array
            $table->string('group')->nullable(); // payment, revenue_sharing, general, etc
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false); // Can be accessed by non-admin
            $table->timestamps();
        });

        // Insert default settings untuk revenue sharing sesuai PDF
        DB::table('system_settings')->insert([
            [
                'key' => 'revenue_share_consultant_percentage',
                'value' => '40',
                'type' => 'number',
                'group' => 'revenue_sharing',
                'description' => 'Persentase untuk konsultan dari total revenue',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'revenue_share_admin_kyai_percentage',
                'value' => '30',
                'type' => 'number',
                'group' => 'revenue_sharing',
                'description' => 'Persentase untuk admin & kyai dari total revenue',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'revenue_share_infrastructure_percentage',
                'value' => '20',
                'type' => 'number',
                'group' => 'revenue_sharing',
                'description' => 'Persentase untuk server & infrastruktur dari total revenue',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'revenue_share_social_fund_percentage',
                'value' => '10',
                'type' => 'number',
                'group' => 'revenue_sharing',
                'description' => 'Persentase untuk dana cadangan/sosial dari total revenue',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'payment_expiry_hours',
                'value' => '24',
                'type' => 'number',
                'group' => 'payment',
                'description' => 'Batas waktu pembayaran dalam jam',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'minimum_age',
                'value' => '17',
                'type' => 'number',
                'group' => 'general',
                'description' => 'Umur minimal user (tahun)',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
