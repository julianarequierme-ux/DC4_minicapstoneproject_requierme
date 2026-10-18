<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => [
                Rule::requiredIf($this->user()?->isAdmin()),
                Rule::prohibitedIf(! $this->user()?->isAdmin()),
                'integer',
                'exists:users,id',
            ],
            'travel_package_id' => ['required', 'integer', 'exists:travel_packages,id'],
            'booking_date' => ['required', 'date'],
            'number_of_guests' => ['required', 'integer', 'min:1'],
        ];
    }
}
