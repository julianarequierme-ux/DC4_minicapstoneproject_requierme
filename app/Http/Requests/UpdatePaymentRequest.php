<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'booking_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:bookings,id',
                Rule::unique('payments', 'booking_id')->ignore($this->route('payment')),
            ],
            'amount' => ['sometimes', 'required', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99'],
            'payment_method' => ['sometimes', 'required', 'string', 'max:50'],
            'payment_status' => ['sometimes', 'required', 'string', 'max:50'],
            'paid_at' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
