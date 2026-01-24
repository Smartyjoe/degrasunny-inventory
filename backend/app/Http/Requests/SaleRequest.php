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

    public function rules(): array
    {
        return [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric|min:0.01',
            'unit' => ['required', Rule::in(['bag', 'cup', 'bucket'])],
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
            'date.date' => 'Please provide a valid date',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Map camelCase to snake_case
        $this->merge([
            'product_id' => $this->productId ?? $this->product_id,
        ]);
    }
}
