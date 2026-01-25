/**
 * AI Hooks
 * React hooks for integrating AI features into components
 */

import { useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAIStore } from '@/store/aiStore'
import { aiEngine } from '@/services/ai/aiEngine'
import { chatService } from '@/services/ai/chatService'
import { contextBuilder } from '@/services/ai/contextBuilder'
import { Product, Sale, DashboardStats, ProductPerformance } from '@/types'

/**
 * Hook for AI profit insights
 */
export const useProfitInsights = (
  products: Product[],
  sales: Sale[],
  dashboardStats?: DashboardStats
) => {
  const { profitInsights, setProfitInsights, isDataStale, profitInsightsLastUpdated, aiEnabled } = useAIStore()

  const fetchInsights = useCallback(async () => {
    if (!aiEnabled || !products.length) return profitInsights

    const context = contextBuilder.buildContext({
      products,
      sales,
      dashboardStats,
    })

    const insights = await aiEngine.generateProfitInsights(context)
    setProfitInsights(insights)
    return insights
  }, [products, sales, dashboardStats, aiEnabled])

  const query = useQuery({
    queryKey: ['ai', 'profit-insights', products.length, sales.length],
    queryFn: fetchInsights,
    enabled: aiEnabled && isDataStale(profitInsightsLastUpdated),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    insights: profitInsights,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Hook for AI price suggestions
 */
export const usePriceSuggestions = (products: Product[], sales: Sale[]) => {
  const { priceSuggestions, setPriceSuggestions, isDataStale, priceSuggestionsLastUpdated, aiEnabled } = useAIStore()

  const fetchSuggestions = useCallback(async () => {
    if (!aiEnabled || !products.length) return priceSuggestions

    const context = contextBuilder.buildContext({ products, sales })
    const suggestions = await aiEngine.generatePriceSuggestions(products, sales, context)
    setPriceSuggestions(suggestions)
    return suggestions
  }, [products, sales, aiEnabled])

  const query = useQuery({
    queryKey: ['ai', 'price-suggestions', products.length, sales.length],
    queryFn: fetchSuggestions,
    enabled: aiEnabled && isDataStale(priceSuggestionsLastUpdated),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  return {
    suggestions: priceSuggestions,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Hook for AI stock recommendations
 */
export const useStockRecommendations = (products: Product[], sales: Sale[]) => {
  const { stockRecommendations, setStockRecommendations, isDataStale, stockRecommendationsLastUpdated, aiEnabled } = useAIStore()

  const fetchRecommendations = useCallback(async () => {
    if (!aiEnabled || !products.length) return stockRecommendations

    const context = contextBuilder.buildContext({ products, sales })
    const recommendations = await aiEngine.generateStockRecommendations(products, sales, context)
    setStockRecommendations(recommendations)
    return recommendations
  }, [products, sales, aiEnabled])

  const query = useQuery({
    queryKey: ['ai', 'stock-recommendations', products.length, sales.length],
    queryFn: fetchRecommendations,
    enabled: aiEnabled && isDataStale(stockRecommendationsLastUpdated),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    recommendations: stockRecommendations,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Hook for AI retail analysis
 */
export const useRetailAnalysis = (products: Product[], sales: Sale[]) => {
  const { retailAnalysis, setRetailAnalysis, isDataStale, retailAnalysisLastUpdated, aiEnabled } = useAIStore()

  const fetchAnalysis = useCallback(async () => {
    if (!aiEnabled || !products.length) return retailAnalysis

    const context = contextBuilder.buildContext({ products, sales })
    const analysis = await aiEngine.analyzeRetailWholesale(products, sales, context)
    setRetailAnalysis(analysis)
    return analysis
  }, [products, sales, aiEnabled])

  const query = useQuery({
    queryKey: ['ai', 'retail-analysis', products.length, sales.length],
    queryFn: fetchAnalysis,
    enabled: aiEnabled && isDataStale(retailAnalysisLastUpdated),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })

  return {
    analysis: retailAnalysis,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Hook for AI daily summary
 */
export const useDailySummary = (
  products: Product[],
  sales: Sale[],
  dashboardStats?: DashboardStats
) => {
  const { dailySummary, setDailySummary, isDataStale, dailySummaryLastUpdated, aiEnabled } = useAIStore()

  const fetchSummary = useCallback(async () => {
    if (!aiEnabled || !products.length) return dailySummary

    const context = contextBuilder.buildContext({
      products,
      sales,
      dashboardStats,
    })

    const summary = await aiEngine.generateDailySummary(context)
    setDailySummary(summary)
    return summary
  }, [products, sales, dashboardStats, aiEnabled])

  const query = useQuery({
    queryKey: ['ai', 'daily-summary', products.length, sales.length],
    queryFn: fetchSummary,
    enabled: aiEnabled && isDataStale(dailySummaryLastUpdated, 30 * 60 * 1000), // 30 minutes
    staleTime: 30 * 60 * 1000,
  })

  return {
    summary: dailySummary,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Hook for AI forecasting
 */
export const useForecasting = (products: Product[], sales: Sale[], days: number = 7) => {
  const { forecasts, setForecasts, isDataStale, forecastsLastUpdated, aiEnabled } = useAIStore()

  const fetchForecasts = useCallback(async () => {
    if (!aiEnabled || !products.length) return forecasts

    const forecastData = await aiEngine.generateForecast(products, sales, days)
    setForecasts(forecastData)
    return forecastData
  }, [products, sales, days, aiEnabled])

  const query = useQuery({
    queryKey: ['ai', 'forecasts', products.length, sales.length, days],
    queryFn: fetchForecasts,
    enabled: aiEnabled && isDataStale(forecastsLastUpdated),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  return {
    forecasts,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Hook for AI chat
 */
export const useAIChat = () => {
  const {
    chatMessages,
    isChatOpen,
    isChatLoading,
    setChatMessages,
    addChatMessage,
    setChatOpen,
    setChatLoading,
    clearChat,
    aiEnabled,
  } = useAIStore()

  const sendMessage = useCallback(
    async (message: string, context: any) => {
      if (!aiEnabled) return

      setChatLoading(true)
      try {
        const response = await chatService.sendMessage(message, context)
        const history = chatService.getHistory()
        setChatMessages(history)
        return response
      } catch (error) {
        console.error('Chat error:', error)
      } finally {
        setChatLoading(false)
      }
    },
    [aiEnabled, setChatLoading, setChatMessages]
  )

  const getSuggestedQuestions = useCallback(
    (context: any) => {
      return chatService.getSuggestedQuestions(context)
    },
    []
  )

  return {
    messages: chatMessages,
    isOpen: isChatOpen,
    isLoading: isChatLoading,
    sendMessage,
    setOpen: setChatOpen,
    clearChat,
    getSuggestedQuestions,
  }
}

/**
 * Hook for transaction validation
 */
export const useTransactionValidation = () => {
  const { pendingWarnings, setPendingWarnings, clearWarnings, aiEnabled } = useAIStore()

  const validateTransaction = useCallback(
    async (type: 'sale' | 'stock' | 'price', data: any, context: any) => {
      if (!aiEnabled) {
        clearWarnings()
        return []
      }

      const warnings = await aiEngine.validateTransaction(type, data, context)
      setPendingWarnings(warnings)
      return warnings
    },
    [aiEnabled, setPendingWarnings, clearWarnings]
  )

  return {
    warnings: pendingWarnings,
    validateTransaction,
    clearWarnings,
  }
}

/**
 * Hook for auto-refreshing AI insights
 */
export const useAIAutoRefresh = (
  products: Product[],
  sales: Sale[],
  dashboardStats?: DashboardStats
) => {
  const { autoRefreshEnabled, refreshInterval, aiEnabled } = useAIStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!autoRefreshEnabled || !aiEnabled) return

    const intervalMs = refreshInterval * 60 * 1000
    const interval = setInterval(() => {
      // Invalidate AI queries to trigger refresh
      queryClient.invalidateQueries({ queryKey: ['ai'] })
    }, intervalMs)

    return () => clearInterval(interval)
  }, [autoRefreshEnabled, refreshInterval, aiEnabled, queryClient])
}
