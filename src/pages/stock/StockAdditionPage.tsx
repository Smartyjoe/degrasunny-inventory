import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useAddStock, useStockAdditions } from '@/hooks/useStock'
import { stockAdditionSchema } from '@/utils/validation'
import { Product } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { Plus, Package } from 'lucide-react'
import { formatCurrency, formatDate, getTodayDate } from '@/utils/format'

type StockAdditionFormData = {
  productId: string
  quantity: number
  costPrice: number
  notes?: string
}

const StockAdditionPage = () => {
  const { data: products, isLoading: productsLoading } = useProducts({ isActive: true })
  const { data: recentAdditions } = useStockAdditions()
  const addStock = useAddStock()
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<StockAdditionFormData>({
    resolver: zodResolver(stockAdditionSchema),
    defaultValues: {
      quantity: 1,
    },
  })

  const quantity = watch('quantity') || 0
  const costPrice = watch('costPrice') || 0
  const totalCost = quantity * costPrice

  const handleProductChange = (productId: string) => {
    const product = products?.find((p) => p.id === productId)
    setSelectedProduct(product || null)
    
    // Auto-fill cost price from product
    if (product) {
      reset({
        productId,
        quantity: 1,
        costPrice: product.costPrice,
      })
    }
  }

  const onSubmit = async (data: StockAdditionFormData) => {
    try {
      const product = products?.find(p => p.id === data.productId)
      await addStock.mutateAsync({
        productId: data.productId,
        productName: product?.name || 'Unknown Product',
        quantity: data.quantity,
        costPrice: data.costPrice,
        date: getTodayDate(),
        notes: data.notes,
        createdAt: new Date().toISOString(),
      })
      reset()
      setSelectedProduct(null)
    } catch (error) {
      // Error handled by mutation
    }
  }

  if (productsLoading) {
    return <Loading message="Loading products..." />
  }

  if (!products || products.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add Stock</h1>
        <Card>
          <EmptyState
            icon={Package}
            title="No products available"
            description="Add products first before adding stock"
            action={{
              label: 'Add Product',
              onClick: () => window.location.href = '/products',
            }}
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add Stock</h1>
        <p className="text-gray-600 mt-1">Increase your inventory levels</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Addition Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Add Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Product Selection */}
                <Select
                  label="Select Product"
                  options={[
                    { value: '', label: '-- Select a product --' },
                    ...products.map((p) => ({
                      value: p.id,
                      label: `${p.name} (Current: ${p.currentStock})`,
                    })),
                  ]}
                  error={errors.productId?.message}
                  {...register('productId', {
                    onChange: (e) => handleProductChange(e.target.value),
                  })}
                />

                {/* Product Info */}
                {selectedProduct && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Stock:</span>
                      <Badge variant="info">
                        {selectedProduct.currentStock} bags
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Cost Price:</span>
                      <span className="font-medium">{formatCurrency(selectedProduct.costPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Reorder Level:</span>
                      <span className="font-medium">{selectedProduct.reorderLevel} bags</span>
                    </div>
                  </div>
                )}

                {/* Quantity & Cost */}
                {selectedProduct && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Quantity (Bags)"
                        type="number"
                        min="1"
                        placeholder="10"
                        error={errors.quantity?.message}
                        {...register('quantity', { valueAsNumber: true })}
                      />

                      <Input
                        label="Cost Price per Bag"
                        type="number"
                        step="0.01"
                        placeholder="25000"
                        error={errors.costPrice?.message}
                        {...register('costPrice', { valueAsNumber: true })}
                      />
                    </div>

                    {/* Notes */}
                    <Input
                      label="Notes (Optional)"
                      placeholder="e.g., Restocked from main supplier"
                      error={errors.notes?.message}
                      {...register('notes')}
                    />

                    {/* Cost Summary */}
                    {quantity > 0 && costPrice > 0 && (
                      <div className="p-4 bg-primary-50 rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <span className="font-semibold text-gray-900">
                            {quantity} bags
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Cost per bag:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(costPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-primary-200">
                          <span className="font-medium text-gray-900">Total Cost:</span>
                          <span className="text-xl font-bold text-primary-700">
                            {formatCurrency(totalCost)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>New Stock Level:</span>
                          <span className="font-semibold text-success-600">
                            {selectedProduct.currentStock + quantity} bags
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      isLoading={addStock.isPending}
                      disabled={!selectedProduct || quantity < 1 || costPrice <= 0}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Stock
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Recent Additions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Additions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAdditions && recentAdditions.length > 0 ? (
                <div className="space-y-3">
                  {recentAdditions.slice(0, 10).map((addition) => {
                    const product = products.find((p) => p.id === addition.productId)
                    return (
                      <div
                        key={addition.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-gray-900 line-clamp-2">
                            {product?.name || 'Unknown Product'}
                          </span>
                          <Badge size="sm" variant="success">
                            +{addition.quantity}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-600">
                          <span>{formatDate(addition.date)}</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(addition.totalCost)}
                          </span>
                        </div>
                        {addition.notes && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {addition.notes}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Package}
                  title="No additions yet"
                  description="Stock additions will appear here"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StockAdditionPage
