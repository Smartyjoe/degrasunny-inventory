/**
 * AI Services Index
 * Central export point for all AI services
 */

export { openRouterService } from './openRouterService'
export { contextBuilder } from './contextBuilder'
export { aiEngine } from './aiEngine'
export { chatService } from './chatService'

export type { BusinessContext, ProductContext, SalesContext } from './contextBuilder'
export type {
  ProfitInsight,
  PriceSuggestion,
  StockRecommendation,
  RetailAnalysis,
  BusinessSummary,
  ErrorWarning,
  ForecastData,
} from './aiEngine'
export type { ChatMessage } from './chatService'
