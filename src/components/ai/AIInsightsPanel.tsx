/**
 * AI Insights Panel Component
 * Displays AI-generated business insights and recommendations
 */

import React from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ChevronRight, Lightbulb } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { ProfitInsight } from '@/services/ai/aiEngine'

interface AIInsightsPanelProps {
  insights: ProfitInsight[]
  isLoading?: boolean
  onRefresh?: () => void
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  insights,
  isLoading = false,
  onRefresh,
}) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Business Insights</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (insights.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Business Insights</h3>
        </div>
        <p className="text-sm text-gray-500">
          No insights available. Record sales and add products to get AI-powered recommendations.
        </p>
      </Card>
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Lightbulb className="h-5 w-5 text-blue-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
    }
    return (
      <Badge className={colors[impact as keyof typeof colors] || colors.low}>
        {impact.toUpperCase()} IMPACT
      </Badge>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Business Insights</h3>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        )}
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getTypeColor(insight.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(insight.type)}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                  {getImpactBadge(insight.impact)}
                </div>
                <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                <div className="bg-white bg-opacity-60 rounded p-3 mb-2">
                  <p className="text-sm font-medium text-gray-900 mb-1">Recommendation:</p>
                  <p className="text-sm text-gray-700">{insight.recommendation}</p>
                </div>
                {insight.relatedProducts && insight.relatedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {insight.relatedProducts.map((product, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
