<?php

namespace Tests\Feature\Models;

use App\Models\Booking;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class TravelPackageTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_package_exposes_its_bookings_and_formats_price_to_two_decimal_places(): void
    {
        $travelPackage = TravelPackage::create([
            'title' => 'Coastal Escape',
            'destination' => 'Coron',
            'description' => 'Island tour',
            'price' => '125.5',
            'duration_days' => 4,
            'availability' => 8,
        ]);
        $user = User::factory()->create();
        $booking = Booking::create([
            'user_id' => $user->id,
            'travel_package_id' => $travelPackage->id,
            'booking_date' => '2026-11-01',
            'number_of_guests' => 2,
            'total_amount' => '251.00',
            'status' => 'Pending',
        ]);

        $this->assertSame($booking->id, $travelPackage->bookings()->sole()->id);
        $this->assertSame('125.50', $travelPackage->fresh()->price);
        $this->assertSame(4, $travelPackage->fresh()->duration_days);
        $this->assertSame(8, $travelPackage->fresh()->availability);
        $this->assertSame('active', $travelPackage->fresh()->status);
    }
}
