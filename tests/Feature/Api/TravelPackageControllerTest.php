<?php

namespace Tests\Feature\Api;

use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class TravelPackageControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_customer_can_search_filter_and_paginate_packages(): void
    {
        $customer = User::factory()->create();
        $this->authenticateAs($customer);

        TravelPackage::factory()->create([
            'title' => 'Boracay Island Escape',
            'destination' => 'Boracay, Aklan',
            'category' => 'Beach',
            'price' => 12000,
            'duration_days' => 3,
            'status' => 'active',
        ]);
        TravelPackage::factory()->create([
            'title' => 'Boracay Family Week',
            'destination' => 'Boracay, Aklan',
            'category' => 'Family',
            'price' => 22000,
            'duration_days' => 7,
            'status' => 'active',
        ]);
        TravelPackage::factory()->create([
            'title' => 'El Nido Island Hopping',
            'destination' => 'El Nido, Palawan',
            'category' => 'Adventure',
            'price' => 18000,
            'duration_days' => 4,
            'status' => 'inactive',
        ]);

        $this->getJson('/api/packages?search=island&destination=Boracay%2C%20Aklan&status=active&min_price=10000&max_price=15000&duration_days=3&per_page=1')
            ->assertOk()
            ->assertJsonPath('data.0.title', 'Boracay Island Escape')
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonMissing(['title' => 'El Nido Island Hopping']);

        $this->getJson('/api/packages?page=2&per_page=2')
            ->assertOk()
            ->assertJsonPath('data.0.title', 'El Nido Island Hopping')
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.per_page', 2);

        $this->getJson('/api/packages?category=Beach&status=active&min_price=10000&max_price=15000')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.category', 'Beach')
            ->assertJsonPath('data.0.title', 'Boracay Island Escape');
    }

    public function test_package_search_matches_destination_and_rejects_invalid_filter_ranges(): void
    {
        $customer = User::factory()->create();
        $this->authenticateAs($customer);
        $package = TravelPackage::factory()->create([
            'title' => 'Island Discovery',
            'destination' => 'El Nido, Palawan',
        ]);

        $this->getJson('/api/packages?search=Palawan')
            ->assertOk()
            ->assertJsonPath('data.0.id', $package->id);

        $this->getJson('/api/packages?min_price=20000&max_price=10000')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['max_price']);
    }

    public function test_package_search_matches_description_and_per_page_defaults_to_ten_with_a_maximum_of_fifty(): void
    {
        $customer = User::factory()->create();
        $this->authenticateAs($customer);

        TravelPackage::factory()->count(11)->create();
        $descriptionMatch = TravelPackage::factory()->create([
            'description' => 'A private lagoon snorkeling excursion.',
        ]);

        $this->getJson('/api/packages?search=snorkeling')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $descriptionMatch->id);

        $this->getJson('/api/packages')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 12);

        $this->getJson('/api/packages?per_page=50')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 50)
            ->assertJsonCount(12, 'data');

        $this->getJson('/api/packages?per_page=51')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['per_page']);
    }

    public function test_admin_can_create_update_show_and_delete_a_package(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $this->authenticateAs($admin);

        $created = $this->postJson('/api/packages', [
            'title' => 'Coron Lake Adventure',
            'destination' => 'Coron, Palawan',
            'category' => 'Adventure',
            'description' => 'Visit the lakes and reefs of Coron.',
            'price' => '17500.00',
            'duration_days' => 4,
            'availability' => 12,
            'status' => 'active',
        ]);

        $created->assertCreated()
            ->assertJsonPath('data.title', 'Coron Lake Adventure')
            ->assertJsonPath('data.category', 'Adventure')
            ->assertJsonPath('data.price', '17500.00');

        $packageId = $created->json('data.id');
        $this->assertDatabaseHas('travel_packages', [
            'id' => $packageId,
            'destination' => 'Coron, Palawan',
        ]);

        $this->getJson("/api/packages/{$packageId}")
            ->assertOk()
            ->assertJsonPath('data.id', $packageId);

        $this->patchJson("/api/packages/{$packageId}", [
            'price' => '18500.00',
            'availability' => 9,
        ])->assertOk()
            ->assertJsonPath('data.price', '18500.00')
            ->assertJsonPath('data.availability', 9);

        $this->putJson("/api/packages/{$packageId}", [
            'price' => '19500.00',
        ])->assertOk()
            ->assertJsonPath('data.price', '19500.00');

        $this->assertDatabaseHas('travel_packages', [
            'id' => $packageId,
            'price' => '19500.00',
            'availability' => 9,
        ]);

        $this->deleteJson("/api/packages/{$packageId}")->assertNoContent();
        $this->assertDatabaseMissing('travel_packages', ['id' => $packageId]);
    }

    public function test_customer_cannot_mutate_packages_and_unauthenticated_reads_return_401(): void
    {
        $package = TravelPackage::factory()->create();
        $this->getJson('/api/packages')->assertUnauthorized();

        $customer = User::factory()->create();
        $this->authenticateAs($customer);

        $this->postJson('/api/packages', [
            'title' => 'Unauthorized Package',
            'destination' => 'Manila',
            'description' => 'Not allowed.',
            'price' => 1000,
            'duration_days' => 1,
            'availability' => 1,
        ])->assertForbidden();

        $this->patchJson("/api/packages/{$package->id}", ['price' => 1])->assertForbidden();
        $this->putJson("/api/packages/{$package->id}", ['price' => 1])->assertForbidden();
        $this->deleteJson("/api/packages/{$package->id}")->assertForbidden();
        $this->assertDatabaseMissing('travel_packages', ['title' => 'Unauthorized Package']);
    }

    public function test_package_writes_return_422_for_invalid_data(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $this->authenticateAs($admin);

        $this->postJson('/api/packages', [
            'title' => '',
            'destination' => 'Manila',
            'description' => 'Valid description.',
            'price' => -1,
            'duration_days' => 0,
            'availability' => -1,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'price', 'duration_days', 'availability']);

        $this->postJson('/api/packages', [
            'title' => 'Invalid Price Package',
            'destination' => 'Manila',
            'description' => 'Description.',
            'price' => '100.123',
            'duration_days' => 1,
            'availability' => 1,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['price']);

        $package = TravelPackage::factory()->create();

        $this->putJson("/api/packages/{$package->id}", [
            'price' => -1,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['price']);
    }

    private function authenticateAs(User $user): void
    {
        $this->withToken($user->createToken('package-api-test')->plainTextToken);
    }
}
