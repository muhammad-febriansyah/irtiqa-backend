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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('consultant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ticket_id')->constrained('consultation_tickets')->cascadeOnDelete();
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();

            $table->decimal('amount', 12, 2);
            $table->decimal('admin_fee', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2);

            $table->enum('status', ['pending', 'paid', 'failed', 'expired', 'refunded'])->default('pending');
            $table->enum('payment_method', ['payment_gateway', 'manual_transfer'])->nullable();

            // Duitku specific fields
            $table->string('duitku_merchant_code')->nullable();
            $table->string('duitku_reference')->nullable();
            $table->string('duitku_payment_method')->nullable();
            $table->string('duitku_payment_url')->nullable();
            $table->string('duitku_va_number')->nullable();
            $table->string('duitku_qr_string')->nullable();
            $table->json('duitku_response')->nullable();

            // Manual transfer fields
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_name')->nullable();
            $table->string('transfer_proof')->nullable();
            $table->timestamp('transfer_proof_uploaded_at')->nullable();

            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('verification_notes')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expired_at')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('invoice_number');
            $table->index('duitku_reference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
