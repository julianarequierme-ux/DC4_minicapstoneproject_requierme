<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class PaymentControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_customer_cannot_list_or_show_payments(): void
    {
        $customer = User::factory()->create();
        $otherCustomer = User::factory()->create();
        $customerBooking = $this->createBookingFor($customer);
        $otherBooking = $this->createBookingFor($otherCustomer);
        $customerPayment = Payment::factory()->for($customerBooking)->create();
        $otherPayment = Payment::factory()->for($otherBooking)->create();
        $this->authenticateAs($customer);

        $this->getJson('/api/payments')->assertForbidden();
        $this->getJson("/api/payments/{$customerPayment->id}")->assertForbidden();
        $this->getJson("/api/payments/{$otherPayment->id}")->assertForbidden();
    }

    public function test_admin_can_create_update_show_and_delete_a_payment(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $booking = $this->createBookingFor(User::factory()->create());
        $this->authenticateAs($admin);

        $created = $this->postJson('/api/payments', [
            'booking_id' => $booking->id,
            'amount' => '12500.00',
            'payment_method' => 'GCash',
            'payment_status' => 'Paid',
            'paid_at' => '2026-10-18 10:30:00',
        ]);

        $created->assertCreated()
            ->assertJsonPath('data.booking_id', $booking->id)
            ->assertJsonPath('data.booking.id', $booking->id)
            ->assertJsonPath('data.amount', '12500.00');

        $paymentId = $created->json('data.id');
        $this->assertDatabaseHas('payments', [
            'id' => $paymentId,
            'booking_id' => $booking->id,
        ]);

        $this->getJson("/api/payments/{$paymentId}")
            ->assertOk()
            ->assertJsonPath('data.payment_method', 'GCash');

        $this->getJson('/api/payments?page=1&per_page=10')
            ->assertOk()
            ->assertJsonPath('data.0.booking.user.name', $booking->user->name)
            ->assertJsonPath('meta.per_page', 10);

        $this->patchJson("/api/payments/{$paymentId}", [
            'payment_method' => 'Card',
            'payment_status' => 'Paid',
        ])->assertOk()
            ->assertJsonPath('data.payment_method', 'Card');

        $this->assertDatabaseHas('payments', [
            'id' => $paymentId,
            'payment_method' => 'Card',
            'payment_status' => 'Paid',
        ]);

        $this->deleteJson("/api/payments/{$paymentId}")->assertNoContent();
        $this->assertDatabaseMissing('payments', ['id' => $paymentId]);
    }

    public function test_customer_cannot_write_payments_or_view_payments_without_authentication(): void
    {
        $customer = User::factory()->create();
        $booking = $this->createBookingFor($customer);
        $payment = Payment::factory()->for($booking)->create();
        $this->getJson('/api/payments')->assertUnauthorized();
        $this->postJson('/api/payments', [])->assertUnauthorized();
        $this->getJson("/api/payments/{$payment->id}")->assertUnauthorized();

        $this->authenticateAs($customer);

        $this->postJson('/api/payments', [
            'booking_id' => $booking->id,
            'amount' => 100,
            'payment_method' => 'Cash',
        ])->assertForbidden();

        $this->patchJson("/api/payments/{$payment->id}", ['amount' => 1])->assertForbidden();
        $this->deleteJson("/api/payments/{$payment->id}")->assertForbidden();

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'amount' => $payment->amount,
        ]);
    }

    public function test_admin_cannot_create_a_second_payment_for_the_same_booking(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $booking = $this->createBookingFor(User::factory()->create());
        Payment::factory()->for($booking)->create();
        $this->authenticateAs($admin);

        $this->postJson('/api/payments', [
            'booking_id' => $booking->id,
            'amount' => '12500.00',
            'payment_method' => 'GCash',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['booking_id']);

        $this->assertSame(1, Payment::query()->where('booking_id', $booking->id)->count());
    }

    public function test_admin_can_only_record_payments_for_approved_bookings_and_supported_values(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $pendingBooking = $this->createBookingFor(User::factory()->create(), 'Pending');
        $approvedBooking = $this->createBookingFor(User::factory()->create(), 'Approved');
        $this->authenticateAs($admin);

        $this->postJson('/api/payments', [
            'booking_id' => $pendingBooking->id,
            'amount' => 100,
            'payment_method' => 'Cash',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['booking_id']);

        $this->postJson('/api/payments', [
            'booking_id' => $approvedBooking->id,
            'amount' => 0,
            'payment_method' => 'Crypto',
            'payment_status' => 'Pending',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['amount', 'payment_method', 'payment_status']);
    }

    private function createBookingFor(User $user, string $status = 'Approved'): Booking
    {
        $travelPackage = TravelPackage::factory()->create();

        return Booking::factory()
            ->for($user)
            ->for($travelPackage)
            ->create(['status' => $status]);
    }

    private function authenticateAs(User $user): void
    {
        $this->withToken($user->createToken('payment-api-test')->plainTextToken);
    }
}
