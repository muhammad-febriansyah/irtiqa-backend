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
            // Escrow system fields
            $table->enum('escrow_status', [
                'held',           // Dana ditahan
                'partially_released', // Sebagian dirilis
                'fully_released', // Semua dirilis ke konsultan
                'refunded'        // Di-refund ke user
            ])->nullable()->after('status');

            $table->decimal('escrow_held_amount', 12, 2)->default(0)->after('escrow_status');
            $table->decimal('escrow_released_amount', 12, 2)->default(0)->after('escrow_held_amount');

            $table->timestamp('escrow_held_at')->nullable()->after('escrow_released_amount');
            $table->timestamp('escrow_first_release_at')->nullable()->after('escrow_held_at');
            $table->timestamp('escrow_full_release_at')->nullable()->after('escrow_first_release_at');

            $table->text('escrow_notes')->nullable()->after('escrow_full_release_at');
        });

        // Create table for escrow release history
        Schema::create('escrow_releases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->integer('percentage')->nullable(); // % dari total
            $table->enum('trigger', [
                'first_session_completed',
                'milestone_reached',
                'program_completed',
                'manual_release',
                'auto_release'
            ]);
            $table->text('notes')->nullable();
            $table->foreignId('released_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('released_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('escrow_releases');

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'escrow_status',
                'escrow_held_amount',
                'escrow_released_amount',
                'escrow_held_at',
                'escrow_first_release_at',
                'escrow_full_release_at',
                'escrow_notes',
            ]);
        });
    }
};
