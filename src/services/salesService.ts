import api from './api'
import { delay, mockSales } from './mockData'
import { productService } from './productService'
import { Sale, SaleFormData, ApiResponse } from '@/types'

const USE_MOCK_DATA = false

let sales = [...mockSales] // Local state for mock

export const salesService = {
  // Get all sales
  getSales: async (filters?: { startDate?: string; endDate?: string; productId?: string }): Promise<Sale[]> => {
    if (USE_MOCK_DATA) {
      await delay(400)
      
      let filtered = [...sales]
      
      if (filters?.productId) {
        filtered = filtered.filter(s => s.productId === filters.productId)
      }
      
      if (filters?.startDate) {
        filtered = filtered.filter(s => s.date >= filters.startDate!)
      }
      
      if (filters?.endDate) {
        filtered = filtered.filter(s => s.date <= filters.endDate!)
      }
      
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    
    const response = await api.get<ApiResponse<Sale[]>>('/sales', { params: filters })
    return response.data.data
  },

  // Get today's sales
  getTodaySales: async (): Promise<Sale[]> => {
    const today = new Date().toISOString().split('T')[0]
    return salesService.getSales({ startDate: today, endDate: today })
  },

  // Create sale
  createSale: async (data: SaleFormData): Promise<Sale> => {
    if (USE_MOCK_DATA) {
      await delay(500)
      
      // Get product to calculate prices
      const product = await productService.getProductById(data.productId)
      
      let pricePerUnit: number
      let costPerUnit: number
      
      switch (data.unit) {
        case 'bag':
          pricePerUnit = product.sellingPrice
          costPerUnit = product.costPrice
          break
        case 'cup':
          if (!product.cupPrice) throw new Error('Cup price not set for this product')
          pricePerUnit = product.cupPrice
          costPerUnit = product.costPrice / (product.cupsPerBag || 1)
          break
        case 'bucket':
          if (!product.bucketPrice) throw new Error('Bucket price not set for this product')
          pricePerUnit = product.bucketPrice
          costPerUnit = product.costPrice / (product.bucketsPerBag || 1)
          break
      }
      
      const totalAmount = pricePerUnit * data.quantity
      const totalCost = costPerUnit * data.quantity
      const profit = totalAmount - totalCost
      
      // Check stock availability
      let requiredStock = data.quantity
      if (data.unit === 'cup') {
        requiredStock = data.quantity / (product.cupsPerBag || 1)
      } else if (data.unit === 'bucket') {
        requiredStock = data.quantity / (product.bucketsPerBag || 1)
      }
      
      if (product.currentStock < requiredStock) {
        throw new Error('Insufficient stock')
      }
      
      const newSale: Sale = {
        id: Date.now().toString(),
        productId: data.productId,
        productName: product.name,
        unit: data.unit,
        quantity: data.quantity,
        pricePerUnit,
        totalAmount,
        profit,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      }
      
      sales.unshift(newSale)
      
      // Update product stock
      await productService.updateStock(product.id, product.currentStock - requiredStock)
      
      return newSale
    }
    
    const response = await api.post<ApiResponse<Sale>>('/sales', data)
    return response.data.data
  },

  // Get single sale by ID
  getSaleById: async (id: string): Promise<Sale> => {
    if (USE_MOCK_DATA) {
      await delay(300)
      const sale = sales.find(s => s.id === id)
      if (!sale) throw new Error('Sale not found')
      return sale
    }
    
    const response = await api.get<ApiResponse<Sale>>(`/sales/${id}`)
    return response.data.data
  },

  // Delete sale
  deleteSale: async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      await delay(400)
      
      const index = sales.findIndex(s => s.id === id)
      if (index === -1) throw new Error('Sale not found')
      
      sales.splice(index, 1)
      return
    }
    
    await api.delete(`/sales/${id}`)
  },
}
