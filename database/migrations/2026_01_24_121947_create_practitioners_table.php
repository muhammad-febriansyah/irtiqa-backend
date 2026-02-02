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
        Schema::create('practitioners', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('title')->nullable(); // Ustadz, Kyai, Psychologist, etc
            $table->text('bio')->nullable();
            $table->string('photo')->nullable();

            // Specialization
            $table->json('specialties')->nullable(); // ['ruqyah', 'counseling', 'spiritual_guidance']
            $table->text('description')->nullable();

            // Location
            $table->string('province');
            $table->string('city');
            $table->text('address')->nullable();

            // Contact
            $table->string('phone')->nullable();
            $table->string('whatsapp')->nullable();
            $table->string('email')->nullable();

            // Verification & Status
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->text('verification_notes')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_active')->default(true);

            // Credentials
            $table->json('credentials')->nullable(); // certificates, ijazah, etc
            $table->json('documents')->nullable(); // ID card, etc

            // Availability
            $table->json('availability_schedule')->nullable();
            $table->boolean('accepting_referrals')->default(true);

            // Statistics
            $table->integer('referral_count')->default(0);
            $table->decimal('average_rating', 3, 2)->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('province');
            $table->index('city');
            $table->index('verification_status');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('practitioners');
    }
};
