<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', fn (): array => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'role' => $this->user->role,
            ]),
            'travel_package_id' => $this->travel_package_id,
            'booking_date' => $this->booking_date?->toDateString(),
            'number_of_guests' => $this->number_of_guests,
            'total_amount' => $this->total_amount,
            'status' => $this->status,
            'travel_package' => new TravelPackageResource($this->whenLoaded('travelPackage')),
            'payment' => new PaymentResource($this->whenLoaded('payment')),
        ];
    }
}
