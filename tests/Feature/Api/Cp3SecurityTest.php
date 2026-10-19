<?php

namespace Tests\Feature\Api;

use App\Models\Booking;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Cp3SecurityTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_guest_gets_unauthorized_on_protected_routes(): void
    {
        $this->getJson('/api/bookings')->assertUnauthorized();
        $this->getJson('/api/user')->assertUnauthorized();
    }

    public function test_customer_cannot_manage_packages_or_payments(): void
    {
        $customer = User::factory()->create();
        Sanctum::actingAs($customer);
        $package = TravelPackage::factory()->create();

        $this->postJson('/api/packages', [])->assertForbidden();
        $this->putJson("/api/packages/{$package->id}", [])->assertForbidden();
        $this->deleteJson("/api/packages/{$package->id}")->assertForbidden();
        $this->getJson('/api/payments')->assertForbidden();
        $this->postJson('/api/payments', [])->assertForbidden();
    }

    public function test_customer_cannot_change_booking_status_or_view_another_booking(): void
    {
        $customer = User::factory()->create();
        $otherCustomer = User::factory()->create();
        $booking = Booking::factory()
            ->for($otherCustomer)
            ->for(TravelPackage::factory())
            ->create(['status' => 'Pending']);
        Sanctum::actingAs($customer);

        $this->patchJson("/api/bookings/{$booking->id}/status", [
            'status' => 'Confirmed',
        ])->assertForbidden();
        $this->getJson("/api/bookings/{$booking->id}")->assertNotFound();
    }

    public function test_admin_can_reach_admin_booking_and_payment_endpoints(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $this->getJson('/api/bookings')->assertOk();
        $this->getJson('/api/payments')->assertOk();
    }

    public function test_invalid_booking_status_transition_is_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $booking = Booking::factory()
            ->for(TravelPackage::factory())
            ->create(['status' => 'Pending']);
        Sanctum::actingAs($admin);

        $this->patchJson("/api/bookings/{$booking->id}/status", [
            'status' => 'Completed',
        ])->assertUnprocessable();
    }
}
