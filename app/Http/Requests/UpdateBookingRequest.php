<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookingRequest extends FormRequest
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
                'sometimes',
                Rule::prohibitedIf(! $this->user()?->isAdmin()),
                'integer',
                'exists:users,id',
            ],
            'travel_package_id' => ['sometimes', 'required', 'integer', 'exists:travel_packages,id'],
            'booking_date' => ['sometimes', 'required', 'date'],
            'number_of_guests' => ['sometimes', 'required', 'integer', 'min:1'],
        ];
    }
}
