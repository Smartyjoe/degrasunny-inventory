/**
 * AI Price Suggestions Component
 * Displays intelligent pricing recommendations
 */

import React from 'react'
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { PriceSuggestion } from '@/services/ai/aiEngine'

interface AIPriceSuggestionsProps {
  suggestions: PriceSuggestion[]
  isLoading?: boolean
  onApply?: (suggestion: PriceSuggestion) => void
}

export const AIPriceSuggestions: React.FC<AIPriceSuggestionsProps> = ({
  suggestions,
  isLoading = false,
  onApply,
}) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Price Optimization</h3>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (suggestions.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">Price Optimization</h3>
        </div>
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">Your pricing strategy is optimized. No adjustments recommended at this time.</p>
        </div>
      </Card>
    )
  }

  const calculateChange = (current: number, suggested: number) => {
    const diff = suggested - current
    const percent = (diff / current) * 100
    return { amount: diff, percent }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold text-gray-900">Price Optimization</h3>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion, index) => {
          const change = calculateChange(suggestion.currentPrice, suggestion.suggestedPrice)
          const isIncrease = change.amount > 0

          return (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{suggestion.productName}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      Current: ${suggestion.currentPrice.toFixed(2)}
                    </span>
                    <TrendingUp
                      className={`h-4 w-4 ${isIncrease ? 'text-green-600' : 'text-red-600'}`}
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      Suggested: ${suggestion.suggestedPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Badge
                  className={
                    isIncrease
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {isIncrease ? '+' : ''}
                  {change.percent.toFixed(1)}%
                </Badge>
              </div>

              <div className="bg-gray-50 rounded p-3 mb-3">
                <p className="text-sm font-medium text-gray-900 mb-1">Reasoning:</p>
                <p className="text-sm text-gray-700">{suggestion.reasoning}</p>
              </div>

              <div className="bg-blue-50 rounded p-3 mb-3">
                <p className="text-sm font-medium text-blue-900 mb-1">Expected Impact:</p>
                <p className="text-sm text-blue-800">{suggestion.expectedImpact}</p>
              </div>

              {onApply && (
                <Button
                  onClick={() => onApply(suggestion)}
                  variant="outline"
                  className="w-full text-sm"
                >
                  Review & Apply Price Change
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
