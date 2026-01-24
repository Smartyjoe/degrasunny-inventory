import api from './api'
import { delay } from './mockData'
import { salesService } from './salesService'
import { DailySummary, WeeklySummary, MonthlySummary, ProductPerformance, ApiResponse } from '@/types'

const USE_MOCK_DATA = false

export const reportService = {
  // Get daily summary
  getDailySummary: async (date: string): Promise<DailySummary> => {
    if (USE_MOCK_DATA) {
      await delay(400)
      
      const sales = await salesService.getSales({ startDate: date, endDate: date })
      
      const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0)
      const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0)
      
      // Find top product
      const productSales = sales.reduce((acc, sale) => {
        if (!acc[sale.productName]) {
          acc[sale.productName] = 0
        }
        acc[sale.productName] += sale.totalAmount
        return acc
      }, {} as Record<string, number>)
      
      const topProduct = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'
      
      return {
        date,
        totalSales,
        totalProfit,
        salesCount: sales.length,
        topProduct,
      }
    }
    
    const response = await api.get<ApiResponse<DailySummary>>('/reports/daily', { params: { date } })
    return response.data.data
  },

  // Get weekly summary
  getWeeklySummary: async (weekStart: string, weekEnd: string): Promise<WeeklySummary> => {
    if (USE_MOCK_DATA) {
      await delay(400)
      
      const sales = await salesService.getSales({ startDate: weekStart, endDate: weekEnd })
      
      const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0)
      const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0)
      
      return {
        weekStart,
        weekEnd,
        totalSales,
        totalProfit,
        salesCount: sales.length,
        dailyBreakdown: [],
      }
    }
    
    const response = await api.get<ApiResponse<WeeklySummary>>('/reports/weekly', {
      params: { weekStart, weekEnd },
    })
    return response.data.data
  },

  // Get monthly summary
  getMonthlySummary: async (month: string, year: number): Promise<MonthlySummary> => {
    if (USE_MOCK_DATA) {
      await delay(400)
      
      // Get all sales for the month
      const startDate = `${year}-${month.padStart(2, '0')}-01`
      const endDate = `${year}-${month.padStart(2, '0')}-31`
      const sales = await salesService.getSales({ startDate, endDate })
      
      const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0)
      const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0)
      
      return {
        month,
        year,
        totalSales,
        totalProfit,
        salesCount: sales.length,
        weeklyBreakdown: [],
      }
    }
    
    const response = await api.get<ApiResponse<MonthlySummary>>('/reports/monthly', {
      params: { month, year },
    })
    return response.data.data
  },

  // Get product performance report
  getProductPerformance: async (filters?: { startDate?: string; endDate?: string }): Promise<ProductPerformance[]> => {
    if (USE_MOCK_DATA) {
      await delay(400)
      
      const sales = await salesService.getSales(filters)
      
      // Group sales by product
      const productMap = sales.reduce((acc, sale) => {
        if (!acc[sale.productId]) {
          acc[sale.productId] = {
            productId: sale.productId,
            productName: sale.productName,
            totalSales: 0,
            totalProfit: 0,
            quantitySold: 0,
            salesCount: 0,
          }
        }
        
        acc[sale.productId].totalSales += sale.totalAmount
        acc[sale.productId].totalProfit += sale.profit
        acc[sale.productId].quantitySold += sale.quantity
        acc[sale.productId].salesCount += 1
        
        return acc
      }, {} as Record<string, ProductPerformance>)
      
      return Object.values(productMap).sort((a, b) => b.totalSales - a.totalSales)
    }
    
    const response = await api.get<ApiResponse<ProductPerformance[]>>('/reports/products', { 
      params: filters 
    })
    return response.data.data
  },
}
