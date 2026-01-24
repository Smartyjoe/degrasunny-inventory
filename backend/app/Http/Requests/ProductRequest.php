<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'costPrice' => 'required|numeric|min:0',
            'sellingPrice' => 'required|numeric|min:0',
            'isRetailEnabled' => 'boolean',
            'cupsPerBag' => 'nullable|integer|min:1',
            'bucketsPerBag' => 'nullable|integer|min:1',
            'cupPrice' => 'nullable|numeric|min:0',
            'bucketPrice' => 'nullable|numeric|min:0',
            'reorderLevel' => 'required|numeric|min:0',
        ];

        // Unique name validation (except for current product on update)
        if ($this->isMethod('POST')) {
            $rules['name'] .= '|unique:products,name';
        } elseif ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['name'] .= '|unique:products,name,' . $this->route('product')->id;
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required',
            'name.unique' => 'A product with this name already exists',
            'costPrice.required' => 'Cost price is required',
            'costPrice.min' => 'Cost price cannot be negative',
            'sellingPrice.required' => 'Selling price is required',
            'sellingPrice.min' => 'Selling price cannot be negative',
            'reorderLevel.required' => 'Reorder level is required',
            'reorderLevel.min' => 'Reorder level cannot be negative',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Map camelCase to snake_case
        $this->merge([
            'cost_price' => $this->costPrice ?? $this->cost_price,
            'selling_price' => $this->sellingPrice ?? $this->selling_price,
            'is_retail_enabled' => $this->isRetailEnabled ?? $this->is_retail_enabled ?? false,
            'cups_per_bag' => $this->cupsPerBag ?? $this->cups_per_bag,
            'buckets_per_bag' => $this->bucketsPerBag ?? $this->buckets_per_bag,
            'cup_price' => $this->cupPrice ?? $this->cup_price,
            'bucket_price' => $this->bucketPrice ?? $this->bucket_price,
            'reorder_level' => $this->reorderLevel ?? $this->reorder_level,
        ]);
    }
}
