<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockAdditionRequest extends FormRequest
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
        if ($this->has('costPrice')) {
            $data['cost_price'] = $this->input('costPrice');
        }
        if ($this->has('updateCostPrice')) {
            $data['update_cost_price'] = $this->boolean('updateCostPrice');
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
            'cost_price' => 'required|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
            'update_cost_price' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Product is required',
            'product_id.exists' => 'Selected product does not exist',
            'quantity.required' => 'Quantity is required',
            'quantity.min' => 'Quantity must be greater than 0',
            'cost_price.required' => 'Cost price is required',
            'cost_price.min' => 'Cost price cannot be negative',
            'date.required' => 'Date is required',
            'date.date' => 'Please provide a valid date',
        ];
    }
}
