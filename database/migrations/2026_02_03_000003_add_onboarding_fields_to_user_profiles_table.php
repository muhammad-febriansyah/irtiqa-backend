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
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->string('pseudonym')->nullable()->after('user_id');
            $table->integer('age')->nullable()->after('birth_date');
            $table->string('primary_concern')->nullable()->after('province');
            $table->boolean('onboarding_completed')->default(false)->after('primary_concern');
            $table->timestamp('onboarding_completed_at')->nullable()->after('onboarding_completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'pseudonym',
                'age',
                'primary_concern',
                'onboarding_completed',
                'onboarding_completed_at',
            ]);
        });
    }
};
