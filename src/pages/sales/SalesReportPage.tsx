import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSales, useTodaySales } from '@/hooks/useSales'
import { useProducts } from '@/hooks/useProducts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingCart
} from 'lucide-react'
import { formatCurrency, formatDate, getTodayDate } from '@/utils/format'

const ITEMS_PER_PAGE = 20

const SalesReportPage = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(getTodayDate())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { data: sales, isLoading } = useSales({ 
    startDate, 
    endDate,
    productId: selectedProduct || undefined
  })
  const { data: products } = useProducts({ isActive: true })
  const { data: todaySales } = useTodaySales()

  const filteredSales = useMemo(() => {
    if (!sales) return []

    return sales.filter(sale => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          sale.productName.toLowerCase().includes(query) ||
          sale.unit.toLowerCase().includes(query) ||
          sale.date.includes(query)
        if (!matchesSearch) return false
      }

      if (selectedPayment && sale.paymentMethod !== selectedPayment) {
        return false
      }

      return true
    })
  }, [sales, searchQuery, selectedPayment])

  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredSales.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredSales, currentPage])

  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE)

  const totalAmount = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0)
  const totalProfit = filteredSales.reduce((sum, s) => sum + s.profit, 0)

  const handleExportCSV = () => {
    const headers = ['Date', 'Product', 'Unit', 'Quantity', 'Price/Unit', 'Total', 'Profit', 'Payment']
    const rows = filteredSales.map(s => [
      s.date,
      s.productName,
      s.unit,
      s.quantity,
      s.pricePerUnit,
      s.totalAmount,
      s.profit,
      s.paymentMethod,
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales-report-${startDate}-to-${endDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedProduct('')
    setSelectedPayment('')
    setCurrentPage(1)
  }

  const hasFilters = searchQuery || selectedProduct || selectedPayment

  if (isLoading) {
    return <Loading message="Loading sales data..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
            <p className="text-sm text-gray-500">View and analyze all sales transactions</p>
          </div>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-xl font-bold">{filteredSales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Sales</p>
                <p className="text-xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Profit</p>
                <p className="text-xl font-bold">{formatCurrency(totalProfit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-xl font-bold">{todaySales?.length || 0} sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <Input
                type="text"
                placeholder="Search product, unit..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              <Select
                value={selectedProduct}
                onChange={(e) => {
                  setSelectedProduct(e.target.value)
                  setCurrentPage(1)
                }}
                options={[
                  { value: '', label: 'All Products' },
                  ...(products?.map(product => ({
                    value: product.id,
                    label: product.name
                  })) || [])
                ]}
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment
              </label>
              <Select
                value={selectedPayment}
                onChange={(e) => {
                  setSelectedPayment(e.target.value)
                  setCurrentPage(1)
                }}
                options={[
                  { value: '', label: 'All Methods' },
                  { value: 'cash', label: 'Cash' },
                  { value: 'pos', label: 'POS' },
                  { value: 'bank_transfer', label: 'Transfer' },
                ]}
              />
            </div>
            {hasFilters && (
              <Button variant="outline" onClick={handleClearFilters}>
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredSales.length === 0 ? (
            <EmptyState
              title="No sales found"
              description="No sales transactions match your current filters"
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Unit
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Price/Unit
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Profit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Notes
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Payment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDate(sale.date)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {sale.productName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                          {sale.unit}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">
                          {sale.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {formatCurrency(sale.pricePerUnit)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(sale.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className={sale.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(sale.profit)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate" title={sale.description || ''}>
                          {sale.description || '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge 
                            variant={sale.paymentMethod === 'cash' ? 'default' : sale.paymentMethod === 'bank_transfer' ? 'info' : 'warning'}
                          >
                            {sale.paymentMethod === 'bank_transfer' ? 'Transfer' : sale.paymentMethod}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                  <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredSales.length)} of {filteredSales.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SalesReportPage