import { useDashboardStats } from '@/hooks/useDashboard'
import { useProducts } from '@/hooks/useProducts'
import { useTodaySales } from '@/hooks/useSales'
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle,
  Package,
  ArrowRight,
  Banknote,
  CreditCard,
  Building2
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

  const isLoading = statsLoading || productsLoading || salesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(stats?.todaySales || 0)}
          icon={DollarSign}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-100"
          onClick={() => navigate('/sales')}
        />
        <StatCard
          title="Today's Profit"
          value={formatCurrency(stats?.todayProfit || 0)}
          icon={TrendingUp}
          iconColor="text-success-600"
          iconBgColor="bg-success-100"
        />
        <StatCard
          title="Sales Count"
          value={stats?.todaySalesCount || 0}
          icon={ShoppingCart}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-100"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockCount || 0}
          icon={AlertTriangle}
          iconColor="text-danger-600"
          iconBgColor="bg-danger-100"
          onClick={() => navigate('/products')}
        />
      </div>

      {/* Payment Method Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Today&apos;s Payment Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cash Sales */}
            <div className="flex items-center gap-4 p-4 bg-success-50 rounded-lg border border-success-200">
              <div className="p-3 bg-success-100 rounded-lg">
                <Banknote className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Cash Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.cashSales || 0)}
                </p>
              </div>
            </div>

            {/* POS Sales */}
            <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
              <div className="p-3 bg-primary-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">POS Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.posSales || 0)}
                </p>
              </div>
            </div>

            {/* Bank Transfer Sales */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Building2 className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Bank Transfer</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.bankTransferSales || 0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
            {todaySales && todaySales.length > 0 ? (
              <div className="space-y-3">
                {todaySales.slice(0, 5).map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm mb-1">
                        {sale.productName}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge size="sm" variant="info">
                          {sale.quantity} {sale.unit}
                        </Badge>
                        <Badge 
                          size="sm" 
                          variant={
                            sale.paymentMethod === 'cash' ? 'success' :
                            sale.paymentMethod === 'pos' ? 'info' : 'default'
                          }
                        >
                          {sale.paymentMethod === 'bank_transfer' ? 'Bank' : sale.paymentMethod.toUpperCase()}
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
                title="No Sales Today"
                description="Start recording sales to see them here"
              />
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Low Stock Alert</CardTitle>
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
            {lowStockProducts && lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => {
                  const status = getStockStatus(product.currentStock, product.reorderLevel)
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-danger-50 rounded-lg border border-danger-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm mb-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Current: {product.currentStock} | Reorder: {product.reorderLevel}
                        </p>
                      </div>
                      <Badge variant="danger" size="sm">
                        {status}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="All Stock Levels Good"
                description="No products are running low on stock"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => navigate('/sales')}
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="text-sm">New Sale</span>
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
