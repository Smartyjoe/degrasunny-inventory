<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockOverrideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Map camelCase to snake_case BEFORE validation
        $data = [];
        
        if ($this->has('openingStock')) {
            $data['opening_stock'] = $this->input('openingStock');
        }
        if ($this->has('stockAdded')) {
            $data['stock_added'] = $this->input('stockAdded');
        }
        if ($this->has('stockSold')) {
            $data['stock_sold'] = $this->input('stockSold');
        }
        if ($this->has('closingStock')) {
            $data['closing_stock'] = $this->input('closingStock');
        }
        
        if (!empty($data)) {
            $this->merge($data);
        }
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
}
