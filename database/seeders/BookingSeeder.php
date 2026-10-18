<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bookings = [
            [
                'email' => 'customer@tripease.test',
                'package' => 'Boracay White Beach Escape',
                'booking_date' => '2026-11-12',
                'number_of_guests' => 2,
                'status' => 'Confirmed',
                'payment_status' => 'Paid',
                'payment_method' => 'GCash',
                'paid_at' => '2026-10-18 09:00:00',
            ],
            [
                'email' => 'jose.reyes@tripease.test',
                'package' => 'El Nido Lagoons and Islands',
                'booking_date' => '2026-12-04',
                'number_of_guests' => 2,
                'status' => 'Pending',
                'payment_status' => 'Unpaid',
                'payment_method' => 'Bank Transfer',
                'paid_at' => null,
            ],
            [
                'email' => 'ana.delacruz@tripease.test',
                'package' => 'Cebu Kawasan Falls Adventure',
                'booking_date' => '2026-09-22',
                'number_of_guests' => 3,
                'status' => 'Completed',
                'payment_status' => 'Paid',
                'payment_method' => 'Card',
                'paid_at' => '2026-10-12 14:30:00',
            ],
            [
                'email' => 'miguel.garcia@tripease.test',
                'package' => 'Bohol Chocolate Hills and Panglao',
                'booking_date' => '2026-12-18',
                'number_of_guests' => 2,
                'status' => 'Cancelled',
                'payment_status' => 'Unpaid',
                'payment_method' => 'Cash',
                'paid_at' => null,
            ],
        ];

        foreach ($bookings as $attributes) {
            $user = User::query()->where('email', $attributes['email'])->firstOrFail();
            $package = TravelPackage::query()->where('title', $attributes['package'])->firstOrFail();
            $totalAmount = number_format(
                (float) $package->price * $attributes['number_of_guests'],
                2,
                '.',
                '',
            );

            $booking = Booking::query()
                ->where('user_id', $user->id)
                ->where('travel_package_id', $package->id)
                ->whereDate('booking_date', $attributes['booking_date'])
                ->first();

            if ($booking === null) {
                $booking = new Booking([
                    'user_id' => $user->id,
                    'travel_package_id' => $package->id,
                    'booking_date' => $attributes['booking_date'],
                ]);
            }

            $booking->fill([
                'number_of_guests' => $attributes['number_of_guests'],
                'total_amount' => $totalAmount,
                'status' => $attributes['status'],
            ])->save();

            Payment::query()->updateOrCreate(
                ['booking_id' => $booking->id],
                [
                    'amount' => $booking->total_amount,
                    'payment_method' => $attributes['payment_method'],
                    'payment_status' => $attributes['payment_status'],
                    'paid_at' => $attributes['paid_at'],
                ],
            );
        }
    }
}
