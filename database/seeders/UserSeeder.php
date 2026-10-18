<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = config('app.demo_seed_password');

        if (! is_string($password) || $password === '') {
            if (config('app.env') === 'production') {
                throw new RuntimeException('Set TRIPEASE_DEMO_SEED_PASSWORD before seeding demo accounts in production.');
            }

            $password = 'password';
        }

        $users = [
            [
                'name' => 'TripEase Administrator',
                'email' => 'admin@tripease.test',
                'role' => 'admin',
            ],
            [
                'name' => 'Maria Santos',
                'email' => 'customer@tripease.test',
                'role' => 'customer',
            ],
            [
                'name' => 'Jose Reyes',
                'email' => 'jose.reyes@tripease.test',
                'role' => 'customer',
            ],
            [
                'name' => 'Ana Dela Cruz',
                'email' => 'ana.delacruz@tripease.test',
                'role' => 'customer',
            ],
            [
                'name' => 'Miguel Garcia',
                'email' => 'miguel.garcia@tripease.test',
                'role' => 'customer',
            ],
            [
                'name' => 'Leah Mendoza',
                'email' => 'leah.mendoza@tripease.test',
                'role' => 'customer',
            ],
        ];

        foreach ($users as $attributes) {
            $user = User::query()->updateOrCreate(
                ['email' => $attributes['email']],
                [
                    'name' => $attributes['name'],
                    'password' => $password,
                ],
            );

            $user->forceFill(['role' => $attributes['role']])->save();
        }
    }
}
