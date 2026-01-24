import { useDashboardStats } from '@/hooks/useDashboard'
import { useProducts } from '@/hooks/useProducts'
import { useTodaySales } from '@/hooks/useSales'
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle,
  Package,
  ArrowRight
} from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Loading } from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { formatCurrency, formatTime, getStockStatus } from '@/utils/format'
import { useNavigate } from 'react-router-dom'

const DashboardPage = () => {
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: lowStockProducts, isLoading: productsLoading } = useProducts({ lowStock: true })
  const { data: todaySales, isLoading: salesLoading } = useTodaySales()

  if (statsLoading) {
    return <Loading message="Loading dashboard..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats?.todaySales || 0)}
          icon={DollarSign}
          iconColor="text-success-600"
          iconBgColor="bg-success-100"
        />
        
        <StatCard
          title="Today's Profit"
          value={formatCurrency(stats?.todayProfit || 0)}
          icon={TrendingUp}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-100"
        />
        
        <StatCard
          title="Sales Count"
          value={stats?.todaySalesCount || 0}
          icon={ShoppingCart}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        
        <StatCard
          title="Low Stock Alerts"
          value={stats?.lowStockCount || 0}
          icon={AlertTriangle}
          iconColor="text-warning-600"
          iconBgColor="bg-warning-100"
          onClick={() => navigate('/products?filter=lowStock')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Sales</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/sales')}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading sales...</p>
              </div>
            ) : todaySales && todaySales.length > 0 ? (
              <div className="space-y-3">
                {todaySales.slice(0, 5).map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{sale.productName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge size="sm" variant="info">
                          {sale.quantity} {sale.unit}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTime(sale.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(sale.totalAmount)}
                      </p>
                      <p className="text-xs text-success-600">
                        +{formatCurrency(sale.profit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ShoppingCart}
                title="No sales today"
                description="Start recording sales to see them here"
                action={{
                  label: 'Record Sale',
                  onClick: () => navigate('/sales'),
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Low Stock Alerts</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/products')}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : lowStockProducts && lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => {
                  const status = getStockStatus(product.currentStock, product.reorderLevel)
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Reorder at: {product.reorderLevel} bags
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={status === 'out' ? 'danger' : 'warning'}
                          size="sm"
                        >
                          {product.currentStock} bags
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No low stock items"
                description="All products are well stocked"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/sales')}
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="text-sm">Record Sale</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/stock-addition')}
            >
              <Package className="w-6 h-6" />
              <span className="text-sm">Add Stock</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/products')}
            >
              <Package className="w-6 h-6" />
              <span className="text-sm">View Products</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/reports')}
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm">View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage
