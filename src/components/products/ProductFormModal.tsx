import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import { productSchema } from '@/utils/validation'
import { Product, ProductFormData } from '@/types'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ToggleSwitch from '@/components/ui/ToggleSwitch'
import { useState } from 'react'
import { calculateProfit, calculateProfitMargin, formatCurrency } from '@/utils/format'

interface ProductFormModalProps {
  product?: Product
  onClose: () => void
}

const ProductFormModal = ({ product, onClose }: ProductFormModalProps) => {
  const isEditing = !!product
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          costPrice: product.costPrice,
          sellingPrice: product.sellingPrice,
          isRetailEnabled: product.isRetailEnabled,
          cupsPerBag: product.cupsPerBag,
          bucketsPerBag: product.bucketsPerBag,
          cupPrice: product.cupPrice,
          bucketPrice: product.bucketPrice,
          reorderLevel: product.reorderLevel,
        }
      : {
          isRetailEnabled: false,
          reorderLevel: 10,
        },
  })

  // Watch fields for live calculations
  const costPrice = watch('costPrice') || 0
  const sellingPrice = watch('sellingPrice') || 0
  const isRetailEnabled = watch('isRetailEnabled')
  const cupsPerBag = watch('cupsPerBag') || 0
  const bucketsPerBag = watch('bucketsPerBag') || 0
  const cupPrice = watch('cupPrice') || 0
  const bucketPrice = watch('bucketPrice') || 0

  // Calculate profits
  const bagProfit = calculateProfit(sellingPrice, costPrice)
  const bagMargin = calculateProfitMargin(sellingPrice, costPrice)
  const cupProfit = isRetailEnabled && cupsPerBag > 0
    ? calculateProfit(cupPrice, costPrice / cupsPerBag)
    : 0
  const bucketProfit = isRetailEnabled && bucketsPerBag > 0
    ? calculateProfit(bucketPrice, costPrice / bucketsPerBag)
    : 0

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id: product.id, data })
      } else {
        await createProduct.mutateAsync(data)
      }
      onClose()
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditing ? 'Edit Product' : 'Add New Product'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Info */}
        <Input
          label="Product Name"
          placeholder="e.g., Rice (50kg bag)"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Description (Optional)"
          placeholder="Brief product description"
          error={errors.description?.message}
          {...register('description')}
        />

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Cost Price per Bag"
            type="number"
            step="0.01"
            placeholder="25000"
            error={errors.costPrice?.message}
            {...register('costPrice', { valueAsNumber: true })}
          />

          <Input
            label="Selling Price per Bag"
            type="number"
            step="0.01"
            placeholder="30000"
            error={errors.sellingPrice?.message}
            {...register('sellingPrice', { valueAsNumber: true })}
          />
        </div>

        {/* Profit Summary */}
        {costPrice > 0 && sellingPrice > 0 && (
          <div className="p-4 bg-success-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-success-900">
                Profit per Bag:
              </span>
              <span className="text-lg font-bold text-success-700">
                {formatCurrency(bagProfit)} ({bagMargin.toFixed(1)}%)
              </span>
            </div>
          </div>
        )}

        {/* Retail Toggle */}
        <ToggleSwitch
          label="Enable Retail Sales"
          description="Allow cup and bucket sales"
          {...register('isRetailEnabled')}
        />

        {/* Retail Configuration */}
        {isRetailEnabled && (
          <div className="space-y-4 p-4 border border-primary-200 rounded-lg bg-primary-50">
            <h4 className="font-semibold text-gray-900">Retail Configuration</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Cups per Bag"
                type="number"
                placeholder="100"
                error={errors.cupsPerBag?.message}
                {...register('cupsPerBag', { valueAsNumber: true })}
              />

              <Input
                label="Price per Cup"
                type="number"
                step="0.01"
                placeholder="350"
                error={errors.cupPrice?.message}
                {...register('cupPrice', { valueAsNumber: true })}
              />

              <Input
                label="Buckets per Bag"
                type="number"
                placeholder="10"
                error={errors.bucketsPerBag?.message}
                {...register('bucketsPerBag', { valueAsNumber: true })}
              />

              <Input
                label="Price per Bucket"
                type="number"
                step="0.01"
                placeholder="3200"
                error={errors.bucketPrice?.message}
                {...register('bucketPrice', { valueAsNumber: true })}
              />
            </div>

            {/* Retail Profit Summary */}
            {cupsPerBag > 0 && cupPrice > 0 && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-white rounded">
                  <span className="text-gray-600">Cup Profit: </span>
                  <span className="font-semibold text-success-600">
                    {formatCurrency(cupProfit)}
                  </span>
                </div>
                {bucketsPerBag > 0 && bucketPrice > 0 && (
                  <div className="p-2 bg-white rounded">
                    <span className="text-gray-600">Bucket Profit: </span>
                    <span className="font-semibold text-success-600">
                      {formatCurrency(bucketProfit)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Reorder Level */}
        <Input
          label="Reorder Level"
          type="number"
          placeholder="10"
          helperText="You'll be alerted when stock reaches this level"
          error={errors.reorderLevel?.message}
          {...register('reorderLevel', { valueAsNumber: true })}
        />

        <ModalFooter>
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createProduct.isPending || updateProduct.isPending}
          >
            {isEditing ? 'Update' : 'Create'} Product
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}

export default ProductFormModal
