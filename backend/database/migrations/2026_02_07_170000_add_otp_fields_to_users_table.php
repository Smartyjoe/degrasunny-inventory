<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('email_verified_at')->nullable()->after('email');
            $table->string('email_verification_otp', 6)->nullable()->after('email_verified_at');
            $table->timestamp('email_verification_otp_expires_at')->nullable()->after('email_verification_otp');
            $table->unsignedTinyInteger('email_verification_attempts')->default(0)->after('email_verification_otp_expires_at');
            
            $table->string('password_reset_otp', 6)->nullable()->after('password');
            $table->timestamp('password_reset_otp_expires_at')->nullable()->after('password_reset_otp');
            $table->unsignedTinyInteger('password_reset_attempts')->default(0)->after('password_reset_otp_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'email_verified_at',
                'email_verification_otp',
                'email_verification_otp_expires_at',
                'email_verification_attempts',
                'password_reset_otp',
                'password_reset_otp_expires_at',
                'password_reset_attempts',
            ]);
        });
    }
};