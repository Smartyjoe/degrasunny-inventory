import api from './api'
import { delay, mockDailyStock, mockStockAdditions } from './mockData'
import { productService } from './productService'
import { DailyStock, StockAddition, ApiResponse } from '@/types'

const USE_MOCK_DATA = true

let dailyStocks = [...mockDailyStock]
let stockAdditions = [...mockStockAdditions]

export const stockService = {
  // Get daily stock
  getDailyStock: async (date: string): Promise<DailyStock[]> => {
    if (USE_MOCK_DATA) {
      await delay(400)
      return dailyStocks.filter(ds => ds.date === date)
    }
    
    const response = await api.get<ApiResponse<DailyStock[]>>('/stock/daily', { params: { date } })
    return response.data.data
  },

  // Update daily stock
  updateDailyStock: async (id: string, data: Partial<DailyStock>): Promise<DailyStock> => {
    if (USE_MOCK_DATA) {
      await delay(400)
      
      const index = dailyStocks.findIndex(ds => ds.id === id)
      if (index === -1) throw new Error('Daily stock record not found')
      
      dailyStocks[index] = {
        ...dailyStocks[index],
        ...data,
      }
      
      return dailyStocks[index]
    }
    
    const response = await api.put<ApiResponse<DailyStock>>(`/stock/daily/${id}`, data)
    return response.data.data
  },

  // Add stock
  addStock: async (data: Omit<StockAddition, 'id' | 'totalCost'>): Promise<StockAddition> => {
    if (USE_MOCK_DATA) {
      await delay(500)
      
      const totalCost = data.quantity * data.costPrice
      
      const newStockAddition: StockAddition = {
        id: Date.now().toString(),
        ...data,
        totalCost,
      }
      
      stockAdditions.unshift(newStockAddition)
      
      // Update product stock
      const product = await productService.getProductById(data.productId)
      await productService.updateStock(product.id, product.currentStock + data.quantity)
      
      // Update daily stock record
      const today = new Date().toISOString().split('T')[0]
      const dailyStockRecord = dailyStocks.find(
        ds => ds.productId === data.productId && ds.date === today
      )
      
      if (dailyStockRecord) {
        dailyStockRecord.stockAdded += data.quantity
        dailyStockRecord.closingStock += data.quantity
      } else {
        // Create new daily stock record
        dailyStocks.push({
          id: Date.now().toString(),
          productId: data.productId,
          date: today,
          openingStock: product.currentStock,
          stockAdded: data.quantity,
          stockSold: 0,
          closingStock: product.currentStock + data.quantity,
        })
      }
      
      return newStockAddition
    }
    
    const response = await api.post<ApiResponse<StockAddition>>('/stock/add', data)
    return response.data.data
  },

  // Get stock additions
  getStockAdditions: async (filters?: { startDate?: string; endDate?: string; productId?: string }): Promise<StockAddition[]> => {
    if (USE_MOCK_DATA) {
      await delay(400)
      
      let filtered = [...stockAdditions]
      
      if (filters?.productId) {
        filtered = filtered.filter(sa => sa.productId === filters.productId)
      }
      
      if (filters?.startDate) {
        filtered = filtered.filter(sa => sa.date >= filters.startDate!)
      }
      
      if (filters?.endDate) {
        filtered = filtered.filter(sa => sa.date <= filters.endDate!)
      }
      
      return filtered
    }
    
    const response = await api.get<ApiResponse<StockAddition[]>>('/stock/additions', { params: filters })
    return response.data.data
  },
}
