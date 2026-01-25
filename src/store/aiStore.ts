/**
 * AI State Management Store
 * Manages AI-related state, cache, and UI controls
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ChatMessage } from '@/services/ai/chatService'
import { 
  ProfitInsight, 
  PriceSuggestion, 
  StockRecommendation, 
  RetailAnalysis,
  BusinessSummary,
  ErrorWarning,
  ForecastData 
} from '@/services/ai/aiEngine'

interface AIState {
  // Chat state
  chatMessages: ChatMessage[]
  isChatOpen: boolean
  isChatLoading: boolean
  
  // Insights cache
  profitInsights: ProfitInsight[]
  profitInsightsLastUpdated: number | null
  
  priceSuggestions: PriceSuggestion[]
  priceSuggestionsLastUpdated: number | null
  
  stockRecommendations: StockRecommendation[]
  stockRecommendationsLastUpdated: number | null
  
  retailAnalysis: RetailAnalysis[]
  retailAnalysisLastUpdated: number | null
  
  dailySummary: BusinessSummary | null
  dailySummaryLastUpdated: number | null
  
  forecasts: ForecastData[]
  forecastsLastUpdated: number | null
  
  // UI state
  showInsightsPanel: boolean
  showPriceSuggestions: boolean
  showStockAlerts: boolean
  activeInsightTab: 'profits' | 'pricing' | 'stock' | 'retail' | 'forecast'
  
  // Error prevention
  pendingWarnings: ErrorWarning[]
  
  // Settings
  aiEnabled: boolean
  autoRefreshEnabled: boolean
  refreshInterval: number // in minutes
  
  // Actions
  setChatMessages: (messages: ChatMessage[]) => void
  addChatMessage: (message: ChatMessage) => void
  setChatOpen: (open: boolean) => void
  setChatLoading: (loading: boolean) => void
  clearChat: () => void
  
  setProfitInsights: (insights: ProfitInsight[]) => void
  setPriceSuggestions: (suggestions: PriceSuggestion[]) => void
  setStockRecommendations: (recommendations: StockRecommendation[]) => void
  setRetailAnalysis: (analysis: RetailAnalysis[]) => void
  setDailySummary: (summary: BusinessSummary) => void
  setForecasts: (forecasts: ForecastData[]) => void
  
  setShowInsightsPanel: (show: boolean) => void
  setShowPriceSuggestions: (show: boolean) => void
  setShowStockAlerts: (show: boolean) => void
  setActiveInsightTab: (tab: 'profits' | 'pricing' | 'stock' | 'retail' | 'forecast') => void
  
  setPendingWarnings: (warnings: ErrorWarning[]) => void
  clearWarnings: () => void
  
  setAIEnabled: (enabled: boolean) => void
  setAutoRefreshEnabled: (enabled: boolean) => void
  setRefreshInterval: (interval: number) => void
  
  clearAllInsights: () => void
  isDataStale: (lastUpdated: number | null, maxAge?: number) => boolean
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      // Initial chat state
      chatMessages: [],
      isChatOpen: false,
      isChatLoading: false,
      
      // Initial insights cache
      profitInsights: [],
      profitInsightsLastUpdated: null,
      
      priceSuggestions: [],
      priceSuggestionsLastUpdated: null,
      
      stockRecommendations: [],
      stockRecommendationsLastUpdated: null,
      
      retailAnalysis: [],
      retailAnalysisLastUpdated: null,
      
      dailySummary: null,
      dailySummaryLastUpdated: null,
      
      forecasts: [],
      forecastsLastUpdated: null,
      
      // Initial UI state
      showInsightsPanel: true,
      showPriceSuggestions: true,
      showStockAlerts: true,
      activeInsightTab: 'profits',
      
      // Initial error prevention
      pendingWarnings: [],
      
      // Initial settings
      aiEnabled: true,
      autoRefreshEnabled: true,
      refreshInterval: 5, // 5 minutes
      
      // Chat actions
      setChatMessages: (messages) => set({ chatMessages: messages }),
      
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
      
      setChatOpen: (open) => set({ isChatOpen: open }),
      
      setChatLoading: (loading) => set({ isChatLoading: loading }),
      
      clearChat: () => set({ chatMessages: [] }),
      
      // Insights actions
      setProfitInsights: (insights) =>
        set({
          profitInsights: insights,
          profitInsightsLastUpdated: Date.now(),
        }),
      
      setPriceSuggestions: (suggestions) =>
        set({
          priceSuggestions: suggestions,
          priceSuggestionsLastUpdated: Date.now(),
        }),
      
      setStockRecommendations: (recommendations) =>
        set({
          stockRecommendations: recommendations,
          stockRecommendationsLastUpdated: Date.now(),
        }),
      
      setRetailAnalysis: (analysis) =>
        set({
          retailAnalysis: analysis,
          retailAnalysisLastUpdated: Date.now(),
        }),
      
      setDailySummary: (summary) =>
        set({
          dailySummary: summary,
          dailySummaryLastUpdated: Date.now(),
        }),
      
      setForecasts: (forecasts) =>
        set({
          forecasts: forecasts,
          forecastsLastUpdated: Date.now(),
        }),
      
      // UI actions
      setShowInsightsPanel: (show) => set({ showInsightsPanel: show }),
      
      setShowPriceSuggestions: (show) => set({ showPriceSuggestions: show }),
      
      setShowStockAlerts: (show) => set({ showStockAlerts: show }),
      
      setActiveInsightTab: (tab) => set({ activeInsightTab: tab }),
      
      // Error prevention actions
      setPendingWarnings: (warnings) => set({ pendingWarnings: warnings }),
      
      clearWarnings: () => set({ pendingWarnings: [] }),
      
      // Settings actions
      setAIEnabled: (enabled) => set({ aiEnabled: enabled }),
      
      setAutoRefreshEnabled: (enabled) => set({ autoRefreshEnabled: enabled }),
      
      setRefreshInterval: (interval) => set({ refreshInterval: interval }),
      
      // Utility actions
      clearAllInsights: () =>
        set({
          profitInsights: [],
          profitInsightsLastUpdated: null,
          priceSuggestions: [],
          priceSuggestionsLastUpdated: null,
          stockRecommendations: [],
          stockRecommendationsLastUpdated: null,
          retailAnalysis: [],
          retailAnalysisLastUpdated: null,
          dailySummary: null,
          dailySummaryLastUpdated: null,
          forecasts: [],
          forecastsLastUpdated: null,
        }),
      
      isDataStale: (lastUpdated, maxAge = 5 * 60 * 1000) => {
        if (!lastUpdated) return true
        return Date.now() - lastUpdated > maxAge
      },
    }),
    {
      name: 'ai-storage',
      partialize: (state) => ({
        aiEnabled: state.aiEnabled,
        autoRefreshEnabled: state.autoRefreshEnabled,
        refreshInterval: state.refreshInterval,
        showInsightsPanel: state.showInsightsPanel,
        showPriceSuggestions: state.showPriceSuggestions,
        showStockAlerts: state.showStockAlerts,
        activeInsightTab: state.activeInsightTab,
        // Don't persist chat messages or cached insights (they should be fresh on reload)
      }),
    }
  )
)
