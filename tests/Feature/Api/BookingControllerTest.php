<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class BookingControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_customer_creates_own_booking_with_server_calculated_total_and_reserved_availability(): void
    {
        $customer = User::factory()->create();
        $package = TravelPackage::factory()->create([
            'price' => '1250.50',
            'availability' => 8,
            'status' => 'active',
        ]);
        $this->authenticateAs($customer);

        $response = $this->postJson('/api/bookings', [
            'travel_package_id' => $package->id,
            'booking_date' => '2026-12-10',
            'number_of_guests' => 3,
            'total_amount' => '0.01',
            'status' => 'Confirmed',
            'user_id' => User::factory()->create()->id,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['user_id']);

        $this->postJson('/api/bookings', [
            'travel_package_id' => $package->id,
            'booking_date' => '2026-12-10',
            'number_of_guests' => 3,
            'total_amount' => '0.01',
            'status' => 'Confirmed',
        ])->assertCreated()
            ->assertJsonPath('data.user_id', $customer->id)
            ->assertJsonPath('data.travel_package_id', $package->id)
            ->assertJsonPath('data.total_amount', '3751.50')
            ->assertJsonPath('data.status', 'Pending')
            ->assertJsonPath('data.travel_package.id', $package->id);

        $this->assertDatabaseHas('bookings', [
            'user_id' => $customer->id,
            'travel_package_id' => $package->id,
            'total_amount' => '3751.50',
            'status' => 'Pending',
        ]);
        $this->assertDatabaseHas('travel_packages', [
            'id' => $package->id,
            'availability' => 5,
        ]);
    }

    public function test_booking_creation_returns_422_for_insufficient_availability_or_inactive_package(): void
    {
        $customer = User::factory()->create();
        $limitedPackage = TravelPackage::factory()->create(['availability' => 1]);
        $inactivePackage = TravelPackage::factory()->create([
            'availability' => 10,
            'status' => 'inactive',
        ]);
        $this->authenticateAs($customer);

        $this->postJson('/api/bookings', [
            'travel_package_id' => $limitedPackage->id,
            'booking_date' => '2026-12-10',
            'number_of_guests' => 2,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['number_of_guests']);

        $this->postJson('/api/bookings', [
            'travel_package_id' => $inactivePackage->id,
            'booking_date' => '2026-12-10',
            'number_of_guests' => 1,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['travel_package_id']);

        $this->assertSame(0, Booking::query()->count());
        $this->assertSame(1, $limitedPackage->fresh()->availability);
    }

    public function test_customers_only_list_filter_and_show_their_own_bookings(): void
    {
        $customer = User::factory()->create();
        $otherCustomer = User::factory()->create();
        $package = TravelPackage::factory()->create();
        $ownedBooking = $this->createBooking($customer, $package, [
            'booking_date' => '2026-11-10',
            'status' => 'Pending',
        ]);
        $otherBooking = $this->createBooking($otherCustomer, $package, [
            'booking_date' => '2026-12-10',
            'status' => 'Confirmed',
        ]);
        $this->authenticateAs($customer);

        $this->getJson('/api/bookings?status=Pending&date_from=2026-11-01&date_to=2026-11-30&per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $ownedBooking->id)
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.total', 1);

        $this->getJson("/api/bookings/{$ownedBooking->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $ownedBooking->id);
        $this->getJson("/api/bookings/{$otherBooking->id}")->assertNotFound();
        $this->getJson('/api/bookings?status=Approved')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    public function test_customer_can_update_their_pending_booking_and_availability_is_adjusted(): void
    {
        $customer = User::factory()->create();
        $oldPackage = TravelPackage::factory()->create([
            'price' => '1500.00',
            'availability' => 8,
        ]);
        $newPackage = TravelPackage::factory()->create([
            'price' => '2000.00',
            'availability' => 5,
        ]);
        $booking = $this->createBooking($customer, $oldPackage, [
            'number_of_guests' => 2,
            'total_amount' => '3000.00',
            'status' => 'Pending',
        ]);
        $oldPackage->decrement('availability', 2);
        $this->authenticateAs($customer);

        $this->patchJson("/api/bookings/{$booking->id}", [
            'travel_package_id' => $newPackage->id,
            'number_of_guests' => 3,
            'total_amount' => '1.00',
            'status' => 'Confirmed',
        ])->assertOk()
            ->assertJsonPath('data.travel_package_id', $newPackage->id)
            ->assertJsonPath('data.number_of_guests', 3)
            ->assertJsonPath('data.total_amount', '6000.00')
            ->assertJsonPath('data.status', 'Pending')
            ->assertJsonPath('data.user_id', $customer->id);

        $this->assertDatabaseHas('travel_packages', [
            'id' => $oldPackage->id,
            'availability' => 8,
        ]);
        $this->assertDatabaseHas('travel_packages', [
            'id' => $newPackage->id,
            'availability' => 2,
        ]);

        $this->patchJson("/api/bookings/{$booking->id}", [
            'user_id' => User::factory()->create()->id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['user_id']);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'user_id' => $customer->id,
        ]);
    }

    public function test_customer_cannot_update_another_customers_booking(): void
    {
        $customer = User::factory()->create();
        $otherCustomer = User::factory()->create();
        $package = TravelPackage::factory()->create();
        $booking = $this->createBooking($otherCustomer, $package);
        $this->authenticateAs($customer);

        $this->patchJson("/api/bookings/{$booking->id}", [
            'number_of_guests' => 2,
        ])->assertNotFound();
    }

    public function test_owner_can_cancel_pending_booking_and_inventory_is_restored(): void
    {
        $customer = User::factory()->create();
        $package = TravelPackage::factory()->create(['availability' => 5]);
        $booking = $this->createBooking($customer, $package, [
            'number_of_guests' => 2,
            'status' => 'Pending',
        ]);
        $package->decrement('availability', 2);
        $this->authenticateAs($customer);

        $this->patchJson("/api/bookings/{$booking->id}/status", [
            'status' => 'Cancelled',
        ])->assertOk()
            ->assertJsonPath('data.status', 'Cancelled');

        $this->assertDatabaseHas('travel_packages', [
            'id' => $package->id,
            'availability' => 5,
        ]);
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'Cancelled',
        ]);
    }

    public function test_admin_can_confirm_then_complete_a_booking_but_invalid_transitions_return_422(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $customer = User::factory()->create();
        $package = TravelPackage::factory()->create();
        $booking = $this->createBooking($customer, $package, ['status' => 'Pending']);
        $this->authenticateAs($admin);

        $this->patchJson("/api/bookings/{$booking->id}/status", [
            'status' => 'Confirmed',
        ])->assertOk()
            ->assertJsonPath('data.status', 'Confirmed');

        $this->patchJson("/api/bookings/{$booking->id}/status", [
            'status' => 'Completed',
        ])->assertOk()
            ->assertJsonPath('data.status', 'Completed');

        $this->patchJson("/api/bookings/{$booking->id}/status", [
            'status' => 'Cancelled',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);

        $this->patchJson("/api/bookings/{$booking->id}/status", [
            'status' => 'Approved',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    public function test_customer_cannot_confirm_booking_and_non_owner_cannot_cancel_it(): void
    {
        $customer = User::factory()->create();
        $otherCustomer = User::factory()->create();
        $package = TravelPackage::factory()->create();
        $ownedBooking = $this->createBooking($customer, $package, ['status' => 'Pending']);
        $otherBooking = $this->createBooking($otherCustomer, $package, ['status' => 'Pending']);
        $this->authenticateAs($customer);

        $this->patchJson("/api/bookings/{$ownedBooking->id}/status", [
            'status' => 'Confirmed',
        ])->assertForbidden();

        $this->patchJson("/api/bookings/{$otherBooking->id}/status", [
            'status' => 'Cancelled',
        ])->assertNotFound();
    }

    public function test_admin_can_see_all_bookings_and_delete_booking_with_payment(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $customer = User::factory()->create();
        $package = TravelPackage::factory()->create(['availability' => 8]);
        $booking = $this->createBooking($customer, $package, [
            'number_of_guests' => 2,
            'status' => 'Pending',
        ]);
        $payment = Payment::factory()->for($booking)->create();
        $package->decrement('availability', 2);
        $this->authenticateAs($admin);

        $this->getJson('/api/bookings')
            ->assertOk()
            ->assertJsonPath('data.0.id', $booking->id)
            ->assertJsonPath('data.0.user.email', $customer->email)
            ->assertJsonPath('data.0.payment.id', $payment->id);

        $this->deleteJson("/api/bookings/{$booking->id}")->assertNoContent();

        $this->assertDatabaseMissing('bookings', ['id' => $booking->id]);
        $this->assertDatabaseMissing('payments', ['id' => $payment->id]);
        $this->assertDatabaseHas('travel_packages', [
            'id' => $package->id,
            'availability' => 8,
        ]);
    }

    public function test_booking_endpoints_require_authentication_and_booking_input_is_validated(): void
    {
        $booking = Booking::factory()->create();

        $this->getJson('/api/bookings')->assertUnauthorized();
        $this->postJson('/api/bookings', [])->assertUnauthorized();
        $this->getJson("/api/bookings/{$booking->id}")->assertUnauthorized();
        $this->patchJson("/api/bookings/{$booking->id}", [])->assertUnauthorized();
        $this->deleteJson("/api/bookings/{$booking->id}")->assertUnauthorized();
        $this->patchJson("/api/bookings/{$booking->id}/status", [])->assertUnauthorized();

        $customer = User::factory()->create();
        $this->authenticateAs($customer);

        $this->postJson('/api/bookings', [
            'travel_package_id' => 'invalid',
            'booking_date' => 'not-a-date',
            'number_of_guests' => 0,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['travel_package_id', 'booking_date', 'number_of_guests']);
    }

    public function test_customer_cannot_delete_bookings_and_booking_update_requires_pending_status(): void
    {
        $customer = User::factory()->create();
        $package = TravelPackage::factory()->create();
        $booking = $this->createBooking($customer, $package, ['status' => 'Confirmed']);
        $this->authenticateAs($customer);

        $this->deleteJson("/api/bookings/{$booking->id}")->assertForbidden();

        $this->patchJson("/api/bookings/{$booking->id}", [
            'booking_date' => '2026-12-12',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    private function createBooking(User $user, TravelPackage $package, array $attributes = []): Booking
    {
        return Booking::factory()
            ->for($user)
            ->for($package)
            ->create($attributes);
    }

    private function authenticateAs(User $user): void
    {
        $this->withToken($user->createToken('booking-api-test')->plainTextToken);
    }
}
