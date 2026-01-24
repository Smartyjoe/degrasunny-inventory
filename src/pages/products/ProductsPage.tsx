import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProducts, useDeleteProduct } from '@/hooks/useProducts'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import ProductFormModal from '@/components/products/ProductFormModal'
import { formatCurrency, getStockStatus, calculateProfit } from '@/utils/format'
import { Product } from '@/types'

const ProductsPage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const { data: products, isLoading } = useProducts({ search })
  const deleteProduct = useDeleteProduct()

  const handleDelete = async () => {
    if (!deletingProduct) return
    
    try {
      await deleteProduct.mutateAsync(deletingProduct.id)
      setDeletingProduct(null)
    } catch (error) {
      // Error handled by mutation
    }
  }

  if (isLoading) {
    return <Loading message="Loading products..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your inventory items</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </Card>

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const stockStatus = getStockStatus(product.currentStock, product.reorderLevel)
            const profit = calculateProfit(product.sellingPrice, product.costPrice)
            
            return (
              <Card key={product.id} hover noPadding>
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        stockStatus === 'healthy'
                          ? 'success'
                          : stockStatus === 'low'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {product.currentStock}
                    </Badge>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cost Price:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(product.costPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Selling Price:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(product.sellingPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Profit/Bag:</span>
                      <span className="font-medium text-success-600">
                        {formatCurrency(profit)}
                      </span>
                    </div>
                  </div>

                  {/* Retail Info */}
                  {product.isRetailEnabled && (
                    <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                      <p className="text-xs font-medium text-primary-900 mb-2">
                        Retail Pricing
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Cup: </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(product.cupPrice || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Bucket: </span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(product.bucketPrice || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingProduct(product)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={Plus}
            title="No products found"
            description="Start by adding your first product to manage inventory"
            action={{
              label: 'Add Product',
              onClick: () => setShowCreateModal(true),
            }}
          />
        </Card>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingProduct) && (
        <ProductFormModal
          product={editingProduct || undefined}
          onClose={() => {
            setShowCreateModal(false)
            setEditingProduct(null)
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deletingProduct && (
        <Modal
          isOpen={!!deletingProduct}
          onClose={() => setDeletingProduct(null)}
          title="Delete Product"
          size="sm"
        >
          <p className="text-gray-600 mb-4">
            Are you sure you want to deactivate <strong>{deletingProduct.name}</strong>?
            This action will hide the product from your active inventory.
          </p>
          
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingProduct(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteProduct.isPending}
            >
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  )
}

export default ProductsPage
