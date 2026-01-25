/**
 * AI Stock Alerts Component
 * Displays intelligent stock reorder recommendations
 */

import React from 'react'
import { Package, AlertTriangle, Clock, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { StockRecommendation } from '@/services/ai/aiEngine'

interface AIStockAlertsProps {
  recommendations: StockRecommendation[]
  isLoading?: boolean
  onReorder?: (recommendation: StockRecommendation) => void
}

export const AIStockAlerts: React.FC<AIStockAlertsProps> = ({
  recommendations,
  isLoading = false,
  onReorder,
}) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">Stock Alerts</h3>
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

  if (recommendations.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">Stock Alerts</h3>
        </div>
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded">
          <Package className="h-5 w-5" />
          <p className="text-sm">All products are adequately stocked. No reorder alerts at this time.</p>
        </div>
      </Card>
    )
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      case 'medium':
        return <Clock className="h-4 w-4" />
      case 'low':
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  // Sort by urgency
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
  })

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-orange-600" />
        <h3 className="font-semibold text-gray-900">Stock Alerts</h3>
        <Badge className="bg-orange-100 text-orange-800">
          {recommendations.length} {recommendations.length === 1 ? 'Alert' : 'Alerts'}
        </Badge>
      </div>

      <div className="space-y-3">
        {sortedRecommendations.map((rec, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${
              rec.urgency === 'critical' ? 'border-red-300 bg-red-50' :
              rec.urgency === 'high' ? 'border-orange-300 bg-orange-50' :
              'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{rec.productName}</h4>
              <Badge className={getUrgencyColor(rec.urgency)}>
                <div className="flex items-center gap-1">
                  {getUrgencyIcon(rec.urgency)}
                  {rec.urgency.toUpperCase()}
                </div>
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
              <div>
                <span className="text-gray-500">Current Stock:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {rec.currentStock} units
                </span>
              </div>
              <div>
                <span className="text-gray-500">Reorder Level:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {rec.reorderLevel} units
                </span>
              </div>
            </div>

            <div className="bg-white bg-opacity-60 rounded p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Suggested Order:</span>
                <span className="text-lg font-bold text-blue-600">
                  {rec.suggestedQuantity} units
                </span>
              </div>
              {rec.estimatedDaysUntilStockout !== undefined && (
                <div className="flex items-center gap-1 text-sm text-orange-700">
                  <Clock className="h-4 w-4" />
                  <span>
                    Estimated stockout in {rec.estimatedDaysUntilStockout} days
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-700 mb-3 italic">{rec.reasoning}</p>

            {onReorder && (
              <Button
                onClick={() => onReorder(rec)}
                variant={rec.urgency === 'critical' || rec.urgency === 'high' ? 'default' : 'outline'}
                className={`w-full text-sm ${
                  rec.urgency === 'critical' || rec.urgency === 'high'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : ''
                }`}
              >
                Add {rec.suggestedQuantity} Units to Stock
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
