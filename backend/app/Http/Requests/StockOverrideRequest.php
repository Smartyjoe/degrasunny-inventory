<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockOverrideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'opening_stock' => 'nullable|numeric|min:0',
            'stock_added' => 'nullable|numeric|min:0',
            'stock_sold' => 'nullable|numeric|min:0',
            'closing_stock' => 'nullable|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'opening_stock.min' => 'Opening stock cannot be negative',
            'stock_added.min' => 'Stock added cannot be negative',
            'stock_sold.min' => 'Stock sold cannot be negative',
            'closing_stock.min' => 'Closing stock cannot be negative',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Map camelCase to snake_case
        $this->merge([
            'opening_stock' => $this->openingStock ?? $this->opening_stock,
            'stock_added' => $this->stockAdded ?? $this->stock_added,
            'stock_sold' => $this->stockSold ?? $this->stock_sold,
            'closing_stock' => $this->closingStock ?? $this->closing_stock,
        ]);
    }
}
