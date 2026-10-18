<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_registration_creates_a_customer_and_returns_a_sanctum_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'TripEase Customer',
            'email' => 'customer@example.test',
            'password' => 'correct-horse-battery',
            'password_confirmation' => 'correct-horse-battery',
            'role' => 'admin',
        ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Registration successful.')
            ->assertJsonPath('user.name', 'TripEase Customer')
            ->assertJsonPath('user.role', 'customer')
            ->assertJsonPath('token_type', 'Bearer')
            ->assertJsonStructure(['token'])
            ->assertJsonMissingPath('user.password');

        $user = User::where('email', 'customer@example.test')->firstOrFail();
        $this->assertSame('customer', $user->role);
        $this->assertTrue(Hash::check('correct-horse-battery', $user->password));
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'tripease-token',
        ]);

        $this->withToken($response->json('token'))
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_registration_returns_422_for_invalid_input_without_creating_a_user(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'TripEase Customer',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'different',
            'role' => 'admin',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);

        $this->assertDatabaseMissing('users', ['name' => 'TripEase Customer']);
    }

    public function test_login_returns_401_for_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'customer@example.test',
            'password' => 'correct-horse-battery',
        ]);

        $this->postJson('/api/login', [
            'email' => 'customer@example.test',
            'password' => 'incorrect-password',
        ])->assertUnauthorized()
            ->assertJsonPath('message', 'Invalid email or password.');
    }

    public function test_login_returns_a_sanctum_token_for_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'customer@example.test',
            'password' => 'correct-horse-battery',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'customer@example.test',
            'password' => 'correct-horse-battery',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Login successful.')
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('token_type', 'Bearer')
            ->assertJsonStructure(['token']);

        $this->withToken($response->json('token'))
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_logout_revokes_only_the_current_sanctum_token(): void
    {
        $user = User::factory()->create();
        $revokedToken = $user->createToken('logout-test')->plainTextToken;
        $retainedToken = $user->createToken('retained-test')->plainTextToken;

        $this->withToken($revokedToken)
            ->postJson('/api/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out successfully.');

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'name' => 'logout-test',
        ]);

        $this->app['auth']->forgetGuards();
        $this->withToken($revokedToken)
            ->getJson('/api/user')
            ->assertUnauthorized();

        $this->app['auth']->forgetGuards();
        $this->withToken($retainedToken)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_customer_can_access_the_customer_ping_but_not_the_admin_ping(): void
    {
        $customer = User::factory()->create();
        $token = $customer->createToken('customer-test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/customer/ping')
            ->assertOk()
            ->assertJsonPath('message', 'Hello Customer');

        $this->withToken($token)
            ->getJson('/api/admin/ping')
            ->assertForbidden()
            ->assertJsonPath('message', 'Forbidden. You do not have permission to access this resource.');
    }

    public function test_admin_can_access_the_admin_ping_but_not_the_customer_ping(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $token = $admin->createToken('admin-test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/admin/ping')
            ->assertOk()
            ->assertJsonPath('message', 'Hello Admin');

        $this->withToken($token)
            ->getJson('/api/customer/ping')
            ->assertForbidden();
    }
}
