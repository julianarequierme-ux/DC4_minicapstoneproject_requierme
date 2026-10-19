<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('bookings')
            ->where('status', 'Confirmed')
            ->update(['status' => 'Approved']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('bookings')
            ->where('status', 'Approved')
            ->update(['status' => 'Confirmed']);
    }
};
