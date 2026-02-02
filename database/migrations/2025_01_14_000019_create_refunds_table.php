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
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->string('refund_number')->unique();
            $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->decimal('refund_amount', 12, 2);
            $table->enum('reason', [
                'service_not_started',
                'technical_issue',
                'consultant_unavailable',
                'user_request',
                'quality_issue',
                'other'
            ]);
            $table->text('reason_detail')->nullable();

            $table->enum('status', ['pending', 'approved', 'rejected', 'processed', 'completed'])->default('pending');

            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('approval_notes')->nullable();

            $table->string('refund_method')->nullable(); // bank_transfer, wallet, etc
            $table->text('refund_details')->nullable(); // Bank account info, etc
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index('refund_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
