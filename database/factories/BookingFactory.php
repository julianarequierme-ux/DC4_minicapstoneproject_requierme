<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'travel_package_id' => TravelPackage::factory(),
            'booking_date' => fake()->dateTimeBetween('now', '+6 months')->format('Y-m-d'),
            'number_of_guests' => fake()->numberBetween(1, 6),
            'total_amount' => fake()->randomFloat(2, 2500, 150000),
            'status' => fake()->randomElement([
                'Pending',
                'Approved',
                'Completed',
                'Cancelled',
            ]),
        ];
    }
}
