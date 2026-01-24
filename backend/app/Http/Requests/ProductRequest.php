<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Map camelCase to snake_case BEFORE validation
        $data = [];
        
        if ($this->has('costPrice')) {
            $data['cost_price'] = $this->input('costPrice');
        }
        if ($this->has('sellingPrice')) {
            $data['selling_price'] = $this->input('sellingPrice');
        }
        if ($this->has('isRetailEnabled')) {
            $data['is_retail_enabled'] = $this->boolean('isRetailEnabled');
        }
        if ($this->has('cupsPerBag')) {
            $data['cups_per_bag'] = $this->input('cupsPerBag');
        }
        if ($this->has('bucketsPerBag')) {
            $data['buckets_per_bag'] = $this->input('bucketsPerBag');
        }
        if ($this->has('cupPrice')) {
            $data['cup_price'] = $this->input('cupPrice');
        }
        if ($this->has('bucketPrice')) {
            $data['bucket_price'] = $this->input('bucketPrice');
        }
        if ($this->has('reorderLevel')) {
            $data['reorder_level'] = $this->input('reorderLevel');
        }
        
        if (!empty($data)) {
            $this->merge($data);
        }
    }

    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'cost_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'is_retail_enabled' => 'boolean',
            'cups_per_bag' => 'nullable|integer|min:1',
            'buckets_per_bag' => 'nullable|integer|min:1',
            'cup_price' => 'nullable|numeric|min:0',
            'bucket_price' => 'nullable|numeric|min:0',
            'reorder_level' => 'required|numeric|min:0',
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
            'cost_price.required' => 'Cost price is required',
            'cost_price.min' => 'Cost price cannot be negative',
            'selling_price.required' => 'Selling price is required',
            'selling_price.min' => 'Selling price cannot be negative',
            'reorder_level.required' => 'Reorder level is required',
            'reorder_level.min' => 'Reorder level cannot be negative',
        ];
    }
}
