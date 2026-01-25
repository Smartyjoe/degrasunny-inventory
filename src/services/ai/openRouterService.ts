/**
 * OpenRouter AI Service
 * Handles direct API communication with OpenRouter
 * All AI computation runs client-side through this service
 */

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterRequest {
  model: string
  messages: OpenRouterMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
}

interface OpenRouterResponse {
  id: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface ModelConfig {
  name: string
  maxTokens: number
  temperature: number
  timeout: number
}

// Model configurations with fallback priority
const MODELS: ModelConfig[] = [
  {
    name: 'openai/gpt-4o-mini',
    maxTokens: 4096,
    temperature: 0.7,
    timeout: 30000,
  },
  {
    name: 'deepseek/deepseek-r1-distill-llama-70b',
    maxTokens: 4096,
    temperature: 0.7,
    timeout: 30000,
  },
  {
    name: 'google/gemini-2.0-flash-001',
    maxTokens: 4096,
    temperature: 0.7,
    timeout: 30000,
  },
]

class OpenRouterService {
  private apiKey: string
  private baseURL = 'https://openrouter.ai/api/v1'
  private currentModelIndex = 0
  private requestCache = new Map<string, { response: string; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || ''
    
    if (!this.apiKey) {
      console.warn('OpenRouter API key not configured. AI features will be limited.')
    }
  }

  /**
   * Check if API key is configured
   */
  public isConfigured(): boolean {
    return !!this.apiKey
  }

  /**
   * Get cache key for request
   */
  private getCacheKey(messages: OpenRouterMessage[]): string {
    return JSON.stringify(messages)
  }

  /**
   * Check cache for response
   */
  private checkCache(messages: OpenRouterMessage[]): string | null {
    const key = this.getCacheKey(messages)
    const cached = this.requestCache.get(key)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.response
    }
    
    // Clean up expired cache
    if (cached) {
      this.requestCache.delete(key)
    }
    
    return null
  }

  /**
   * Save response to cache
   */
  private saveToCache(messages: OpenRouterMessage[], response: string): void {
    const key = this.getCacheKey(messages)
    this.requestCache.set(key, { response, timestamp: Date.now() })
    
    // Limit cache size to 50 entries
    if (this.requestCache.size > 50) {
      const firstKey = this.requestCache.keys().next().value
      this.requestCache.delete(firstKey)
    }
  }

  /**
   * Make request to OpenRouter with automatic fallback
   */
  public async complete(
    messages: OpenRouterMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      useCache?: boolean
    }
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key not configured')
    }

    // Check cache first
    if (options?.useCache !== false) {
      const cached = this.checkCache(messages)
      if (cached) {
        return cached
      }
    }

    // Try each model with fallback
    let lastError: Error | null = null
    
    for (let i = 0; i < MODELS.length; i++) {
      const modelIndex = (this.currentModelIndex + i) % MODELS.length
      const model = MODELS[modelIndex]
      
      try {
        const response = await this.makeRequest(messages, model, options)
        
        // Success - update current model index
        this.currentModelIndex = modelIndex
        
        // Cache the response
        if (options?.useCache !== false) {
          this.saveToCache(messages, response)
        }
        
        return response
      } catch (error) {
        lastError = error as Error
        console.warn(`Model ${model.name} failed, trying fallback...`, error)
        
        // If this was a rate limit error, skip to next model immediately
        if (this.isRateLimitError(error)) {
          continue
        }
        
        // For other errors, if we have more models to try, continue
        if (i < MODELS.length - 1) {
          continue
        }
      }
    }

    // All models failed
    throw new Error(
      `All AI models failed. Last error: ${lastError?.message || 'Unknown error'}`
    )
  }

  /**
   * Make actual HTTP request to OpenRouter
   */
  private async makeRequest(
    messages: OpenRouterMessage[],
    model: ModelConfig,
    options?: {
      temperature?: number
      maxTokens?: number
    }
  ): Promise<string> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), model.timeout)

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Business Management AI Assistant',
        },
        body: JSON.stringify({
          model: model.name,
          messages,
          temperature: options?.temperature ?? model.temperature,
          max_tokens: options?.maxTokens ?? model.maxTokens,
        } as OpenRouterRequest),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data: OpenRouterResponse = await response.json()

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from AI model')
      }

      return data.choices[0].message.content
    } catch (error) {
      clearTimeout(timeoutId)
      
      if ((error as Error).name === 'AbortError') {
        throw new Error(`Request timeout after ${model.timeout}ms`)
      }
      
      throw error
    }
  }

  /**
   * Check if error is a rate limit error
   */
  private isRateLimitError(error: unknown): boolean {
    const message = (error as Error).message.toLowerCase()
    return message.includes('rate limit') || message.includes('429')
  }

  /**
   * Get current model info
   */
  public getCurrentModel(): ModelConfig {
    return MODELS[this.currentModelIndex]
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.requestCache.clear()
  }
}

// Export singleton instance
export const openRouterService = new OpenRouterService()
