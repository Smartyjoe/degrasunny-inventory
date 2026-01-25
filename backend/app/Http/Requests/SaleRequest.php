<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Map camelCase to snake_case BEFORE validation
        $data = [];
        
        if ($this->has('productId')) {
            $data['product_id'] = $this->input('productId');
        }
        
        if ($this->has('paymentMethod')) {
            $data['payment_method'] = $this->input('paymentMethod');
        }
        
        if (!empty($data)) {
            $this->merge($data);
        }
    }

    public function rules(): array
    {
        return [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:0.01',
            'unit' => ['required', Rule::in(['bag', 'cup', 'bucket'])],
            'payment_method' => ['required', Rule::in(['cash', 'pos', 'bank_transfer'])],
            'date' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Product is required',
            'product_id.exists' => 'Selected product does not exist',
            'quantity.required' => 'Quantity is required',
            'quantity.min' => 'Quantity must be greater than 0',
            'unit.required' => 'Unit is required',
            'unit.in' => 'Unit must be bag, cup, or bucket',
            'payment_method.required' => 'Payment method is required',
            'payment_method.in' => 'Payment method must be cash, pos, or bank_transfer',
            'date.date' => 'Please provide a valid date',
        ];
    }
}
