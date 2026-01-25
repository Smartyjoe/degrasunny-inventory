import { useState, useEffect } from 'react'
import { useSales } from '@/hooks/useSales'
import { useAIContext } from '@/hooks/useAIContext'
import { reportService } from '@/services/reportService'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Loading } from '@/components/ui/Spinner'
import { Download, TrendingUp, DollarSign, ShoppingCart, Calendar } from 'lucide-react'
import { formatCurrency, formatDate, getTodayDate } from '@/utils/format'
import AIInsightCard from '@/components/ai/AIInsightCard'
import AIChatWidget from '@/components/ai/AIChatWidget'
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

  const [reportSummary, setReportSummary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { data: sales } = useSales({ startDate, endDate })
  const { contextReady } = useAIContext()

  // Fetch comprehensive report summary from backend
  useEffect(() => {
    const fetchReportSummary = async () => {
      setIsLoading(true)
      try {
        const data = await reportService.getDateRangeSummary(startDate, endDate, period)
        setReportSummary(data)
      } catch (error) {
        console.error('Failed to load report summary:', error)
        toast.error('Failed to load reports')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReportSummary()
  }, [startDate, endDate, period])

  // All data comes from backend - no local aggregation
  const reportData = reportSummary

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

  if (isLoading) {
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

      {/* AI Performance Insight */}
      {contextReady && reportData && (
        <AIInsightCard trigger="performance" />
      )}

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

          {/* Payment Method Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Cash</span>
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(reportData.paymentBreakdown?.cash || 0)}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {reportData.totalSales > 0 
                      ? `${((reportData.paymentBreakdown?.cash || 0) / reportData.totalSales * 100).toFixed(1)}%`
                      : '0%'
                    } of total
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-900">POS/Card</span>
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(reportData.paymentBreakdown?.pos || 0)}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {reportData.totalSales > 0 
                      ? `${((reportData.paymentBreakdown?.pos || 0) / reportData.totalSales * 100).toFixed(1)}%`
                      : '0%'
                    } of total
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-900">Bank Transfer</span>
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(reportData.paymentBreakdown?.bankTransfer || 0)}
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    {reportData.totalSales > 0 
                      ? `${((reportData.paymentBreakdown?.bankTransfer || 0) / reportData.totalSales * 100).toFixed(1)}%`
                      : '0%'
                    } of total
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales & Profit Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Sales & Profit Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData?.chartData && reportData.chartData.length > 0 ? (
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
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No data available for selected period
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Products by Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products by Sales</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData?.topProducts && reportData.topProducts.length > 0 ? (
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
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Unit Distribution */}
            {reportData?.unitDistribution && reportData.unitDistribution.length > 0 && (
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
                        label={(entry: any) => `${entry.unit}: ${formatCurrency(entry.value)}`}
                      >
                        {reportData.unitDistribution.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Product Performance Table - Full List from Backend */}
            <Card>
              <CardHeader>
                <CardTitle>Product Performance (All Products)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 font-semibold text-gray-700">Product</th>
                        <th className="text-right py-2 px-2 font-semibold text-gray-700">Qty Sold</th>
                        <th className="text-right py-2 px-2 font-semibold text-gray-700">Sales</th>
                        <th className="text-right py-2 px-2 font-semibold text-gray-700">Profit</th>
                        <th className="text-right py-2 px-2 font-semibold text-gray-700">Txns</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData?.allProducts && reportData.allProducts.length > 0 ? (
                        reportData.allProducts.map((product: any, index: number) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-2 font-medium text-gray-900">
                              {product.productName}
                            </td>
                            <td className="py-3 px-2 text-right text-gray-700">
                              {product.quantitySold}
                            </td>
                            <td className="py-3 px-2 text-right text-gray-900">
                              {formatCurrency(product.totalSales)}
                            </td>
                            <td className="py-3 px-2 text-right text-success-600 font-semibold">
                              {formatCurrency(product.totalProfit)}
                            </td>
                            <td className="py-3 px-2 text-right text-gray-600">
                              {product.salesCount}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-gray-500">
                            No sales data for selected period
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* AI Payment Methods Insight */}
      {contextReady && reportData?.paymentMethodBreakdown && (
        <AIInsightCard trigger="payment-methods" />
      )}

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  )
}

export default ReportsPage
