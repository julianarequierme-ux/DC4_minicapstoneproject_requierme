<?php

namespace Tests\Feature\Models;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_booking_exposes_its_user_package_and_payment_and_casts_its_values(): void
    {
        $user = User::factory()->create();
        $travelPackage = TravelPackage::create([
            'title' => 'Coastal Escape',
            'destination' => 'Coron',
            'description' => 'Island tour',
            'price' => '125.50',
            'duration_days' => 4,
            'availability' => 8,
        ]);
        $booking = Booking::create([
            'user_id' => $user->id,
            'travel_package_id' => $travelPackage->id,
            'booking_date' => '2026-11-01',
            'number_of_guests' => 2,
            'total_amount' => '251',
        ]);
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'amount' => '251',
            'payment_method' => 'card',
        ]);

        $this->assertSame($user->id, $booking->user->id);
        $this->assertSame($travelPackage->id, $booking->travelPackage->id);
        $this->assertSame($payment->id, $booking->payment->id);
        $this->assertSame('2026-11-01', $booking->fresh()->booking_date->toDateString());
        $this->assertSame('251.00', $booking->fresh()->total_amount);
        $this->assertSame(2, $booking->fresh()->number_of_guests);
        $this->assertSame('Pending', $booking->fresh()->status);
        $this->assertSame('Unpaid', $payment->fresh()->payment_status);
    }
}
