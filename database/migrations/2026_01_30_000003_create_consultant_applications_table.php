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
        Schema::create('consultant_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('full_name');
            $table->string('phone', 20);
            $table->string('province', 100);
            $table->string('city', 100);
            $table->string('certification_type', 100); // 'KBRA', 'Psikolog', 'Konselor', etc
            $table->string('certification_number', 100)->nullable();
            $table->string('certification_file')->nullable(); // path to uploaded file
            $table->integer('experience_years')->default(0);
            $table->text('bio')->nullable();
            $table->text('specializations')->nullable(); // Areas of expertise
            $table->string('status', 20)->default('pending'); // 'pending', 'approved', 'rejected'
            $table->foreignId('reviewed_by_admin_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultant_applications');
    }
};
