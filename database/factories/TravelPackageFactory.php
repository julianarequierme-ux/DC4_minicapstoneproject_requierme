<?php

namespace Database\Factories;

use App\Models\TravelPackage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TravelPackage>
 */
class TravelPackageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->randomElement([
                'Boracay Island Escape',
                'El Nido Island Hopping',
                'Cebu Falls Adventure',
                'Siargao Surf Retreat',
                'Bohol Countryside Tour',
                'Baguio Highlands Getaway',
                'Vigan Heritage Walk',
                'Batanes Island Discovery',
            ]),
            'destination' => fake()->randomElement([
                'Boracay, Aklan',
                'El Nido, Palawan',
                'Cebu',
                'Siargao, Surigao del Norte',
                'Bohol',
                'Baguio, Benguet',
                'Vigan, Ilocos Sur',
                'Batanes',
            ]),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 2500, 50000),
            'duration_days' => fake()->numberBetween(1, 14),
            'availability' => fake()->numberBetween(1, 40),
            'status' => 'active',
        ];
    }
}
