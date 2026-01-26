import { Product, Sale, DashboardStats } from '@/types'

// OpenRouter API configuration
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || ''
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Model fallback chain (free models)
const AI_MODELS = [
  'openai/gpt-4o-mini-2024-07-18', // Primary - more reliable than gpt-oss
  'google/gemini-2.0-flash-exp:free', // Fallback 1
  'meta-llama/llama-3.2-3b-instruct:free', // Fallback 2
]

interface AIContext {
  storeName: string
  userName: string
  products: Product[]
  recentSales: Sale[]
  dashboardStats: DashboardStats
  lowStockProducts: Product[]
  timestamp: string
}

interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIResponse {
  success: boolean
  message: string
  error?: string
  model?: string
}

class AIService {
  private currentContext: AIContext | null = null
  private conversationHistory: AIMessage[] = []
  private currentModelIndex: number = 0
  private cache: Map<string, { response: string; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Update AI context with latest user data
   * This should be called when data changes (sales, products, etc.)
   */
  updateContext(context: Partial<AIContext>): void {
    this.currentContext = {
      ...this.currentContext,
      ...context,
      timestamp: new Date().toISOString(),
    } as AIContext
  }

  /**
   * Build system prompt with current user's business context
   */
  private buildSystemPrompt(): string {
    if (!this.currentContext) {
      return 'You are a helpful business assistant.'
    }

    const ctx = this.currentContext
    const productsSummary = ctx.products
      .map(p => `- ${p.name}: Stock=${p.currentStock}, Cost=₦${p.costPrice}, Selling=₦${p.sellingPrice}`)
      .join('\n')

    const salesSummary = ctx.recentSales.length > 0
      ? ctx.recentSales
          .slice(0, 10)
          .map(s => `- ${s.productName}: ${s.quantity} ${s.unit}, ₦${s.totalAmount} (${s.paymentMethod})`)
          .join('\n')
      : 'No recent sales'

    return `You are an AI business assistant for "${ctx.storeName}", owned by ${ctx.userName}.

BUSINESS CONTEXT (${ctx.timestamp}):

Products (${ctx.products.length} total):
${productsSummary}

Recent Sales:
${salesSummary}

Today's Performance:
- Total Sales: ₦${ctx.dashboardStats.todaySales.toLocaleString()}
- Total Profit: ₦${ctx.dashboardStats.todayProfit.toLocaleString()}
- Sales Count: ${ctx.dashboardStats.todaySalesCount}
- Cash Sales: ₦${ctx.dashboardStats.cashSales.toLocaleString()}
- POS Sales: ₦${ctx.dashboardStats.posSales.toLocaleString()}
- Bank Transfer: ₦${ctx.dashboardStats.bankTransferSales.toLocaleString()}

Low Stock Items: ${ctx.lowStockProducts.map(p => p.name).join(', ') || 'None'}

RULES:
1. Only use the data provided above - never invent or assume information
2. If asked about something not in the data, politely say you don't have that information
3. Speak professionally and clearly
4. Provide actionable insights based on the data
5. Focus on helping the business owner make better decisions
6. Be concise but helpful
7. Never reference other stores or businesses
8. When suggesting actions, explain your reasoning with specific numbers from the data

You are advisory only - you cannot perform actions, only provide guidance.`
  }

  /**
   * Call OpenRouter API with model fallback
   */
  private async callOpenRouter(messages: AIMessage[]): Promise<AIResponse> {
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
      return {
        success: false,
        message: '',
        error: 'AI service not configured. Please add a valid VITE_OPENROUTER_API_KEY to your .env file. Get your free API key from https://openrouter.ai/keys',
      }
    }

    // Try each model in sequence
    for (let i = this.currentModelIndex; i < AI_MODELS.length; i++) {
      try {
        const response = await fetch(OPENROUTER_BASE_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Grasunny Inventory AI',
          },
          body: JSON.stringify({
            model: AI_MODELS[i],
            messages,
            temperature: 0.7,
            max_tokens: 500,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn(`Model ${AI_MODELS[i]} failed:`, errorData)
          
          // Try next model
          continue
        }

        const data = await response.json()
        
        if (!data.choices || !data.choices[0]?.message?.content) {
          console.warn(`Invalid response from ${AI_MODELS[i]}`)
          continue
        }

        // Success! Update current model index for next time
        this.currentModelIndex = i

        return {
          success: true,
          message: data.choices[0].message.content.trim(),
          model: AI_MODELS[i],
        }
      } catch (error) {
        console.warn(`Error with model ${AI_MODELS[i]}:`, error)
        // Try next model
        continue
      }
    }

    // All models failed
    return {
      success: false,
      message: '',
      error: 'AI service is temporarily unavailable. Please try again later.',
    }
  }

  /**
   * Generate AI insight for passive display
   */
  async generateInsight(context: string, maxLength: number = 150): Promise<AIResponse> {
    // Check cache first
    const cacheKey = `insight:${context}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return { success: true, message: cached.response }
    }

    const systemPrompt = this.buildSystemPrompt()
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Provide a brief business insight about: ${context}. Maximum ${maxLength} characters. Be specific and use numbers from the data.`
      },
    ]

    const response = await this.callOpenRouter(messages)

    if (response.success) {
      // Cache the response
      this.cache.set(cacheKey, {
        response: response.message,
        timestamp: Date.now(),
      })
    }

    return response
  }

  /**
   * Chat with AI (interactive conversation)
   */
  async chat(userMessage: string): Promise<AIResponse> {
    // Add system prompt if this is a new conversation
    if (this.conversationHistory.length === 0) {
      this.conversationHistory.push({
        role: 'system',
        content: this.buildSystemPrompt(),
      })
    }

    // Add user message
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    })

    // Call AI
    const response = await this.callOpenRouter(this.conversationHistory)

    if (response.success) {
      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response.message,
      })

      // Keep conversation history manageable (last 10 messages)
      if (this.conversationHistory.length > 11) {
        // Keep system message and last 10 exchanges
        this.conversationHistory = [
          this.conversationHistory[0], // system
          ...this.conversationHistory.slice(-10),
        ]
      }
    }

    return response
  }

  /**
   * Clear conversation history (e.g., when user navigates away)
   */
  clearConversation(): void {
    this.conversationHistory = []
  }

  /**
   * Clear context on logout
   */
  clearContext(): void {
    this.currentContext = null
    this.conversationHistory = []
    this.cache.clear()
    this.currentModelIndex = 0
  }

  /**
   * Get current context (for debugging)
   */
  getContext(): AIContext | null {
    return this.currentContext
  }
}

// Singleton instance
export const aiService = new AIService()

// Export types
export type { AIContext, AIResponse }
