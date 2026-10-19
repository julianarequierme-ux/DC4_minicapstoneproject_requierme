<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        abort_unless($user instanceof User, 401);

        $isAdmin = $user->isAdmin();
        $bookingsQuery = Booking::query();

        if (! $isAdmin) {
            $bookingsQuery->where('user_id', $user->getKey());
        }

        $bookingsByStatus = $bookingsQuery
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $stats = [
            'total_bookings' => (int) $bookingsByStatus->sum(),
            'pending_bookings' => (int) ($bookingsByStatus['Pending'] ?? 0),
            'approved_bookings' => (int) ($bookingsByStatus['Approved'] ?? 0),
            'completed_bookings' => (int) ($bookingsByStatus['Completed'] ?? 0),
        ];

        if ($isAdmin) {
            $stats += [
                'total_packages' => TravelPackage::query()->count(),
                'total_customers' => User::query()->where('role', 'customer')->count(),
            ];
        }

        return response()->json($stats);
    }
}
