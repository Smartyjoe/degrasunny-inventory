import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSales, useUpdateSale } from '@/hooks/useSales'
import { useProducts } from '@/hooks/useProducts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { ReceiptModal } from '@/components/receipt/ReceiptModal'
import { BarChart3, Download, Edit2, Receipt, Search, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate, formatTime, formatQuantityDisplay } from '@/utils/format'
import { Sale, SaleFormData, Product } from '@/types'
import toast from 'react-hot-toast'

const SalesRecordsPage = () => {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  
  const { data: sales, isLoading } = useSales({ startDate, endDate })
  const { data: products } = useProducts({ isActive: true })
  const updateSale = useUpdateSale()

  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [receiptSaleId, setReceiptSaleId] = useState<string | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<SaleFormData>()

  const unit = watch('unit')
  const quantity = watch('quantity')
  const pricePerUnit = selectedProduct && unit && quantity > 0
    ? unit === 'bag'
      ? selectedProduct.sellingPrice
      : unit === 'cup'
      ? (selectedProduct.cupPrice || (selectedProduct.sellingPrice / (selectedProduct.cupsPerBag || 1)))
      : (selectedProduct.bucketPrice || (selectedProduct.sellingPrice / (selectedProduct.bucketsPerBag || 1)))
    : 0
  const totalAmount = pricePerUnit * quantity

  // Filter sales
  const filteredSales = sales?.filter(sale => {
    const matchesSearch = searchTerm === '' || 
      sale.productName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPayment = paymentFilter === 'all' || sale.paymentMethod === paymentFilter
    return matchesSearch && matchesPayment
  }) || []

  // Calculate summary statistics
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.profit, 0)
  const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0)
  const salesCount = filteredSales.length

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale)
    const product = products?.find(p => p.id === sale.productId)
    setSelectedProduct(product || null)
    
    setValue('productId', sale.productId)
    setValue('unit', sale.unit)
    setValue('quantity', sale.quantity)
    setValue('paymentMethod', sale.paymentMethod)
    setValue('description', sale.description || '')
    
    setShowEditModal(true)
  }

  const handleUpdateSale = async (data: SaleFormData) => {
    if (!editingSale) return

    try {
      await updateSale.mutateAsync({ id: editingSale.id, data })
      setShowEditModal(false)
      setEditingSale(null)
      reset()
      setSelectedProduct(null)
      toast.success('Sale updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update sale')
    }
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingSale(null)
    reset()
    setSelectedProduct(null)
  }

  const handleViewReceipt = (saleId: string) => {
    setReceiptSaleId(saleId)
    setShowReceipt(true)
  }

  const handleExport = () => {
    // Simple CSV export
    const headers = ['Date', 'Time', 'Product', 'Quantity', 'Unit', 'Price/Unit', 'Total', 'Profit', 'Payment', 'Description']
    const rows = filteredSales.map(sale => [
      sale.date,
      formatTime(sale.createdAt),
      sale.productName,
      sale.quantity,
      sale.unit,
      sale.pricePerUnit,
      sale.totalAmount,
      sale.profit,
      sale.paymentMethod,
      sale.description || ''
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-records-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Sales records exported')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Records</h1>
          <p className="text-gray-600 mt-1">Comprehensive sales history and analytics</p>
        </div>
        <Button
          onClick={handleExport}
          variant="secondary"
          disabled={salesCount === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-lg mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Profit</p>
            <p className="text-2xl font-bold text-success-600">{formatCurrency(totalProfit)}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{salesCount}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Items Sold</p>
            <p className="text-2xl font-bold text-gray-900">{formatQuantityDisplay(totalQuantity)}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Product
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <Select
              label="Payment Method"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Methods' },
                { value: 'cash', label: 'Cash' },
                { value: 'pos', label: 'POS' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No sales records found</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters or date range</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date & Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Price/Unit</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Profit</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Payment</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{formatDate(sale.date)}</p>
                          <p className="text-xs text-gray-500">{formatTime(sale.createdAt)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{sale.productName}</p>
                          {sale.description && (
                            <p className="text-xs text-gray-500 italic mt-1">{sale.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="info" size="sm">
                          {formatQuantityDisplay(sale.quantity)} {sale.unit}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900">
                        {formatCurrency(sale.pricePerUnit)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(sale.totalAmount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-semibold text-success-600">
                          {formatCurrency(sale.profit)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            sale.paymentMethod === 'cash' ? 'success' :
                            sale.paymentMethod === 'pos' ? 'info' : 'default'
                          }
                          size="sm"
                        >
                          {sale.paymentMethod === 'cash' ? 'Cash' :
                           sale.paymentMethod === 'pos' ? 'POS' : 'Transfer'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {sale.canEdit && (
                            <button
                              onClick={() => handleEditSale(sale)}
                              className="text-amber-600 hover:text-amber-700 transition-colors"
                              title="Edit Sale"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewReceipt(sale.id)}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                            title="View Receipt"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Sale Modal */}
      <Modal isOpen={showEditModal} onClose={handleCloseEditModal} title="Edit Sale">
        <form onSubmit={handleSubmit(handleUpdateSale)} className="space-y-4 p-6">
          {/* Product - Read only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <input
              type="text"
              value={selectedProduct?.name || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          {/* Unit & Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Unit"
              options={selectedProduct ? [
                { value: 'bag', label: 'Bag' },
                ...(selectedProduct.isRetailEnabled && selectedProduct.cupsPerBag ? [{ value: 'cup', label: 'Cup' }] : []),
                ...(selectedProduct.isRetailEnabled && selectedProduct.bucketsPerBag ? [{ value: 'bucket', label: 'Bucket' }] : []),
              ] : []}
              error={errors.unit?.message}
              {...register('unit')}
            />

            <Input
              label="Quantity"
              type="number"
              step="0.01"
              min="0.01"
              error={errors.quantity?.message}
              {...register('quantity', { valueAsNumber: true })}
            />
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows={2}
              placeholder="Add a note about this sale..."
              maxLength={1000}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Price Summary */}
          {unit && quantity > 0 && (
            <div className="p-4 bg-primary-50 rounded-lg space-y-2">
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
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseEditModal} fullWidth>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={updateSale.isPending}
              disabled={!selectedProduct || !unit || quantity < 0.01}
            >
              Update Sale
            </Button>
          </div>
        </form>
      </Modal>

      {/* Receipt Modal */}
      {receiptSaleId && (
        <ReceiptModal
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          saleId={receiptSaleId}
        />
      )}
    </div>
  )
}

export default SalesRecordsPage
