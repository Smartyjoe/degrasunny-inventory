import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStockAdditions } from '@/hooks/useStock'
import { useProducts } from '@/hooks/useProducts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
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
  Package
} from 'lucide-react'
import { formatCurrency, formatDate, getTodayDate } from '@/utils/format'

const ITEMS_PER_PAGE = 20

const StockHistoryPage = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(getTodayDate())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { data: stockAdditions, isLoading } = useStockAdditions({ 
    startDate, 
    endDate,
    productId: selectedProduct || undefined
  })
  const { data: products } = useProducts({ isActive: true })

  const filteredAdditions = useMemo(() => {
    if (!stockAdditions) return []

    return stockAdditions.filter(addition => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          addition.productName.toLowerCase().includes(query) ||
          (addition.notes && addition.notes.toLowerCase().includes(query)) ||
          addition.date.includes(query)
        if (!matchesSearch) return false
      }

      return true
    })
  }, [stockAdditions, searchQuery])

  const paginatedAdditions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAdditions.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredAdditions, currentPage])

  const totalPages = Math.ceil(filteredAdditions.length / ITEMS_PER_PAGE)

  const totalQuantity = filteredAdditions.reduce((sum, a) => sum + a.quantity, 0)
  const totalCost = filteredAdditions.reduce((sum, a) => sum + (a.totalCost || 0), 0)

  const handleExportCSV = () => {
    const headers = ['Date', 'Product', 'Quantity', 'Stock Before', 'Stock After', 'Cost/Unit', 'Total Cost', 'Supplier', 'Notes']
    const rows = filteredAdditions.map(a => [
      a.date,
      a.productName,
      a.quantity,
      a.stockBefore || 0,
      a.stockAfter || 0,
      a.costPrice,
      a.totalCost || 0,
      a.supplier || '',
      a.notes || '',
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stock-history-${startDate}-to-${endDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedProduct('')
    setCurrentPage(1)
  }

  const hasFilters = searchQuery || selectedProduct

  if (isLoading) {
    return <Loading message="Loading stock history..." />
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
            <h1 className="text-2xl font-bold text-gray-900">Stock History</h1>
            <p className="text-sm text-gray-500">Track all stock additions over time</p>
          </div>
        </div>
        <Link to="/stock-addition">
          <Button>
            <Package className="w-4 h-4 mr-2" />
            Add Stock
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Additions</p>
                <p className="text-xl font-bold">{filteredAdditions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Quantity</p>
                <p className="text-xl font-bold">{totalQuantity} bags</p>
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
                <p className="text-sm text-gray-500">Total Cost</p>
                <p className="text-xl font-bold">{formatCurrency(totalCost)}</p>
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
                type= "date"
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
                type= "date"
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
                type= "text"
                placeholder="Search product, notes..."
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
            {hasFilters && (
              <Button variant="outline" onClick={handleClearFilters}>
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stock Additions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Addition Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredAdditions.length === 0 ? (
            <EmptyState
              title="No stock additions found"
              description="No stock additions match your current filters"
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
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Qty Added
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Stock Before
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Stock After
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Cost/Unit
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total Cost
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Supplier
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedAdditions.map((addition) => (
                      <tr key={addition.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDate(addition.date)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {addition.productName}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className="text-green-600 font-medium">+{addition.quantity}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {addition.stockBefore ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {addition.stockAfter ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {formatCurrency(addition.costPrice)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(addition.totalCost || 0)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {addition.supplier || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-[150px] truncate" title={addition.notes || ''}>
                          {addition.notes || '-'}
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
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAdditions.length)} of {filteredAdditions.length} entries
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

export default StockHistoryPage