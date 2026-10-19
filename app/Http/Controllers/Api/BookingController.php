<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexBookingRequest;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Http\Requests\UpdateBookingStatusRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    public function index(IndexBookingRequest $request): AnonymousResourceCollection
    {
        $user = $this->authenticatedUser($request);
        $filters = $request->validated();
        $query = $this->visibleBookings($user)->with(['user', 'travelPackage', 'payment']);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $query) use ($search): void {
                if (is_numeric($search)) {
                    $query->where('id', (int) $search);
                }

                $query->orWhereHas('user', function (Builder $userQuery) use ($search): void {
                    $userQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('travelPackage', function (Builder $packageQuery) use ($search): void {
                    $packageQuery->where('title', 'like', "%{$search}%")
                        ->orWhere('destination', 'like', "%{$search}%");
                });
            });
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('booking_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('booking_date', '<=', $filters['date_to']);
        }

        return BookingResource::collection(
            $query->orderBy('booking_date')->orderBy('id')
                ->paginate($filters['per_page'] ?? 10)
                ->withQueryString(),
        );
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $user = $this->authenticatedUser($request);
        $attributes = $request->validated();
        $numberOfGuests = $attributes['number_of_guests'];
        $booking = DB::transaction(function () use ($attributes, $numberOfGuests, $user): Booking {
            $travelPackage = TravelPackage::query()
                ->whereKey($attributes['travel_package_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $this->ensurePackageCanBeBooked($travelPackage, $numberOfGuests);

            $travelPackage->decrement('availability', $numberOfGuests);

            $booking = Booking::create([
                'user_id' => $user->isAdmin() ? $attributes['user_id'] : $user->getKey(),
                'travel_package_id' => $travelPackage->getKey(),
                'booking_date' => $attributes['booking_date'],
                'number_of_guests' => $numberOfGuests,
                'special_request' => $attributes['special_request'] ?? null,
                'total_amount' => $this->calculateTotalAmount($travelPackage, $numberOfGuests),
                'status' => 'Pending',
            ]);

            return $booking->load(['user', 'travelPackage', 'payment']);
        });

        return (new BookingResource($booking))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, Booking $booking): BookingResource
    {
        $user = $this->authenticatedUser($request);
        $visibleBooking = $this->visibleBookings($user)
            ->with(['user', 'travelPackage', 'payment'])
            ->findOrFail($booking->getKey());

        return new BookingResource($visibleBooking);
    }

    public function cancel(Request $request, Booking $booking): BookingResource
    {
        $user = $this->authenticatedUser($request);

        $cancelledBooking = DB::transaction(function () use ($booking, $user): Booking {
            $booking = Booking::query()->lockForUpdate()->findOrFail($booking->getKey());

            abort_unless($booking->user_id === $user->getKey(), 403);

            if ($booking->status !== 'Pending') {
                throw ValidationException::withMessages([
                    'status' => 'Only pending bookings can be cancelled.',
                ]);
            }

            $travelPackage = TravelPackage::query()
                ->whereKey($booking->travel_package_id)
                ->lockForUpdate()
                ->firstOrFail();

            $travelPackage->increment('availability', $booking->number_of_guests);
            $booking->status = 'Cancelled';
            $booking->save();

            return $booking->refresh()->load(['user', 'travelPackage', 'payment']);
        });

        return new BookingResource($cancelledBooking);
    }

    public function update(UpdateBookingRequest $request, Booking $booking): BookingResource
    {
        $user = $this->authenticatedUser($request);
        $attributes = $request->validated();

        $updatedBooking = DB::transaction(function () use ($attributes, $booking, $user): Booking {
            $booking = $this->visibleBookings($user)
                ->lockForUpdate()
                ->findOrFail($booking->getKey());

            if ($booking->status !== 'Pending') {
                throw ValidationException::withMessages([
                    'status' => 'Only pending bookings can be edited.',
                ]);
            }

            $currentPackageId = $booking->travel_package_id;
            $targetPackageId = $attributes['travel_package_id'] ?? $currentPackageId;
            $numberOfGuests = $attributes['number_of_guests'] ?? $booking->number_of_guests;
            $packages = TravelPackage::query()
                ->whereIn('id', array_unique([$currentPackageId, $targetPackageId]))
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $currentPackage = $packages->get($currentPackageId);
            $targetPackage = $packages->get($targetPackageId);

            if ($currentPackage === null || $targetPackage === null) {
                abort(404);
            }

            if ($currentPackageId === $targetPackageId) {
                $guestDifference = $numberOfGuests - $booking->number_of_guests;

                if ($guestDifference > 0) {
                    $this->ensurePackageCanBeBooked($targetPackage, $guestDifference);
                    $targetPackage->decrement('availability', $guestDifference);
                } elseif ($guestDifference < 0) {
                    $targetPackage->increment('availability', abs($guestDifference));
                }
            } else {
                $this->ensurePackageCanBeBooked($targetPackage, $numberOfGuests);
                $currentPackage->increment('availability', $booking->number_of_guests);
                $targetPackage->decrement('availability', $numberOfGuests);
            }

            $booking->fill([
                ...$attributes,
                'number_of_guests' => $numberOfGuests,
                'total_amount' => $this->calculateTotalAmount($targetPackage, $numberOfGuests),
            ]);

            if (! $user->isAdmin()) {
                $booking->user_id = $user->getKey();
            }

            $booking->save();

            return $booking->refresh()->load(['user', 'travelPackage', 'payment']);
        });

        return new BookingResource($updatedBooking);
    }

    public function updateStatus(UpdateBookingStatusRequest $request, Booking $booking): BookingResource
    {
        $user = $this->authenticatedUser($request);
        $nextStatus = $request->validated('status');

        $updatedBooking = DB::transaction(function () use ($booking, $nextStatus, $user): Booking {
            $booking = $this->visibleBookings($user)
                ->lockForUpdate()
                ->findOrFail($booking->getKey());

            $isValidTransition = match ($nextStatus) {
                'Approved' => $user->isAdmin() && $booking->status === 'Pending',
                'Completed' => $user->isAdmin() && $booking->status === 'Approved',
                'Cancelled' => $booking->status === 'Pending',
                default => false,
            };

            if (in_array($nextStatus, ['Approved', 'Completed'], true) && ! $user->isAdmin()) {
                abort(403);
            }

            if (! $isValidTransition) {
                throw ValidationException::withMessages([
                    'status' => 'The requested booking status transition is not allowed.',
                ]);
            }

            if ($nextStatus === 'Cancelled') {
                $travelPackage = TravelPackage::query()
                    ->whereKey($booking->travel_package_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $travelPackage->increment('availability', $booking->number_of_guests);
            }

            $booking->status = $nextStatus;
            $booking->save();

            return $booking->refresh()->load(['user', 'travelPackage', 'payment']);
        });

        return new BookingResource($updatedBooking);
    }

    public function destroy(Booking $booking): JsonResponse
    {
        DB::transaction(function () use ($booking): void {
            $booking = Booking::query()->lockForUpdate()->findOrFail($booking->getKey());

            if (in_array($booking->status, ['Pending', 'Approved'], true)) {
                $travelPackage = TravelPackage::query()
                    ->whereKey($booking->travel_package_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $travelPackage->increment('availability', $booking->number_of_guests);
            }

            $booking->delete();
        });

        return response()->json(status: 204);
    }

    private function visibleBookings(User $user): Builder
    {
        return Booking::query()->when(
            ! $user->isAdmin(),
            fn (Builder $query) => $query->where('user_id', $user->getKey()),
        );
    }

    private function authenticatedUser(Request $request): User
    {
        $user = $request->user();

        abort_unless($user instanceof User, 401);

        return $user;
    }

    private function ensurePackageCanBeBooked(TravelPackage $travelPackage, int $numberOfGuests): void
    {
        if ($travelPackage->status !== 'active') {
            throw ValidationException::withMessages([
                'travel_package_id' => 'The selected travel package is not available for booking.',
            ]);
        }

        if ($travelPackage->availability < $numberOfGuests) {
            throw ValidationException::withMessages([
                'number_of_guests' => 'There are not enough available spaces for this booking.',
            ]);
        }
    }

    private function calculateTotalAmount(TravelPackage $travelPackage, int $numberOfGuests): string
    {
        $priceInCents = (int) round((float) $travelPackage->price * 100);

        if ($priceInCents > intdiv(9_999_999_999, $numberOfGuests)) {
            throw ValidationException::withMessages([
                'number_of_guests' => 'The calculated booking amount exceeds the supported limit.',
            ]);
        }

        $totalInCents = $priceInCents * $numberOfGuests;

        return sprintf('%d.%02d', intdiv($totalInCents, 100), $totalInCents % 100);
    }
}
