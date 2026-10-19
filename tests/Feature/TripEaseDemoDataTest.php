<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\TravelPackage;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Schema;
use RuntimeException;
use Tests\TestCase;

class TripEaseDemoDataTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_seeder_creates_repeatable_demo_data_with_valid_booking_payments(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseHas('users', [
            'email' => 'admin@tripease.test',
            'role' => 'admin',
        ]);
        $this->assertDatabaseHas('users', [
            'email' => 'customer@tripease.test',
            'role' => 'customer',
        ]);
        $this->assertSame(6, User::query()->count());
        $this->assertSame(24, TravelPackage::query()->count());
        $this->assertSame(4, Booking::query()->count());
        $this->assertSame(4, Payment::query()->count());
        $this->assertSame(5, User::query()->where('role', 'customer')->count());
        $this->assertSame(
            ['Completed', 'Approved', 'Pending', 'Cancelled'],
            Booking::query()->orderBy('booking_date')->pluck('status')->all(),
        );
        $this->assertSame(4, Booking::query()->whereHas('payment')->count());
        $this->assertTrue(Schema::hasColumn('travel_packages', 'category'));

        foreach (Booking::query()->with('payment')->get() as $booking) {
            $this->assertSame($booking->total_amount, $booking->payment->amount);
        }

        $this->seed(DatabaseSeeder::class);

        $this->assertSame(6, User::query()->count());
        $this->assertSame(24, TravelPackage::query()->count());
        $this->assertSame(4, Booking::query()->count());
        $this->assertSame(4, Payment::query()->count());
    }

    public function test_factories_create_models_with_their_relationships_and_named_states(): void
    {
        $admin = User::factory()->admin()->create();
        $travelPackage = TravelPackage::factory()->create();
        $booking = Booking::factory()
            ->for($admin)
            ->for($travelPackage)
            ->create();
        $payment = Payment::factory()
            ->for($booking)
            ->paid()
            ->create();

        $this->assertSame('admin', $admin->role);
        $this->assertSame($admin->id, $booking->user_id);
        $this->assertSame($travelPackage->id, $booking->travel_package_id);
        $this->assertSame($booking->id, $payment->booking_id);
        $this->assertSame('Paid', $payment->payment_status);
    }

    public function test_booking_status_migration_converts_confirmed_records_to_approved(): void
    {
        $booking = Booking::factory()->create(['status' => 'Confirmed']);
        $migration = require database_path(
            'migrations/2026_10_19_172805_update_confirmed_booking_status_to_approved.php',
        );

        $migration->up();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'Approved',
        ]);

        $migration->down();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'Confirmed',
        ]);
    }

    public function test_production_seeding_requires_a_configured_demo_password(): void
    {
        config([
            'app.env' => 'production',
            'app.demo_seed_password' => null,
        ]);

        $this->expectException(RuntimeException::class);

        (new UserSeeder)->run();
    }
}
