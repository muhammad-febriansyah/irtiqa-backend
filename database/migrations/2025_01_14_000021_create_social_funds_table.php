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
        Schema::create('social_funds', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();

            $table->enum('type', [
                'income',     // Dana masuk dari alokasi transaksi
                'expense'     // Dana keluar
            ]);

            $table->enum('category', [
                'subsidy_dhuafa',           // Subsidi user dhuafa
                'field_practitioner_tips',  // Tips praktisi khidmat lapangan
                'emergency_case_assistance', // Bantuan darurat kasus berat
                'emergency_maintenance',     // Dana maintenance darurat
                'other'
            ])->nullable();

            $table->decimal('amount', 12, 2);
            $table->text('description');

            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete(); // Link to transaction if from transaction
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // Beneficiary or processor
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();

            $table->enum('status', ['pending', 'approved', 'rejected', 'disbursed'])->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('disbursed_at')->nullable();

            $table->text('notes')->nullable();
            $table->json('attachments')->nullable(); // Bukti transfer, foto, dll

            $table->timestamps();

            $table->index('type');
            $table->index('category');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_funds');
    }
};
