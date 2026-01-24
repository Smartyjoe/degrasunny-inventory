import api from './api'
import { delay, mockProducts } from './mockData'
import { Product, ProductFormData, ApiResponse, PaginatedResponse } from '@/types'

const USE_MOCK_DATA = false

let products = [...mockProducts] // Local state for mock

export const productService = {
  // Get all products
  getProducts: async (filters?: { search?: string; isActive?: boolean; lowStock?: boolean }): Promise<Product[]> => {
    if (USE_MOCK_DATA) {
      await delay(400)
      
      let filtered = [...products]
      
      if (filters?.search) {
        const search = filters.search.toLowerCase()
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(search) || 
          p.description?.toLowerCase().includes(search)
        )
      }
      
      if (filters?.isActive !== undefined) {
        filtered = filtered.filter(p => p.isActive === filters.isActive)
      }
      
      if (filters?.lowStock) {
        filtered = filtered.filter(p => p.currentStock <= p.reorderLevel)
      }
      
      return filtered
    }
    
    const response = await api.get<ApiResponse<Product[]>>('/products', { params: filters })
    return response.data.data
  },

  // Get product by ID
  getProductById: async (id: string): Promise<Product> => {
    if (USE_MOCK_DATA) {
      await delay(300)
      const product = products.find(p => p.id === id)
      if (!product) throw new Error('Product not found')
      return product
    }
    
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`)
    return response.data.data
  },

  // Create product
  createProduct: async (data: ProductFormData): Promise<Product> => {
    if (USE_MOCK_DATA) {
      await delay(500)
      
      const newProduct: Product = {
        id: Date.now().toString(),
        ...data,
        currentStock: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      products.push(newProduct)
      return newProduct
    }
    
    const response = await api.post<ApiResponse<Product>>('/products', data)
    return response.data.data
  },

  // Update product
  updateProduct: async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
    if (USE_MOCK_DATA) {
      await delay(500)
      
      const index = products.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Product not found')
      
      products[index] = {
        ...products[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      
      return products[index]
    }
    
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, data)
    return response.data.data
  },

  // Delete/Deactivate product
  deleteProduct: async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      await delay(400)
      
      const index = products.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Product not found')
      
      products[index].isActive = false
      return
    }
    
    await api.delete(`/products/${id}`)
  },

  // Update stock
  updateStock: async (id: string, quantity: number): Promise<Product> => {
    if (USE_MOCK_DATA) {
      await delay(300)
      
      const index = products.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Product not found')
      
      products[index].currentStock = quantity
      products[index].updatedAt = new Date().toISOString()
      
      return products[index]
    }
    
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}/stock`, { quantity })
    return response.data.data
  },
}
