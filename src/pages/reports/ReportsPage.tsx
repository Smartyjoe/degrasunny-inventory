import { useState, useMemo } from 'react'
import { useSales } from '@/hooks/useSales'
import { useProducts } from '@/hooks/useProducts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Loading } from '@/components/ui/Spinner'
import { Download, TrendingUp, DollarSign, ShoppingCart, Calendar } from 'lucide-react'
import { formatCurrency, formatDate, getTodayDate } from '@/utils/format'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type ReportPeriod = 'daily' | 'weekly' | 'monthly'

const ReportsPage = () => {
  const [period, setPeriod] = useState<ReportPeriod>('daily')
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7) // Last 7 days
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(getTodayDate())

  const { data: sales, isLoading: salesLoading } = useSales({ startDate, endDate })
  const { data: products } = useProducts({ isActive: true })

  const reportData = useMemo(() => {
    if (!sales || !products) return null

    // Calculate totals
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0)
    const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0)
    const salesCount = sales.length

    // Group by date for daily chart
    const dailyData = sales.reduce((acc, sale) => {
      const date = sale.date
      if (!acc[date]) {
        acc[date] = { date, sales: 0, profit: 0, count: 0 }
      }
      acc[date].sales += sale.totalAmount
      acc[date].profit += sale.profit
      acc[date].count += 1
      return acc
    }, {} as Record<string, { date: string; sales: number; profit: number; count: number }>)

    const chartData = Object.values(dailyData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Product performance
    const productPerformance = sales.reduce((acc, sale) => {
      if (!acc[sale.productId]) {
        acc[sale.productId] = {
          productName: sale.productName,
          totalSales: 0,
          totalProfit: 0,
          quantity: 0,
          count: 0,
        }
      }
      acc[sale.productId].totalSales += sale.totalAmount
      acc[sale.productId].totalProfit += sale.profit
      acc[sale.productId].quantity += sale.quantity
      acc[sale.productId].count += 1
      return acc
    }, {} as Record<string, { productName: string; totalSales: number; totalProfit: number; quantity: number; count: number }>)

    const topProducts = Object.values(productPerformance)
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5)

    // Unit distribution
    const unitDistribution = sales.reduce((acc, sale) => {
      if (!acc[sale.unit]) {
        acc[sale.unit] = { unit: sale.unit, count: 0, value: 0 }
      }
      acc[sale.unit].count += sale.quantity
      acc[sale.unit].value += sale.totalAmount
      return acc
    }, {} as Record<string, { unit: string; count: number; value: number }>)

    return {
      totalSales,
      totalProfit,
      salesCount,
      chartData,
      topProducts,
      unitDistribution: Object.values(unitDistribution),
    }
  }, [sales, products])

  const handleExportCSV = () => {
    if (!sales) return

    const headers = ['Date', 'Product', 'Unit', 'Quantity', 'Price', 'Total', 'Profit']
    const rows = sales.map(s => [
      s.date,
      s.productName,
      s.unit,
      s.quantity,
      s.pricePerUnit,
      s.totalAmount,
      s.profit,
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${startDate}-to-${endDate}.csv`
    a.click()
  }

  if (salesLoading) {
    return <Loading message="Loading reports..." />
  }

  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Analyze your business performance</p>
        </div>
        <Button onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Date Range Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Period"
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
            value={period}
            onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
          />
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={endDate}
            icon={<Calendar className="w-5 h-5" />}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            max={getTodayDate()}
            icon={<Calendar className="w-5 h-5" />}
          />
        </div>
      </Card>

      {/* Summary Stats */}
      {reportData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.totalSales)}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Profit</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.totalProfit)}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reportData.salesCount}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales & Profit Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Sales & Profit Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => formatDate(date).split(',')[0]}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(date) => formatDate(date)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#22c55e"
                      name="Sales"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#0ea5e9"
                      name="Profit"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Products by Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products by Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="productName"
                      style={{ fontSize: '11px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="totalSales" fill="#0ea5e9" name="Sales" />
                    <Bar dataKey="totalProfit" fill="#22c55e" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Unit Distribution */}
            {reportData.unitDistribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Unit</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.unitDistribution}
                        dataKey="value"
                        nameKey="unit"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.unit}: ${formatCurrency(entry.value)}`}
                      >
                        {reportData.unitDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Product Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Product</th>
                        <th className="text-right py-2 px-2 font-semibold text-gray-700">Sales</th>
                        <th className="text-right py-2 px-2 font-semibold text-gray-700">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.topProducts.map((product, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-2 font-medium text-gray-900">
                            {product.productName}
                          </td>
                          <td className="py-3 px-2 text-right text-gray-900">
                            {formatCurrency(product.totalSales)}
                          </td>
                          <td className="py-3 px-2 text-right text-success-600 font-semibold">
                            {formatCurrency(product.totalProfit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

export default ReportsPage
