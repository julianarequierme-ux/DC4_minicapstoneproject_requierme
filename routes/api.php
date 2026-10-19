<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TravelPackageController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'TripEase API is running',
        'time' => now()->toDateTimeString(),
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::apiResource('packages', TravelPackageController::class)->only(['index', 'show']);
    Route::apiResource('bookings', BookingController::class)->except(['destroy']);
    Route::patch('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])
        ->name('bookings.cancel');

    Route::middleware('role:admin')->get('/admin/ping', fn () => response()->json(['message' => 'Hello Admin']));
    Route::middleware('role:customer')->get('/customer/ping', fn () => response()->json(['message' => 'Hello Customer']));

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('packages', TravelPackageController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('payments', PaymentController::class);
        Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus'])
            ->name('bookings.status');
        Route::delete('/bookings/{booking}', [BookingController::class, 'destroy'])
            ->name('bookings.destroy');
    });
});
