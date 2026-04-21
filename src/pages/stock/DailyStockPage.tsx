import { useState } from 'react'
import { useProducts } from '@/hooks/useProducts'
import { useDailyStock } from '@/hooks/useStock'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { Box, Calendar } from 'lucide-react'
import { formatDate, getTodayDate, getStockStatus } from '@/utils/format'
import { cn } from '@/utils/cn'

const DailyStockPage = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  
  const { data: products, isLoading: productsLoading } = useProducts({ isActive: true })
  const { data: dailyStocks, isLoading: stocksLoading } = useDailyStock(selectedDate)

  if (productsLoading || stocksLoading) {
    return <Loading message="Loading daily stock..." />
  }

  if (!products || products.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Daily Stock</h1>
        <Card>
          <EmptyState
            icon={Box}
            title="No products available"
            description="Add products first to track daily stock"
            action={{
              label: 'Add Product',
              onClick: () => window.location.href = '/products',
            }}
          />
        </Card>
      </div>
    )
  }

  // Merge products with daily stock data from backend
  // Backend now calculates from transactions if no ledger exists
  const stockData = products.map((product) => {
    const dailyStock = dailyStocks?.find((ds) => ds.productId === product.id)
    
    return {
      product,
      openingStock: dailyStock?.openingStock ?? 0,
      stockAdded: dailyStock?.stockAdded ?? 0,
      stockSold: dailyStock?.stockSold ?? 0,
      closingStock: dailyStock?.closingStock ?? product.currentStock,
    }
  })

  const totalOpeningStock = stockData.reduce((sum, item) => sum + item.openingStock, 0)
  const totalStockAdded = stockData.reduce((sum, item) => sum + item.stockAdded, 0)
  const totalStockSold = stockData.reduce((sum, item) => sum + item.stockSold, 0)
  const totalClosingStock = stockData.reduce((sum, item) => sum + item.closingStock, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Daily Stock</h1>
          <p className="text-gray-600 mt-1">Track your daily inventory movements</p>
        </div>
        
        <div className="w-full sm:w-auto">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={getTodayDate()}
            icon={<Calendar className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Opening Stock</p>
            <p className="text-2xl font-bold text-gray-900">{totalOpeningStock}</p>
            <p className="text-xs text-gray-500 mt-1">bags</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Stock Added</p>
            <p className="text-2xl font-bold text-success-600">+{totalStockAdded}</p>
            <p className="text-xs text-gray-500 mt-1">bags</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Stock Sold</p>
            <p className="text-2xl font-bold text-danger-600">-{totalStockSold}</p>
            <p className="text-xs text-gray-500 mt-1">bags</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Closing Stock</p>
            <p className="text-2xl font-bold text-primary-600">{totalClosingStock}</p>
            <p className="text-xs text-gray-500 mt-1">bags</p>
          </div>
        </Card>
      </div>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movement - {formatDate(selectedDate)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Product
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Opening
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Added
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Sold
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Closing
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {stockData.map((item) => {
                  const status = getStockStatus(item.closingStock, item.product.reorderLevel)
                  
                  return (
                    <tr
                      key={item.product.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-xs text-gray-500">
                            Reorder at: {item.product.reorderLevel}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-medium text-gray-900">
                          {item.openingStock}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={cn(
                          'font-medium',
                          item.stockAdded > 0 ? 'text-success-600' : 'text-gray-400'
                        )}>
                          {item.stockAdded > 0 ? `+${item.stockAdded}` : '-'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={cn(
                          'font-medium',
                          item.stockSold > 0 ? 'text-danger-600' : 'text-gray-400'
                        )}>
                          {item.stockSold > 0 ? `-${item.stockSold}` : '-'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-gray-900">
                          {item.closingStock}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge
                          variant={
                            status === 'healthy'
                              ? 'success'
                              : status === 'low'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {status === 'healthy' ? 'Good' : status === 'low' ? 'Low' : 'Out'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DailyStockPage
