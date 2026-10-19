<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaymentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $this->authenticatedUser($request);

        return PaymentResource::collection(
            $this->visiblePayments($user)
                ->orderBy('id')
                ->paginate(min(max($request->integer('per_page', 10), 1), 50))
                ->withQueryString(),
        );
    }

    public function store(StorePaymentRequest $request): JsonResponse
    {
        $payment = Payment::create($request->validated());

        return (new PaymentResource($payment->load(['booking.user', 'booking.travelPackage'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, Payment $payment): PaymentResource
    {
        $user = $this->authenticatedUser($request);
        $visiblePayment = $this->visiblePayments($user)
            ->findOrFail($payment->getKey());

        return new PaymentResource($visiblePayment);
    }

    public function update(UpdatePaymentRequest $request, Payment $payment): PaymentResource
    {
        $payment->update($request->validated());

        return new PaymentResource($payment->refresh()->load(['booking.user', 'booking.travelPackage']));
    }

    public function destroy(Payment $payment): JsonResponse
    {
        $payment->delete();

        return response()->json(status: 204);
    }

    private function visiblePayments(User $user): Builder
    {
        return Payment::query()
            ->with(['booking.user', 'booking.travelPackage'])
            ->when(
                ! $user->isAdmin(),
                fn (Builder $query) => $query->whereHas(
                    'booking',
                    fn (Builder $bookingQuery) => $bookingQuery->where('user_id', $user->getKey()),
                ),
            );
    }

    private function authenticatedUser(Request $request): User
    {
        $user = $request->user();

        abort_unless($user instanceof User, 401);

        return $user;
    }
}
