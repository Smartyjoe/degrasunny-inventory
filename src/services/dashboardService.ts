import api from './api'
import { delay, mockDashboardStats } from './mockData'
import { salesService } from './salesService'
import { productService } from './productService'
import { DashboardStats, ApiResponse } from '@/types'

const USE_MOCK_DATA = false

export const dashboardService = {
  // Get dashboard stats
  getStats: async (): Promise<DashboardStats> => {
    if (USE_MOCK_DATA) {
      await delay(400)
      
      // Calculate real-time stats
      const todaySales = await salesService.getTodaySales()
      const products = await productService.getProducts({ isActive: true })
      
      const todaySalesTotal = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0)
      const todayProfitTotal = todaySales.reduce((sum, sale) => sum + sale.profit, 0)
      const lowStockProducts = products.filter(p => p.currentStock <= p.reorderLevel)
      
      return {
        todaySales: todaySalesTotal,
        todayProfit: todayProfitTotal,
        todaySalesCount: todaySales.length,
        lowStockCount: lowStockProducts.length,
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isActive).length,
      }
    }
    
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats')
    return response.data.data
  },
}
