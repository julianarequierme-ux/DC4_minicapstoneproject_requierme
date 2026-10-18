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
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['email_verified_at', 'remember_token']);
        });

        Schema::table('travel_packages', function (Blueprint $table) {
            $table->text('description')->nullable(false)->change();
            $table->integer('availability')->change();
            $table->index('destination');
            $table->index('status');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->integer('number_of_guests')->change();
            $table->string('status', 50)->default('Pending')->change();
            $table->index('user_id');
            $table->index('travel_package_id');
            $table->index('status');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->string('payment_status', 50)->default('Unpaid')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('payment_status', 50)->default('pending')->change();
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['travel_package_id']);
            $table->dropIndex(['status']);
            $table->integer('number_of_guests')->default(1)->change();
            $table->string('status', 50)->default('pending')->change();
        });

        Schema::table('travel_packages', function (Blueprint $table) {
            $table->dropIndex(['destination']);
            $table->dropIndex(['status']);
            $table->text('description')->nullable()->change();
            $table->integer('availability')->default(0)->change();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
        });
    }
};
