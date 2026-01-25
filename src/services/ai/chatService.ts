/**
 * AI Chat Service
 * Natural language interface for business queries
 * Processes user questions using frontend data only
 */

import { openRouterService } from './openRouterService'
import { contextBuilder, BusinessContext } from './contextBuilder'
import { Product, Sale, DashboardStats } from '@/types'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatContext {
  messages: ChatMessage[]
  businessContext?: BusinessContext
}

const CHAT_SYSTEM_PROMPT = `You are a professional business intelligence assistant for a trading and inventory management system.

COMMUNICATION RULES:
- Speak formally and professionally at all times
- Never use emojis, casual language, or slang
- Never show confidence scores or probabilities
- Never use uncertain language like "I think", "maybe", "probably"
- Be direct, clear, and actionable

DATA RULES:
- Only use data explicitly provided in the business context
- If data is missing or insufficient, clearly state what information is needed
- Always reference actual numbers and facts from the provided context
- Never make assumptions about data not provided
- Never mention database queries, backend systems, or API calls

RESPONSE RULES:
- Answer questions concisely and accurately
- Provide specific numbers and examples from the context
- When making recommendations, explain the reasoning
- If a question cannot be answered with available data, explain what data would be needed
- Format numbers appropriately (2 decimal places for currency)

Your purpose is to help business owners understand their performance, identify opportunities, and make informed decisions based on their actual business data.`

class ChatService {
  private conversationHistory: ChatMessage[] = []
  private maxHistoryLength = 20

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    userMessage: string,
    context: BusinessContext
  ): Promise<ChatMessage> {
    // Add user message to history
    const userChatMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }
    
    this.conversationHistory.push(userChatMessage)

    // Check if this is a simple query that can be answered without AI
    const quickResponse = this.checkQuickResponses(userMessage, context)
    if (quickResponse) {
      const assistantMessage: ChatMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: quickResponse,
        timestamp: new Date(),
      }
      this.conversationHistory.push(assistantMessage)
      this.trimHistory()
      return assistantMessage
    }

    // Build AI prompt with context
    const contextString = contextBuilder.formatContextForAI(context)
    
    // Prepare messages for AI
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      { role: 'system', content: `Current Business Context:\n${contextString}` },
    ]

    // Add recent conversation history (last 10 messages)
    const recentHistory = this.conversationHistory.slice(-10)
    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content })
      }
    }

    try {
      if (!openRouterService.isConfigured()) {
        throw new Error('AI service not configured')
      }

      const response = await openRouterService.complete(messages, {
        temperature: 0.7,
        useCache: false,
      })

      const assistantMessage: ChatMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }

      this.conversationHistory.push(assistantMessage)
      this.trimHistory()

      return assistantMessage
    } catch (error) {
      console.error('Chat AI failed:', error)
      
      // Fallback to rule-based response
      const fallbackResponse = this.generateFallbackResponse(userMessage, context)
      const assistantMessage: ChatMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date(),
      }

      this.conversationHistory.push(assistantMessage)
      this.trimHistory()

      return assistantMessage
    }
  }

  /**
   * Get conversation history
   */
  getHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = []
  }

  /**
   * Check for quick responses that don't need AI
   */
  private checkQuickResponses(message: string, context: BusinessContext): string | null {
    const lowerMessage = message.toLowerCase()

    // Today's stats
    if (lowerMessage.includes('today') && (lowerMessage.includes('sales') || lowerMessage.includes('revenue'))) {
      return `Today's performance summary:
- Total Revenue: ${context.sales.today.totalRevenue.toFixed(2)}
- Total Profit: ${context.sales.today.totalProfit.toFixed(2)}
- Transactions: ${context.sales.today.transactionCount}
- Average Order Value: ${context.sales.today.averageOrderValue.toFixed(2)}
- Profit Margin: ${context.sales.today.profitMargin.toFixed(1)}%`
    }

    // Stock status
    if (lowerMessage.includes('stock') && (lowerMessage.includes('low') || lowerMessage.includes('out'))) {
      if (context.inventory.lowStockCount === 0) {
        return 'All products are adequately stocked. No low stock alerts at this time.'
      }
      
      const lowStockList = context.inventory.lowStockProducts
        .slice(0, 5)
        .map(p => `- ${p.name}: ${p.currentStock} units (${p.deficit} units below reorder level)`)
        .join('\n')
      
      return `Low Stock Alert: ${context.inventory.lowStockCount} products require restocking.\n\nMost urgent:\n${lowStockList}`
    }

    // Best sellers
    if (lowerMessage.includes('best') || lowerMessage.includes('top')) {
      if (context.sales.topProducts.length === 0) {
        return 'No sales data available for the current period.'
      }

      const topList = context.sales.topProducts
        .slice(0, 5)
        .map((p, i) => `${i + 1}. ${p.name} - Revenue: ${p.revenue.toFixed(2)}, Profit: ${p.profit.toFixed(2)}`)
        .join('\n')

      return `Top performing products:\n${topList}`
    }

    // Profit inquiry
    if (lowerMessage.includes('profit') && lowerMessage.includes('how much')) {
      return `Current profit analysis:
- Today's Profit: ${context.sales.today.totalProfit.toFixed(2)}
- Last 7 Days: ${context.sales.recent.last7Days.totalProfit.toFixed(2)}
- Last 30 Days: ${context.sales.recent.last30Days.totalProfit.toFixed(2)}
- Today's Profit Margin: ${context.sales.today.profitMargin.toFixed(1)}%`
    }

    // Loss leaders
    if (lowerMessage.includes('loss') || (lowerMessage.includes('below') && lowerMessage.includes('cost'))) {
      if (context.performance.lossLeaders.length === 0) {
        return 'No products are currently selling below cost. All products maintain positive margins.'
      }

      const lossList = context.performance.lossLeaders
        .map(l => `- ${l.name}: Loss of ${l.lossPerUnit.toFixed(2)} per unit, Total loss: ${l.totalLoss.toFixed(2)}`)
        .join('\n')

      return `Products selling below cost (${context.performance.lossLeaders.length} items):\n${lossList}\n\nRecommendation: Adjust pricing immediately to prevent continued losses.`
    }

    return null
  }

  /**
   * Generate fallback response when AI is unavailable
   */
  private generateFallbackResponse(message: string, context: BusinessContext): string {
    const lowerMessage = message.toLowerCase()

    // Handle common business queries with rule-based responses
    if (lowerMessage.includes('improve') || lowerMessage.includes('increase')) {
      const suggestions = []
      
      if (context.performance.lossLeaders.length > 0) {
        suggestions.push(`Address ${context.performance.lossLeaders.length} products selling below cost by adjusting prices.`)
      }
      
      if (context.inventory.lowStockCount > 0) {
        suggestions.push(`Restock ${context.inventory.lowStockCount} low-inventory products to avoid missed sales.`)
      }

      const lowMarginProducts = context.products.filter(p => p.marginPercentage < 20 && p.marginPercentage > 0)
      if (lowMarginProducts.length > 0) {
        suggestions.push(`Review pricing for ${lowMarginProducts.length} products with margins below 20%.`)
      }

      if (suggestions.length === 0) {
        return 'Current operations appear optimized. Continue monitoring daily performance and maintain stock levels for top sellers.'
      }

      return `To improve business performance:\n\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    }

    if (lowerMessage.includes('reorder') || lowerMessage.includes('buy')) {
      if (context.inventory.lowStockCount === 0) {
        return 'All products are currently above reorder levels. No immediate restocking required.'
      }

      return `Stock reorder recommendation: ${context.inventory.lowStockCount} products are below reorder level and require restocking to maintain inventory levels.`
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('pricing')) {
      const lowMarginProducts = context.products.filter(p => p.marginPercentage < 20 && p.marginPercentage > 0)
      
      if (lowMarginProducts.length > 0) {
        return `Pricing analysis: ${lowMarginProducts.length} products have margins below 20%. Consider price increases to improve profitability. Recommended minimum margin is 25-30%.`
      }

      return 'Current pricing structure maintains healthy margins across most products. Continue monitoring competitive positioning.'
    }

    if (lowerMessage.includes('forecast') || lowerMessage.includes('predict')) {
      const avgDaily = context.sales.recent.last7Days.averageDaily
      const projected7Days = avgDaily * 7
      const projected30Days = avgDaily * 30

      return `Sales forecast based on recent performance:
- Average Daily Revenue: ${avgDaily.toFixed(2)}
- 7-Day Projection: ${projected7Days.toFixed(2)}
- 30-Day Projection: ${projected30Days.toFixed(2)}

Note: Projections assume consistent sales patterns. Actual results may vary based on market conditions.`
    }

    // Generic helpful response
    return `I can help you analyze your business data. Here are some questions you can ask:

- "What were today's sales and profit?"
- "Which products are low on stock?"
- "What are my best-selling products?"
- "Which products are selling below cost?"
- "How can I improve my profit margins?"
- "What should I reorder?"

Please ask a specific question about your business performance, inventory, sales, or pricing.`
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Trim conversation history to prevent unlimited growth
   */
  private trimHistory(): void {
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength)
    }
  }

  /**
   * Get suggested questions based on current context
   */
  getSuggestedQuestions(context: BusinessContext): string[] {
    const suggestions: string[] = []

    if (context.sales.today.transactionCount > 0) {
      suggestions.push("How did we perform today?")
    }

    if (context.inventory.lowStockCount > 0) {
      suggestions.push("What products should I reorder?")
    }

    if (context.performance.lossLeaders.length > 0) {
      suggestions.push("Which products are losing money?")
    }

    if (context.sales.topProducts.length > 0) {
      suggestions.push("What are my best-selling products?")
    }

    // Always include these general questions
    suggestions.push("How can I increase my profit?")
    suggestions.push("Summarize my business performance")

    return suggestions.slice(0, 6)
  }
}

// Export singleton instance
export const chatService = new ChatService()
