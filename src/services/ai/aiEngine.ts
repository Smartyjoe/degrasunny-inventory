/**
 * AI Intelligence Engine
 * Main orchestrator for all AI-powered business intelligence features
 * Implements: Insights, Recommendations, Error Prevention, Forecasting
 */

import { openRouterService } from './openRouterService'
import { contextBuilder, BusinessContext } from './contextBuilder'
import { Product, Sale, DashboardStats } from '@/types'

// System prompt that defines AI behavior and rules
const SYSTEM_PROMPT = `You are a professional business intelligence assistant for a trading and inventory management system.

COMMUNICATION RULES:
- Always speak formally and professionally
- Never use emojis or casual language
- Never show confidence scores or probabilities
- Never use phrases like "I think", "maybe", "probably"
- Never hallucinate or assume data not provided
- Never mention backend systems or database access
- Be direct, clear, and actionable in all responses

DATA RULES:
- Only analyze data explicitly provided in the context
- If data is missing, state what is needed
- Reference actual numbers from the provided context
- Never extrapolate beyond available historical data

ANALYSIS RULES:
- Provide concrete, actionable recommendations
- Explain the reasoning behind each insight
- Identify specific issues and opportunities
- Prioritize recommendations by business impact

You are analyzing real business data to help optimize operations, increase profitability, and prevent errors.`

export interface ProfitInsight {
  type: 'success' | 'warning' | 'error'
  title: string
  description: string
  recommendation: string
  impact: 'high' | 'medium' | 'low'
  relatedProducts?: string[]
}

export interface PriceSuggestion {
  productId: string
  productName: string
  currentPrice: number
  suggestedPrice: number
  reasoning: string
  expectedImpact: string
}

export interface StockRecommendation {
  productId: string
  productName: string
  currentStock: number
  reorderLevel: number
  suggestedQuantity: number
  urgency: 'critical' | 'high' | 'medium' | 'low'
  reasoning: string
  estimatedDaysUntilStockout?: number
}

export interface RetailAnalysis {
  productId: string
  productName: string
  recommendation: 'retail' | 'wholesale' | 'both'
  reasoning: string
  suggestedMinimum?: number
  tradeoffs: string
}

export interface BusinessSummary {
  date: string
  overview: string
  highlights: string[]
  concerns: string[]
  topPerformers: string[]
  actionItems: string[]
}

export interface ErrorWarning {
  severity: 'critical' | 'warning' | 'info'
  message: string
  suggestion: string
  canProceed: boolean
}

export interface ForecastData {
  productId: string
  productName: string
  forecastedDemand: number
  stockoutDate?: string
  confidence: 'data-based' | 'limited-data'
  reasoning: string
}

class AIEngine {
  /**
   * Analyze profit margins and generate insights
   */
  async generateProfitInsights(context: BusinessContext): Promise<ProfitInsight[]> {
    if (!openRouterService.isConfigured()) {
      return this.getFallbackProfitInsights(context)
    }

    const prompt = `${contextBuilder.formatContextForAI(context)}

Analyze the business performance and provide 3-5 specific profit insights.

For each insight, identify:
1. The issue or opportunity
2. Specific products or metrics involved
3. The business impact (high/medium/low)
4. A concrete recommendation

Focus on:
- Low-margin products (below 20%)
- Loss-making products (negative margins)
- High-performing products
- Pricing opportunities
- Cost optimization

Format your response as a JSON array with this structure:
[
  {
    "type": "success|warning|error",
    "title": "Brief title",
    "description": "Detailed explanation",
    "recommendation": "Specific action to take",
    "impact": "high|medium|low",
    "relatedProducts": ["product names"]
  }
]`

    try {
      const response = await openRouterService.complete([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ], { useCache: true })

      return this.parseJSONResponse<ProfitInsight[]>(response, [])
    } catch (error) {
      console.error('AI profit insights failed:', error)
      return this.getFallbackProfitInsights(context)
    }
  }

  /**
   * Generate price suggestions for products
   */
  async generatePriceSuggestions(
    products: Product[],
    sales: Sale[],
    context: BusinessContext
  ): Promise<PriceSuggestion[]> {
    if (!openRouterService.isConfigured()) {
      return this.getFallbackPriceSuggestions(products, sales)
    }

    const productDetails = products.map(p => {
      const productSales = sales.filter(s => s.productId === p.id)
      const salesVelocity = productSales.length
      const totalRevenue = productSales.reduce((sum, s) => sum + s.totalAmount, 0)
      const margin = ((p.sellingPrice - p.costPrice) / p.costPrice * 100).toFixed(1)

      return `${p.name}: Cost ${p.costPrice}, Price ${p.sellingPrice}, Margin ${margin}%, Stock ${p.currentStock}, Sales ${salesVelocity}`
    }).join('\n')

    const prompt = `${contextBuilder.formatContextForAI(context)}

PRODUCT DETAILS:
${productDetails}

Analyze pricing strategy and suggest price adjustments for products that would benefit from repricing.

Consider:
- Products with margins below 25% (suggest increase)
- Products with very low sales velocity (may be overpriced)
- Products with high sales and good margins (potential for optimization)
- Market positioning (wholesale vs retail)

Provide 3-5 specific price suggestions as JSON:
[
  {
    "productId": "id",
    "productName": "name",
    "currentPrice": 0,
    "suggestedPrice": 0,
    "reasoning": "Why this price makes sense",
    "expectedImpact": "What will happen"
  }
]

Important: Suggested prices must be above cost price. Never suggest loss-making prices.`

    try {
      const response = await openRouterService.complete([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ], { useCache: true })

      return this.parseJSONResponse<PriceSuggestion[]>(response, [])
    } catch (error) {
      console.error('AI price suggestions failed:', error)
      return this.getFallbackPriceSuggestions(products, sales)
    }
  }

  /**
   * Generate stock reorder recommendations
   */
  async generateStockRecommendations(
    products: Product[],
    sales: Sale[],
    context: BusinessContext
  ): Promise<StockRecommendation[]> {
    if (!openRouterService.isConfigured()) {
      return this.getFallbackStockRecommendations(products, sales)
    }

    const lowStockProducts = products.filter(p => p.currentStock <= p.reorderLevel)
    
    if (lowStockProducts.length === 0) {
      return []
    }

    const productDetails = lowStockProducts.map(p => {
      const last30DaysSales = sales.filter(s => {
        const saleDate = new Date(s.date)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return s.productId === p.id && saleDate >= thirtyDaysAgo
      })
      
      const quantitySold = last30DaysSales.reduce((sum, s) => {
        if (s.unit === 'bag') return sum + s.quantity
        if (s.unit === 'cup') return sum + (s.quantity / (p.cupsPerBag || 1))
        if (s.unit === 'bucket') return sum + (s.quantity / (p.bucketsPerBag || 1))
        return sum
      }, 0)

      return `${p.name}: Current ${p.currentStock}, Reorder ${p.reorderLevel}, Sold (30d) ${quantitySold.toFixed(1)}`
    }).join('\n')

    const prompt = `${contextBuilder.formatContextForAI(context)}

LOW STOCK PRODUCTS:
${productDetails}

Analyze sales velocity and recommend reorder quantities for each low-stock product.

Calculate:
- Average daily sales rate
- Estimated days until stockout
- Recommended reorder quantity (to last 30-60 days)
- Urgency level

Provide recommendations as JSON:
[
  {
    "productId": "id",
    "productName": "name",
    "currentStock": 0,
    "reorderLevel": 0,
    "suggestedQuantity": 0,
    "urgency": "critical|high|medium|low",
    "reasoning": "Explanation based on sales data",
    "estimatedDaysUntilStockout": 0
  }
]`

    try {
      const response = await openRouterService.complete([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ], { useCache: true })

      return this.parseJSONResponse<StockRecommendation[]>(response, [])
    } catch (error) {
      console.error('AI stock recommendations failed:', error)
      return this.getFallbackStockRecommendations(products, sales)
    }
  }

  /**
   * Analyze retail vs wholesale performance
   */
  async analyzeRetailWholesale(
    products: Product[],
    sales: Sale[],
    context: BusinessContext
  ): Promise<RetailAnalysis[]> {
    if (!openRouterService.isConfigured()) {
      return this.getFallbackRetailAnalysis(products, sales)
    }

    const retailProducts = products.filter(p => p.isRetailEnabled)
    
    if (retailProducts.length === 0) {
      return []
    }

    const productDetails = retailProducts.map(p => {
      const productSales = sales.filter(s => s.productId === p.id)
      const bagSales = productSales.filter(s => s.unit === 'bag').length
      const cupSales = productSales.filter(s => s.unit === 'cup').length
      const bucketSales = productSales.filter(s => s.unit === 'bucket').length

      return `${p.name}: Bag sales ${bagSales}, Cup sales ${cupSales}, Bucket sales ${bucketSales}, Cup price ${p.cupPrice}, Bucket price ${p.bucketPrice}`
    }).join('\n')

    const prompt = `${contextBuilder.formatContextForAI(context)}

RETAIL/WHOLESALE BREAKDOWN:
${productDetails}

Analyze whether each product performs better as retail (cups/buckets) or wholesale (bags).

Consider:
- Sales frequency by unit type
- Profit margins per unit
- Operational efficiency
- Customer preferences

Provide analysis as JSON:
[
  {
    "productId": "id",
    "productName": "name",
    "recommendation": "retail|wholesale|both",
    "reasoning": "Data-driven explanation",
    "suggestedMinimum": 0,
    "tradeoffs": "What to consider"
  }
]`

    try {
      const response = await openRouterService.complete([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ], { useCache: true })

      return this.parseJSONResponse<RetailAnalysis[]>(response, [])
    } catch (error) {
      console.error('AI retail analysis failed:', error)
      return this.getFallbackRetailAnalysis(products, sales)
    }
  }

  /**
   * Generate daily business summary
   */
  async generateDailySummary(context: BusinessContext): Promise<BusinessSummary> {
    if (!openRouterService.isConfigured()) {
      return this.getFallbackDailySummary(context)
    }

    const prompt = `${contextBuilder.formatContextForAI(context)}

Generate a comprehensive daily business summary in the style of an executive briefing.

Include:
1. Overview: One-paragraph summary of today's performance
2. Highlights: 3-5 positive achievements or notable events
3. Concerns: 2-3 issues requiring attention
4. Top Performers: Best-selling products today
5. Action Items: Specific tasks to address today

Format as JSON:
{
  "date": "YYYY-MM-DD",
  "overview": "Executive summary paragraph",
  "highlights": ["item 1", "item 2", ...],
  "concerns": ["concern 1", "concern 2", ...],
  "topPerformers": ["product 1", "product 2", ...],
  "actionItems": ["action 1", "action 2", ...]
}`

    try {
      const response = await openRouterService.complete([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ], { useCache: false, temperature: 0.5 })

      return this.parseJSONResponse<BusinessSummary>(response, this.getFallbackDailySummary(context))
    } catch (error) {
      console.error('AI daily summary failed:', error)
      return this.getFallbackDailySummary(context)
    }
  }

  /**
   * Validate transaction before submission
   */
  async validateTransaction(
    type: 'sale' | 'stock' | 'price',
    data: any,
    context: BusinessContext
  ): Promise<ErrorWarning[]> {
    const warnings: ErrorWarning[] = []

    if (type === 'sale') {
      const product = context.products.find(p => p.id === data.productId)
      
      if (!product) {
        warnings.push({
          severity: 'critical',
          message: 'Product not found in current inventory.',
          suggestion: 'Please refresh the page and try again.',
          canProceed: false,
        })
        return warnings
      }

      // Check stock availability
      let requiredStock = data.quantity
      if (data.unit === 'cup' && product.retailUnits?.cupsPerBag) {
        requiredStock = data.quantity / product.retailUnits.cupsPerBag
      } else if (data.unit === 'bucket' && product.retailUnits?.bucketsPerBag) {
        requiredStock = data.quantity / product.retailUnits.bucketsPerBag
      }

      if (product.currentStock < requiredStock) {
        warnings.push({
          severity: 'critical',
          message: `Insufficient stock. Available: ${product.currentStock} bags, Required: ${requiredStock.toFixed(2)} bags.`,
          suggestion: 'Add stock before recording this sale or reduce the quantity.',
          canProceed: false,
        })
      }

      // Check if selling below cost
      const unitPrice = data.unit === 'bag' ? product.sellingPrice :
                       data.unit === 'cup' ? product.retailUnits?.cupPrice :
                       product.retailUnits?.bucketPrice

      const costPerUnit = data.unit === 'bag' ? product.costPrice :
                         data.unit === 'cup' ? product.costPrice / (product.retailUnits?.cupsPerBag || 1) :
                         product.costPrice / (product.retailUnits?.bucketsPerBag || 1)

      if (unitPrice && unitPrice < costPerUnit) {
        warnings.push({
          severity: 'warning',
          message: `Selling below cost. Unit price: ${unitPrice}, Cost: ${costPerUnit.toFixed(2)}. Loss: ${(costPerUnit - unitPrice).toFixed(2)} per unit.`,
          suggestion: 'Consider adjusting the price to maintain profitability.',
          canProceed: true,
        })
      }

      // Check for unusually large quantities
      const avgQuantity = 10 // This should be calculated from historical data
      if (data.quantity > avgQuantity * 5) {
        warnings.push({
          severity: 'warning',
          message: `Unusually large quantity (${data.quantity} units). Average order is ${avgQuantity} units.`,
          suggestion: 'Verify the quantity is correct before proceeding.',
          canProceed: true,
        })
      }
    }

    if (type === 'price') {
      const product = context.products.find(p => p.id === data.productId)
      
      if (!product) return warnings

      if (data.sellingPrice < product.costPrice) {
        warnings.push({
          severity: 'critical',
          message: `New price (${data.sellingPrice}) is below cost price (${product.costPrice}). This will result in losses.`,
          suggestion: 'Set a price above cost to ensure profitability.',
          canProceed: true,
        })
      }

      const margin = ((data.sellingPrice - product.costPrice) / product.costPrice) * 100
      if (margin < 10) {
        warnings.push({
          severity: 'warning',
          message: `Low profit margin (${margin.toFixed(1)}%). Recommended minimum is 20%.`,
          suggestion: 'Consider increasing the price to improve margins.',
          canProceed: true,
        })
      }
    }

    return warnings
  }

  /**
   * Generate sales forecast
   */
  async generateForecast(
    products: Product[],
    sales: Sale[],
    days: number = 7
  ): Promise<ForecastData[]> {
    const forecasts: ForecastData[] = []

    for (const product of products) {
      if (!product.isActive) continue

      const productSales = sales.filter(s => s.productId === product.id)
      
      if (productSales.length < 3) {
        // Not enough data for meaningful forecast
        continue
      }

      // Calculate average daily sales over last 30 days
      const last30Days = sales.filter(s => {
        const saleDate = new Date(s.date)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return s.productId === product.id && saleDate >= thirtyDaysAgo
      })

      const totalQuantity = last30Days.reduce((sum, s) => {
        if (s.unit === 'bag') return sum + s.quantity
        if (s.unit === 'cup') return sum + (s.quantity / (product.cupsPerBag || 1))
        if (s.unit === 'bucket') return sum + (s.quantity / (product.bucketsPerBag || 1))
        return sum
      }, 0)

      const avgDailySales = totalQuantity / 30
      const forecastedDemand = avgDailySales * days

      let stockoutDate: string | undefined
      if (avgDailySales > 0) {
        const daysUntilStockout = product.currentStock / avgDailySales
        if (daysUntilStockout < 30) {
          const stockoutDateObj = new Date()
          stockoutDateObj.setDate(stockoutDateObj.getDate() + Math.floor(daysUntilStockout))
          stockoutDate = stockoutDateObj.toISOString().split('T')[0]
        }
      }

      forecasts.push({
        productId: product.id,
        productName: product.name,
        forecastedDemand: Number(forecastedDemand.toFixed(2)),
        stockoutDate,
        confidence: last30Days.length >= 10 ? 'data-based' : 'limited-data',
        reasoning: `Based on ${last30Days.length} sales over the last 30 days, averaging ${avgDailySales.toFixed(2)} units per day.`,
      })
    }

    return forecasts.sort((a, b) => {
      if (a.stockoutDate && !b.stockoutDate) return -1
      if (!a.stockoutDate && b.stockoutDate) return 1
      return 0
    })
  }

  /**
   * Parse JSON response with fallback
   */
  private parseJSONResponse<T>(response: string, fallback: T): T {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```(?:json)?\s*(\[[\s\S]*?\]|\{[\s\S]*?\})\s*```/)
      const jsonString = jsonMatch ? jsonMatch[1] : response

      return JSON.parse(jsonString.trim())
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      return fallback
    }
  }

  /**
   * Fallback profit insights when AI is unavailable
   */
  private getFallbackProfitInsights(context: BusinessContext): ProfitInsight[] {
    const insights: ProfitInsight[] = []

    // Check for low-margin products
    const lowMarginProducts = context.products.filter(p => p.marginPercentage < 20 && p.marginPercentage > 0)
    if (lowMarginProducts.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Low Profit Margins Detected',
        description: `${lowMarginProducts.length} products have profit margins below 20%, which may not be sustainable.`,
        recommendation: 'Review pricing strategy for these products and consider price adjustments to improve profitability.',
        impact: 'high',
        relatedProducts: lowMarginProducts.map(p => p.name),
      })
    }

    // Check for loss leaders
    if (context.performance.lossLeaders.length > 0) {
      insights.push({
        type: 'error',
        title: 'Products Selling Below Cost',
        description: `${context.performance.lossLeaders.length} products are currently priced below their cost, resulting in losses on every sale.`,
        recommendation: 'Immediately adjust prices to be above cost price or discontinue these products.',
        impact: 'high',
        relatedProducts: context.performance.lossLeaders.map(l => l.name),
      })
    }

    // Highlight best performers
    if (context.performance.bestPerformers.length > 0) {
      const topProduct = context.performance.bestPerformers[0]
      insights.push({
        type: 'success',
        title: 'Strong Product Performance',
        description: `${topProduct.name} has generated ${topProduct.profit.toFixed(2)} in profit with a ${topProduct.marginPercentage.toFixed(1)}% margin.`,
        recommendation: 'Consider increasing inventory levels for top performers to maximize sales opportunities.',
        impact: 'medium',
        relatedProducts: [topProduct.name],
      })
    }

    return insights
  }

  /**
   * Fallback price suggestions when AI is unavailable
   */
  private getFallbackPriceSuggestions(products: Product[], sales: Sale[]): PriceSuggestion[] {
    const suggestions: PriceSuggestion[] = []

    for (const product of products) {
      const margin = ((product.sellingPrice - product.costPrice) / product.costPrice) * 100

      // Suggest price increase for low-margin products
      if (margin < 25 && margin > 0) {
        const suggestedPrice = product.costPrice * 1.3 // 30% markup
        suggestions.push({
          productId: product.id,
          productName: product.name,
          currentPrice: product.sellingPrice,
          suggestedPrice: Number(suggestedPrice.toFixed(2)),
          reasoning: `Current margin of ${margin.toFixed(1)}% is below the recommended 25% minimum. A price increase would improve profitability.`,
          expectedImpact: 'Increased profit per unit while maintaining competitive positioning.',
        })
      }
    }

    return suggestions.slice(0, 5)
  }

  /**
   * Fallback stock recommendations when AI is unavailable
   */
  private getFallbackStockRecommendations(products: Product[], sales: Sale[]): StockRecommendation[] {
    const recommendations: StockRecommendation[] = []

    for (const product of products) {
      if (product.currentStock > product.reorderLevel) continue

      const last30DaysSales = sales.filter(s => {
        const saleDate = new Date(s.date)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return s.productId === product.id && saleDate >= thirtyDaysAgo
      })

      const totalSold = last30DaysSales.reduce((sum, s) => {
        if (s.unit === 'bag') return sum + s.quantity
        if (s.unit === 'cup') return sum + (s.quantity / (product.cupsPerBag || 1))
        if (s.unit === 'bucket') return sum + (s.quantity / (product.bucketsPerBag || 1))
        return sum
      }, 0)

      const avgDailySales = totalSold / 30
      const daysOfStock = avgDailySales > 0 ? product.currentStock / avgDailySales : 999
      const suggestedQuantity = Math.ceil(avgDailySales * 45) // 45 days worth

      let urgency: 'critical' | 'high' | 'medium' | 'low' = 'low'
      if (daysOfStock < 3) urgency = 'critical'
      else if (daysOfStock < 7) urgency = 'high'
      else if (daysOfStock < 14) urgency = 'medium'

      recommendations.push({
        productId: product.id,
        productName: product.name,
        currentStock: product.currentStock,
        reorderLevel: product.reorderLevel,
        suggestedQuantity: Math.max(suggestedQuantity, product.reorderLevel),
        urgency,
        reasoning: `Based on ${last30DaysSales.length} sales in the last 30 days, averaging ${avgDailySales.toFixed(2)} units per day.`,
        estimatedDaysUntilStockout: daysOfStock < 999 ? Math.floor(daysOfStock) : undefined,
      })
    }

    return recommendations.sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    })
  }

  /**
   * Fallback retail analysis when AI is unavailable
   */
  private getFallbackRetailAnalysis(products: Product[], sales: Sale[]): RetailAnalysis[] {
    const analysis: RetailAnalysis[] = []

    for (const product of products) {
      if (!product.isRetailEnabled) continue

      const productSales = sales.filter(s => s.productId === product.id)
      const bagSales = productSales.filter(s => s.unit === 'bag').length
      const retailSales = productSales.filter(s => s.unit === 'cup' || s.unit === 'bucket').length

      let recommendation: 'retail' | 'wholesale' | 'both' = 'both'
      if (retailSales > bagSales * 2) recommendation = 'retail'
      else if (bagSales > retailSales * 2) recommendation = 'wholesale'

      analysis.push({
        productId: product.id,
        productName: product.name,
        recommendation,
        reasoning: `Product has ${bagSales} wholesale sales and ${retailSales} retail sales, indicating ${recommendation} preference.`,
        suggestedMinimum: recommendation === 'wholesale' ? 5 : undefined,
        tradeoffs: 'Retail provides higher margins per unit but requires more handling. Wholesale is more efficient but at lower margins.',
      })
    }

    return analysis
  }

  /**
   * Fallback daily summary when AI is unavailable
   */
  private getFallbackDailySummary(context: BusinessContext): BusinessSummary {
    const highlights: string[] = []
    const concerns: string[] = []

    if (context.sales.today.totalProfit > 0) {
      highlights.push(`Generated ${context.sales.today.totalProfit.toFixed(2)} in profit from ${context.sales.today.transactionCount} transactions.`)
    }

    if (context.sales.today.profitMargin > 30) {
      highlights.push(`Maintained strong profit margin of ${context.sales.today.profitMargin.toFixed(1)}%.`)
    }

    if (context.inventory.lowStockCount > 0) {
      concerns.push(`${context.inventory.lowStockCount} products are below reorder level and require restocking.`)
    }

    if (context.performance.lossLeaders.length > 0) {
      concerns.push(`${context.performance.lossLeaders.length} products are selling below cost, resulting in losses.`)
    }

    return {
      date: context.dates.today,
      overview: `Business operations for ${context.dates.today} show ${context.sales.today.transactionCount} transactions totaling ${context.sales.today.totalRevenue.toFixed(2)} in revenue with ${context.sales.today.totalProfit.toFixed(2)} profit.`,
      highlights: highlights.length > 0 ? highlights : ['Normal operations maintained throughout the day.'],
      concerns: concerns.length > 0 ? concerns : ['No significant concerns identified.'],
      topPerformers: context.sales.topProducts.slice(0, 3).map(p => p.name),
      actionItems: context.inventory.lowStockCount > 0 
        ? [`Reorder stock for ${context.inventory.lowStockCount} low-stock products.`]
        : ['Monitor inventory levels and maintain current operations.'],
    }
  }
}

// Export singleton instance
export const aiEngine = new AIEngine()
