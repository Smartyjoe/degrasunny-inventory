import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { aiService } from '@/services/aiService'
import { useDashboardStats } from '@/hooks/useDashboard'
import { useProducts } from '@/hooks/useProducts'
import { useSales } from '@/hooks/useSales'

/**
 * Hook to automatically sync AI context with current user's data
 * This ensures AI always has the latest business data
 */
export function useAIContext() {
  const user = useAuthStore((state) => state.user)
  const { data: dashboardData } = useDashboardStats()
  const { data: products } = useProducts()
  const { data: sales } = useSales()

  useEffect(() => {
    if (!user) {
      // User logged out - clear AI context
      aiService.clearContext()
      return
    }

    // Update AI context with all available data
    const lowStockProducts = products?.filter(p => 
      p.isActive && p.currentStock <= p.reorderLevel
    ) || []

    aiService.updateContext({
      storeName: user.businessName || 'Your Store',
      userName: user.name,
      products: products || [],
      recentSales: sales?.slice(0, 20) || [],
      dashboardStats: dashboardData || {
        todaySales: 0,
        todayProfit: 0,
        todaySalesCount: 0,
        cashSales: 0,
        posSales: 0,
        bankTransferSales: 0,
        lowStockCount: 0,
        totalProducts: 0,
        activeProducts: 0,
      },
      lowStockProducts,
      timestamp: new Date().toISOString(),
    })
  }, [user, dashboardData, products, sales])

  return {
    contextReady: !!(user && products && dashboardData),
  }
}
