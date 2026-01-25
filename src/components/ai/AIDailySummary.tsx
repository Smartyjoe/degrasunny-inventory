/**
 * AI Daily Summary Component
 * Displays executive-style daily business summary
 */

import React from 'react'
import { Calendar, TrendingUp, AlertCircle, CheckCircle, ListChecks } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { BusinessSummary } from '@/services/ai/aiEngine'
import { format } from 'date-fns'

interface AIDailySummaryProps {
  summary: BusinessSummary | null
  isLoading?: boolean
}

export const AIDailySummary: React.FC<AIDailySummaryProps> = ({
  summary,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Daily Business Summary</h3>
        <span className="text-sm text-gray-600">
          {format(new Date(summary.date), 'MMMM d, yyyy')}
        </span>
      </div>

      {/* Overview */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Executive Overview</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{summary.overview}</p>
      </div>

      {/* Highlights */}
      {summary.highlights.length > 0 && (
        <div className="bg-green-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <h4 className="font-medium text-green-900">Highlights</h4>
          </div>
          <ul className="space-y-1">
            {summary.highlights.map((highlight, index) => (
              <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Concerns */}
      {summary.concerns.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <h4 className="font-medium text-yellow-900">Concerns</h4>
          </div>
          <ul className="space-y-1">
            {summary.concerns.map((concern, index) => (
              <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Performers */}
      {summary.topPerformers.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-blue-900">Top Performers</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.topPerformers.map((product, index) => (
              <span
                key={index}
                className="text-sm bg-white px-3 py-1 rounded-full text-blue-800 border border-blue-200"
              >
                {product}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      {summary.actionItems.length > 0 && (
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="h-4 w-4 text-indigo-600" />
            <h4 className="font-medium text-gray-900">Action Items</h4>
          </div>
          <ul className="space-y-1">
            {summary.actionItems.map((action, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">→</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
