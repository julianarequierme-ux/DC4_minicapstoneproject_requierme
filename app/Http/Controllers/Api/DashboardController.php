<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $bookingsByStatus = Booking::query()
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        return response()->json([
            'total_packages' => TravelPackage::query()->count(),
            'total_bookings' => (int) $bookingsByStatus->sum(),
            'pending_bookings' => (int) ($bookingsByStatus['Pending'] ?? 0),
            'approved_bookings' => (int) ($bookingsByStatus['Confirmed'] ?? 0),
            'completed_bookings' => (int) ($bookingsByStatus['Completed'] ?? 0),
            'total_customers' => User::query()->where('role', 'customer')->count(),
        ]);
    }
}
