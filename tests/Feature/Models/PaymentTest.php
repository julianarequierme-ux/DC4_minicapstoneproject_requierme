<?php

namespace Tests\Feature\Models;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_payment_exposes_its_booking_and_casts_amount_and_paid_at(): void
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
            'total_amount' => '251.00',
            'status' => 'Pending',
        ]);
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'amount' => '251',
            'payment_method' => 'card',
            'payment_status' => 'paid',
            'paid_at' => '2026-10-20 14:30:00',
        ]);

        $this->assertSame($booking->id, $payment->booking->id);
        $this->assertSame('251.00', $payment->fresh()->amount);
        $this->assertSame('2026-10-20 14:30:00', $payment->fresh()->paid_at->format('Y-m-d H:i:s'));
    }
}
