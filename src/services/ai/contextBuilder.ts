/**
 * AI Context Builder
 * Aggregates frontend data into structured context for AI analysis
 * Uses only data already loaded in the application
 */

import { Product, Sale, DashboardStats, ProductPerformance } from '@/types'
import { format, subDays, parseISO } from 'date-fns'

export interface BusinessContext {
  timestamp: string
  products: ProductContext[]
  sales: SalesContext
  inventory: InventoryContext
  performance: PerformanceContext
  dates: DateContext
}

export interface ProductContext {
  id: string
  name: string
  currentStock: number
  costPrice: number
  sellingPrice: number
  margin: number
  marginPercentage: number
  reorderLevel: number
  isLowStock: boolean
  isRetailEnabled: boolean
  retailUnits?: {
    cupsPerBag?: number
    bucketsPerBag?: number
    cupPrice?: number
    bucketPrice?: number
  }
}

export interface SalesContext {
  today: {
    totalRevenue: number
    totalProfit: number
    transactionCount: number
    averageOrderValue: number
    profitMargin: number
  }
  recent: {
    last7Days: SalesSummary
    last30Days: SalesSummary
  }
  topProducts: Array<{
    name: string
    revenue: number
    profit: number
    quantity: number
  }>
  recentTransactions: Array<{
    productName: string
    quantity: number
    revenue: number
    profit: number
    date: string
  }>
}

export interface SalesSummary {
  totalRevenue: number
  totalProfit: number
  transactionCount: number
  averageDaily: number
}

export interface InventoryContext {
  totalProducts: number
  activeProducts: number
  lowStockCount: number
  outOfStockCount: number
  totalValue: number
  lowStockProducts: Array<{
    name: string
    currentStock: number
    reorderLevel: number
    deficit: number
  }>
}

export interface PerformanceContext {
  bestPerformers: Array<{
    name: string
    revenue: number
    profit: number
    marginPercentage: number
  }>
  worstPerformers: Array<{
    name: string
    revenue: number
    profit: number
    marginPercentage: number
  }>
  lossLeaders: Array<{
    name: string
    lossPerUnit: number
    totalLoss: number
  }>
}

export interface DateContext {
  today: string
  yesterday: string
  weekStart: string
  monthStart: string
  currentTime: string
}

class ContextBuilder {
  /**
   * Build comprehensive business context from frontend data
   */
  public buildContext(data: {
    products?: Product[]
    sales?: Sale[]
    dashboardStats?: DashboardStats
    productPerformance?: ProductPerformance[]
  }): BusinessContext {
    const now = new Date()
    
    return {
      timestamp: now.toISOString(),
      products: this.buildProductContext(data.products || []),
      sales: this.buildSalesContext(data.sales || [], data.dashboardStats),
      inventory: this.buildInventoryContext(data.products || []),
      performance: this.buildPerformanceContext(
        data.products || [],
        data.sales || [],
        data.productPerformance || []
      ),
      dates: this.buildDateContext(now),
    }
  }

  /**
   * Build product context
   */
  private buildProductContext(products: Product[]): ProductContext[] {
    return products.map(product => {
      const margin = product.sellingPrice - product.costPrice
      const marginPercentage = product.costPrice > 0 
        ? (margin / product.costPrice) * 100 
        : 0

      return {
        id: product.id,
        name: product.name,
        currentStock: product.currentStock,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        margin,
        marginPercentage,
        reorderLevel: product.reorderLevel,
        isLowStock: product.currentStock <= product.reorderLevel,
        isRetailEnabled: product.isRetailEnabled,
        retailUnits: product.isRetailEnabled ? {
          cupsPerBag: product.cupsPerBag,
          bucketsPerBag: product.bucketsPerBag,
          cupPrice: product.cupPrice,
          bucketPrice: product.bucketPrice,
        } : undefined,
      }
    })
  }

  /**
   * Build sales context
   */
  private buildSalesContext(
    sales: Sale[],
    dashboardStats?: DashboardStats
  ): SalesContext {
    const today = format(new Date(), 'yyyy-MM-dd')
    const todaySales = sales.filter(s => s.date === today)
    
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0)
    const todayProfit = todaySales.reduce((sum, s) => sum + s.profit, 0)
    const todayCount = todaySales.length

    // Calculate recent periods
    const last7Days = this.calculatePeriodSummary(sales, 7)
    const last30Days = this.calculatePeriodSummary(sales, 30)

    // Get top products
    const topProducts = this.getTopProducts(sales, 5)

    // Get recent transactions
    const recentTransactions = sales
      .slice(0, 10)
      .map(s => ({
        productName: s.productName,
        quantity: s.quantity,
        revenue: s.totalAmount,
        profit: s.profit,
        date: s.date,
      }))

    return {
      today: {
        totalRevenue: dashboardStats?.todaySales || todayRevenue,
        totalProfit: dashboardStats?.todayProfit || todayProfit,
        transactionCount: dashboardStats?.todaySalesCount || todayCount,
        averageOrderValue: todayCount > 0 ? todayRevenue / todayCount : 0,
        profitMargin: todayRevenue > 0 ? (todayProfit / todayRevenue) * 100 : 0,
      },
      recent: {
        last7Days,
        last30Days,
      },
      topProducts,
      recentTransactions,
    }
  }

  /**
   * Calculate summary for a time period
   */
  private calculatePeriodSummary(sales: Sale[], days: number): SalesSummary {
    const cutoffDate = format(subDays(new Date(), days), 'yyyy-MM-dd')
    const periodSales = sales.filter(s => s.date >= cutoffDate)

    const totalRevenue = periodSales.reduce((sum, s) => sum + s.totalAmount, 0)
    const totalProfit = periodSales.reduce((sum, s) => sum + s.profit, 0)
    const transactionCount = periodSales.length

    return {
      totalRevenue,
      totalProfit,
      transactionCount,
      averageDaily: totalRevenue / days,
    }
  }

  /**
   * Get top performing products
   */
  private getTopProducts(sales: Sale[], limit: number) {
    const productMap = new Map<string, { revenue: number; profit: number; quantity: number }>()

    sales.forEach(sale => {
      const existing = productMap.get(sale.productName) || { revenue: 0, profit: 0, quantity: 0 }
      productMap.set(sale.productName, {
        revenue: existing.revenue + sale.totalAmount,
        profit: existing.profit + sale.profit,
        quantity: existing.quantity + sale.quantity,
      })
    })

    return Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
  }

  /**
   * Build inventory context
   */
  private buildInventoryContext(products: Product[]): InventoryContext {
    const activeProducts = products.filter(p => p.isActive)
    const lowStockProducts = activeProducts.filter(p => p.currentStock <= p.reorderLevel)
    const outOfStockProducts = activeProducts.filter(p => p.currentStock === 0)

    const totalValue = activeProducts.reduce(
      (sum, p) => sum + (p.currentStock * p.costPrice),
      0
    )

    return {
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalValue,
      lowStockProducts: lowStockProducts.map(p => ({
        name: p.name,
        currentStock: p.currentStock,
        reorderLevel: p.reorderLevel,
        deficit: p.reorderLevel - p.currentStock,
      })),
    }
  }

  /**
   * Build performance context
   */
  private buildPerformanceContext(
    products: Product[],
    sales: Sale[],
    productPerformance: ProductPerformance[]
  ): PerformanceContext {
    // Calculate margins from sales
    const productStats = new Map<string, { revenue: number; profit: number }>()
    
    sales.forEach(sale => {
      const existing = productStats.get(sale.productName) || { revenue: 0, profit: 0 }
      productStats.set(sale.productName, {
        revenue: existing.revenue + sale.totalAmount,
        profit: existing.profit + sale.profit,
      })
    })

    const performers = Array.from(productStats.entries())
      .map(([name, data]) => ({
        name,
        revenue: data.revenue,
        profit: data.profit,
        marginPercentage: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0,
      }))
      .filter(p => p.revenue > 0)

    // Find loss leaders (selling below cost)
    const lossLeaders = products
      .filter(p => p.sellingPrice < p.costPrice)
      .map(p => {
        const productSales = sales.filter(s => s.productId === p.id)
        const totalLoss = productSales.reduce((sum, s) => sum + Math.abs(s.profit), 0)
        
        return {
          name: p.name,
          lossPerUnit: p.costPrice - p.sellingPrice,
          totalLoss,
        }
      })
      .filter(l => l.totalLoss > 0)
      .sort((a, b) => b.totalLoss - a.totalLoss)

    return {
      bestPerformers: performers
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 5),
      worstPerformers: performers
        .sort((a, b) => a.profit - b.profit)
        .slice(0, 5),
      lossLeaders,
    }
  }

  /**
   * Build date context
   */
  private buildDateContext(now: Date): DateContext {
    return {
      today: format(now, 'yyyy-MM-dd'),
      yesterday: format(subDays(now, 1), 'yyyy-MM-dd'),
      weekStart: format(subDays(now, 7), 'yyyy-MM-dd'),
      monthStart: format(subDays(now, 30), 'yyyy-MM-dd'),
      currentTime: format(now, 'HH:mm:ss'),
    }
  }

  /**
   * Build minimal context for quick queries
   */
  public buildMinimalContext(data: {
    products?: Product[]
    todayStats?: DashboardStats
  }): string {
    const products = data.products || []
    const stats = data.todayStats

    return `Current Business Status:
- Active Products: ${products.filter(p => p.isActive).length}
- Low Stock Items: ${products.filter(p => p.currentStock <= p.reorderLevel).length}
- Today's Revenue: ${stats?.todaySales || 0}
- Today's Profit: ${stats?.todayProfit || 0}
- Today's Transactions: ${stats?.todaySalesCount || 0}`
  }

  /**
   * Convert context to formatted string for AI consumption
   */
  public formatContextForAI(context: BusinessContext): string {
    return `BUSINESS DATA CONTEXT (${context.timestamp})

INVENTORY STATUS:
- Total Products: ${context.inventory.totalProducts}
- Active Products: ${context.inventory.activeProducts}
- Low Stock Items: ${context.inventory.lowStockCount}
- Out of Stock: ${context.inventory.outOfStockCount}
- Total Inventory Value: ${context.inventory.totalValue.toFixed(2)}

TODAY'S PERFORMANCE:
- Revenue: ${context.sales.today.totalRevenue.toFixed(2)}
- Profit: ${context.sales.today.totalProfit.toFixed(2)}
- Transactions: ${context.sales.today.transactionCount}
- Average Order: ${context.sales.today.averageOrderValue.toFixed(2)}
- Profit Margin: ${context.sales.today.profitMargin.toFixed(1)}%

RECENT TRENDS (7 days):
- Revenue: ${context.sales.recent.last7Days.totalRevenue.toFixed(2)}
- Profit: ${context.sales.recent.last7Days.totalProfit.toFixed(2)}
- Daily Average: ${context.sales.recent.last7Days.averageDaily.toFixed(2)}

TOP PRODUCTS:
${context.sales.topProducts.map((p, i) => `${i + 1}. ${p.name} - Revenue: ${p.revenue.toFixed(2)}, Profit: ${p.profit.toFixed(2)}`).join('\n')}

LOW STOCK ALERTS:
${context.inventory.lowStockProducts.map(p => `- ${p.name}: ${p.currentStock} units (needs ${p.deficit} more)`).join('\n') || 'None'}

LOSS LEADERS:
${context.performance.lossLeaders.map(l => `- ${l.name}: Loss ${l.lossPerUnit.toFixed(2)} per unit, Total: ${l.totalLoss.toFixed(2)}`).join('\n') || 'None'}

CURRENT DATE: ${context.dates.today}
CURRENT TIME: ${context.dates.currentTime}`
  }
}

// Export singleton instance
export const contextBuilder = new ContextBuilder()
