<?php

namespace Tests\Feature\Models;

use App\Models\Booking;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_role_helpers_reflect_the_users_role(): void
    {
        $user = User::factory()->create()->refresh();

        $this->assertTrue($user->isCustomer());
        $this->assertFalse($user->isAdmin());

        $user->forceFill(['role' => 'admin'])->save();

        $this->assertTrue($user->fresh()->isAdmin());
        $this->assertFalse($user->fresh()->isCustomer());
    }

    public function test_user_exposes_bookings_and_cannot_mass_assign_an_admin_role(): void
    {
        $user = User::create([
            'name' => 'TripEase Customer',
            'email' => 'customer@example.test',
            'password' => 'secret',
            'role' => 'admin',
        ]);
        $travelPackage = TravelPackage::create([
            'title' => 'Coastal Escape',
            'destination' => 'Coron',
            'price' => '125.50',
            'duration_days' => 4,
            'availability' => 8,
        ]);
        $booking = Booking::create([
            'user_id' => $user->id,
            'travel_package_id' => $travelPackage->id,
            'booking_date' => '2026-11-01',
            'number_of_guests' => 2,
            'total_amount' => '251.00',
            'status' => 'pending',
        ]);

        $this->assertSame($booking->id, $user->bookings()->sole()->id);
        $this->assertSame('customer', $user->fresh()->role);
    }
}
