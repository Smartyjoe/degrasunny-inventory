/**
 * AI Forecast Component
 * Displays sales forecasts and stock predictions
 */

import React from 'react'
import { TrendingUp, Calendar, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { ForecastData } from '@/services/ai/aiEngine'
import { format, parseISO } from 'date-fns'

interface AIForecastProps {
  forecasts: ForecastData[]
  days?: number
  isLoading?: boolean
}

export const AIForecast: React.FC<AIForecastProps> = ({
  forecasts,
  days = 7,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Sales Forecast</h3>
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

  if (forecasts.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Sales Forecast</h3>
        </div>
        <p className="text-sm text-gray-500">
          Insufficient data for forecasting. More sales history is needed to generate predictions.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">{days}-Day Sales Forecast</h3>
      </div>

      <div className="space-y-3">
        {forecasts.map((forecast, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${
              forecast.stockoutDate
                ? 'border-orange-300 bg-orange-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{forecast.productName}</h4>
              <Badge
                className={
                  forecast.confidence === 'data-based'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }
              >
                {forecast.confidence === 'data-based' ? 'High Confidence' : 'Limited Data'}
              </Badge>
            </div>

            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-1">Forecasted Demand:</div>
              <div className="text-2xl font-bold text-purple-600">
                {forecast.forecastedDemand} units
              </div>
            </div>

            {forecast.stockoutDate && (
              <div className="flex items-center gap-2 bg-orange-100 rounded p-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <div className="text-sm text-orange-800">
                  <span className="font-medium">Stockout Warning:</span> Expected by{' '}
                  {format(parseISO(forecast.stockoutDate), 'MMM d, yyyy')}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-600 italic">{forecast.reasoning}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
