import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useCreateSale, useTodaySales, useUpdateSale } from '@/hooks/useSales'
import { useAIContext } from '@/hooks/useAIContext'
import { saleSchema } from '@/utils/validation'
import { SaleFormData, Product, SaleUnit, Sale } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { ReceiptModal } from '@/components/receipt/ReceiptModal'
import { ShoppingCart, Receipt, Edit2, X } from 'lucide-react'
import { formatCurrency, formatTime, calculateProfit } from '@/utils/format'
import AIChatWidget from '@/components/ai/AIChatWidget'
import { salesService } from '@/services/salesService'

const SalesEntryPage = () => {
  const { data: products, isLoading: productsLoading } = useProducts({ isActive: true })
  const { data: todaySales } = useTodaySales()
  const createSale = useCreateSale()
  const updateSale = useUpdateSale()
  useAIContext() // Keep AI context synced
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [receiptSaleId, setReceiptSaleId] = useState<string | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [editableSales, setEditableSales] = useState<Set<string>>(new Set())
  const [loadingEditability, setLoadingEditability] = useState<Set<string>>(new Set())

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      quantity: 1,
      paymentMethod: 'cash',
    },
  })

  // Check editability for recent sales
  useState(() => {
    if (!todaySales) return
    todaySales.slice(0, 5).forEach(async (sale) => {
      if (loadingEditability.has(sale.id)) return
      setLoadingEditability(prev => new Set(prev).add(sale.id))
      try {
        const result = await salesService.checkSaleEditable(sale.id)
        if (result.editable) {
          setEditableSales(prev => new Set(prev).add(sale.id))
        }
      } catch (e) {
        // Not editable
      } finally {
        setLoadingEditability(prev => {
          const next = new Set(prev)
          next.delete(sale.id)
          return next
        })
      }
    })
  })

  // const productId = watch('productId')
  const unit = watch('unit') as SaleUnit
  const quantity = watch('quantity') || 0

  // Update selected product when productId changes
  const handleProductChange = (productId: string) => {
    const product = products?.find((p) => p.id === productId)
    setSelectedProduct(product || null)
    
    // Auto-select unit based on product
    if (product) {
      setValue('unit', 'bag')
    }
  }

  // Calculate price and total
  let pricePerUnit = 0
  let totalAmount = 0
  let estimatedProfit = 0

  if (selectedProduct && unit) {
    switch (unit) {
      case 'bag':
        pricePerUnit = selectedProduct.sellingPrice
        estimatedProfit = calculateProfit(selectedProduct.sellingPrice, selectedProduct.costPrice)
        break
      case 'cup':
        pricePerUnit = selectedProduct.cupPrice || 0
        if (selectedProduct.cupsPerBag) {
          estimatedProfit = calculateProfit(pricePerUnit, selectedProduct.costPrice / selectedProduct.cupsPerBag)
        }
        break
      case 'bucket':
        pricePerUnit = selectedProduct.bucketPrice || 0
        if (selectedProduct.bucketsPerBag) {
          estimatedProfit = calculateProfit(pricePerUnit, selectedProduct.costPrice / selectedProduct.bucketsPerBag)
        }
        break
    }
    totalAmount = pricePerUnit * quantity
    estimatedProfit = estimatedProfit * quantity
  }

  const onSubmit = async (data: SaleFormData) => {
    console.log('Form submitted with data:', data)
    try {
      if (editingSale) {
        // Update existing sale
        await updateSale.mutateAsync({ id: editingSale.id, ...data })
        setEditingSale(null)
        reset()
        setSelectedProduct(null)
      } else {
        // Create new sale
        const newSale = await createSale.mutateAsync(data)
        reset()
        setSelectedProduct(null)
        
        // Show receipt modal after successful sale
        if (newSale?.id) {
          setReceiptSaleId(newSale.id)
          setShowReceipt(true)
        }
      }
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale)
    // Find and set the product
    const product = products?.find(p => p.id === sale.productId)
    setSelectedProduct(product || null)
    setValue('productId', sale.productId)
    setValue('unit', sale.unit)
    setValue('quantity', sale.quantity)
    setValue('paymentMethod', sale.paymentMethod)
    setValue('description', sale.description || '')
  }

  const handleCancelEdit = () => {
    setEditingSale(null)
    reset()
    setSelectedProduct(null)
  }

  const handleViewReceipt = (saleId: string) => {
    setReceiptSaleId(saleId)
    setShowReceipt(true)
  }

  if (productsLoading) {
    return <Loading message="Loading products..." />
  }

  if (!products || products.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sales Entry</h1>
        <Card>
          <EmptyState
            icon={ShoppingCart}
            title="No products available"
            description="Add products first before recording sales"
            action={{
              label: 'Add Product',
              onClick: () => window.location.href = '/products',
            }}
          />
        </Card>
      </div>
    )
  }

  // Get available units for selected product
  const availableUnits: Array<{ value: SaleUnit; label: string }> = [
    { value: 'bag', label: 'Bag' },
  ]
  
  if (selectedProduct?.isRetailEnabled) {
    if (selectedProduct.cupsPerBag && selectedProduct.cupPrice) {
      availableUnits.push({ value: 'cup', label: 'Cup' })
    }
    if (selectedProduct.bucketsPerBag && selectedProduct.bucketPrice) {
      availableUnits.push({ value: 'bucket', label: 'Bucket' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sales Entry</h1>
        <p className="text-gray-600 mt-1">Record new sales quickly and accurately</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Record Sale</CardTitle>
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
                      label: `${p.name} (Stock: ${p.currentStock})`,
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
                      <Badge variant={selectedProduct.currentStock > 0 ? 'success' : 'danger'}>
                        {selectedProduct.currentStock} bags
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cost Price:</span>
                      <span className="font-medium">{formatCurrency(selectedProduct.costPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Selling Price:</span>
                      <span className="font-medium">{formatCurrency(selectedProduct.sellingPrice)}</span>
                    </div>
                  </div>
                )}

                {/* Unit & Quantity */}
                {selectedProduct && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Unit"
                        options={availableUnits}
                        error={errors.unit?.message}
                        {...register('unit')}
                      />

                      <Input
                        label="Quantity"
                        type="number" step="0.01"
                        min="0.01"
                        placeholder="1"
                        error={errors.quantity?.message}
                        {...register('quantity', { valueAsNumber: true })}
                      />

                    {/* Payment Method */}
                    <Select
                      label="Payment Method"
                      options={[
                        { value: 'cash', label: 'Cash' },
                        { value: 'pos', label: 'POS' },
                        { value: 'bank_transfer', label: 'Bank Transfer' },
                      ]}
                      error={errors.paymentMethod?.message}
                      {...register('paymentMethod')}
                    />

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Notes (Optional)
                      </label>
                      <textarea
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg transition-colors focus-ring focus:border-primary-500 focus:ring-primary-500"
                        rows={2}
                        placeholder="Add any notes about this sale..."
                        {...register('description')}
                      />
                      {errors.description && (
                        <p className="mt-1.5 text-sm text-danger-600">{errors.description.message}</p>
                      )}
                    </div>
                    </div>

                    {/* Price Summary */}
                    {unit && quantity > 0 && (
                      <div className="p-4 bg-primary-50 rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Price per {unit}:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(pricePerUnit)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-lg">
                          <span className="font-medium text-gray-900">Total Amount:</span>
                          <span className="font-bold text-primary-700">
                            {formatCurrency(totalAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-primary-200">
                          <span className="text-sm text-gray-600">Estimated Profit:</span>
                          <span className="font-semibold text-success-600">
                            {formatCurrency(estimatedProfit)}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      isLoading={createSale.isPending || updateSale.isPending}
                      disabled={!selectedProduct || !unit || quantity < 0.01}
                    >
                      {editingSale ? (
                        <>
                          <Edit2 className="w-5 h-5 mr-2" />
                          Update Sale
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Record Sale
                        </>
                      )}
                    </Button>
                    {editingSale && (
                      <Button
                        type="button"
                        variant="outline"
                        fullWidth
                        onClick={handleCancelEdit}
                        className="mt-2"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel Edit
                      </Button>
                    )}
                  </>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Today's Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Today's Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-success-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                  <p className="text-2xl font-bold text-success-700">
                    {formatCurrency(
                      todaySales?.reduce((sum, s) => sum + s.totalAmount, 0) || 0
                    )}
                  </p>
                </div>

                <div className="p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Profit</p>
                  <p className="text-2xl font-bold text-primary-700">
                    {formatCurrency(
                      todaySales?.reduce((sum, s) => sum + s.profit, 0) || 0
                    )}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Sales Count</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {todaySales?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sales */}
          {todaySales && todaySales.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {todaySales.slice(0, 5).map((sale) => (
                    <div
                      key={sale.id}
                      className="p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900 line-clamp-1">
                          {sale.productName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(sale.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <Badge size="sm" variant="info">
                            {sale.quantity} {sale.unit}
                          </Badge>
                          <Badge
                            size="sm"
                            variant={sale.paymentMethod === 'cash' ? 'success' : sale.paymentMethod === 'pos' ? 'info' : 'default'}
                          >
                            {sale.paymentMethod === 'bank_transfer' ? 'Bank' : sale.paymentMethod.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(sale.totalAmount)}
                          </span>
                          {editableSales.has(sale.id) && (
                            <button
                              onClick={() => handleEditSale(sale)}
                              className="text-amber-600 hover:text-amber-700"
                              title="Edit Sale"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewReceipt(sale.id)}
                            className="text-blue-600 hover:text-blue-700"
                            title="View Receipt"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {receiptSaleId && (
        <ReceiptModal
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          saleId={receiptSaleId}
        />
      )}

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  )
}

export default SalesEntryPage


