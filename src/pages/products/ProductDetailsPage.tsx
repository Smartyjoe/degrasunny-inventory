import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProduct } from '@/hooks/useProducts'
import { useSales } from '@/hooks/useSales'
import { ArrowLeft, Edit, ShoppingCart } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Spinner'
import ProductFormModal from '@/components/products/ProductFormModal'
import { formatCurrency, formatDateTime, calculateProfit, calculateProfitMargin, getStockStatus } from '@/utils/format'

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showEditModal, setShowEditModal] = useState(false)

  const { data: product, isLoading: productLoading } = useProduct(id!)
  const { data: sales } = useSales({ productId: id })

  if (productLoading) {
    return <Loading message="Loading product..." />
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Product not found</p>
        <Button onClick={() => navigate('/products')} className="mt-4">
          Back to Products
        </Button>
      </div>
    )
  }

  const stockStatus = getStockStatus(product.currentStock, product.reorderLevel)
  const bagProfit = calculateProfit(product.sellingPrice, product.costPrice)
  const profitMargin = calculateProfitMargin(product.sellingPrice, product.costPrice)

  // Calculate retail profits if enabled
  const cupProfit = product.isRetailEnabled && product.cupsPerBag
    ? calculateProfit(product.cupPrice || 0, product.costPrice / product.cupsPerBag)
    : 0
  const bucketProfit = product.isRetailEnabled && product.bucketsPerBag
    ? calculateProfit(product.bucketPrice || 0, product.costPrice / product.bucketsPerBag)
    : 0

  // Calculate sales stats
  const totalSales = sales?.reduce((sum, s) => sum + s.totalAmount, 0) || 0
  const totalProfit = sales?.reduce((sum, s) => sum + s.profit, 0) || 0
  const totalQuantitySold = sales?.reduce((sum, s) => sum + s.quantity, 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/products')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {product.name}
            </h1>
            {product.description && (
              <p className="text-gray-600 mt-1">{product.description}</p>
            )}
          </div>
        </div>
        <Button onClick={() => setShowEditModal(true)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Current Stock</p>
            <p className="text-3xl font-bold text-gray-900">{product.currentStock}</p>
            <Badge
              variant={
                stockStatus === 'healthy'
                  ? 'success'
                  : stockStatus === 'low'
                  ? 'warning'
                  : 'danger'
              }
              className="mt-2"
            >
              {stockStatus === 'healthy' ? 'Good' : stockStatus === 'low' ? 'Low Stock' : 'Out of Stock'}
            </Badge>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Sales</p>
            <p className="text-2xl font-bold text-success-700">
              {formatCurrency(totalSales)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{sales?.length || 0} transactions</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Profit</p>
            <p className="text-2xl font-bold text-primary-700">
              {formatCurrency(totalProfit)}
            </p>
            <p className="text-xs text-gray-500 mt-1">From all sales</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Quantity Sold</p>
            <p className="text-3xl font-bold text-gray-900">{totalQuantitySold}</p>
            <p className="text-xs text-gray-500 mt-1">units</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Bag Pricing */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-3">Bag Pricing</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cost Price:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(product.costPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Selling Price:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(product.sellingPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Profit per Bag:</span>
                    <span className="font-bold text-success-600">
                      {formatCurrency(bagProfit)} ({profitMargin.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Retail Pricing */}
              {product.isRetailEnabled && (
                <div className="p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm font-medium text-primary-900 mb-3">Retail Pricing</p>
                  <div className="space-y-3">
                    {/* Cup Pricing */}
                    {product.cupsPerBag && product.cupPrice && (
                      <div className="p-3 bg-white rounded">
                        <p className="text-xs font-medium text-gray-700 mb-2">Cup</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cups per bag:</span>
                            <span className="font-medium">{product.cupsPerBag}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price per cup:</span>
                            <span className="font-medium">{formatCurrency(product.cupPrice)}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-gray-100">
                            <span className="text-gray-600">Profit per cup:</span>
                            <span className="font-semibold text-success-600">
                              {formatCurrency(cupProfit)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bucket Pricing */}
                    {product.bucketsPerBag && product.bucketPrice && (
                      <div className="p-3 bg-white rounded">
                        <p className="text-xs font-medium text-gray-700 mb-2">Bucket</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Buckets per bag:</span>
                            <span className="font-medium">{product.bucketsPerBag}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price per bucket:</span>
                            <span className="font-medium">{formatCurrency(product.bucketPrice)}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-gray-100">
                            <span className="text-gray-600">Profit per bucket:</span>
                            <span className="font-semibold text-success-600">
                              {formatCurrency(bucketProfit)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stock Settings */}
              <div className="p-4 bg-warning-50 rounded-lg">
                <p className="text-sm font-medium text-warning-900 mb-2">Stock Settings</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reorder Level:</span>
                  <span className="font-semibold text-gray-900">
                    {product.reorderLevel} bags
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {sales && sales.length > 0 ? (
              <div className="space-y-3">
                {sales.slice(0, 10).map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge size="sm" variant="info">
                        {sale.quantity} {sale.unit}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(sale.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(sale.totalAmount)}
                        </p>
                        <p className="text-xs text-success-600">
                          Profit: {formatCurrency(sale.profit)}
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-600">
                        <p>@ {formatCurrency(sale.pricePerUnit)}/{sale.unit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No sales recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <ProductFormModal
          product={product}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  )
}

export default ProductDetailsPage
