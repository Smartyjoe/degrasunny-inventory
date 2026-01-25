import { useState, useEffect } from 'react'
import { Lightbulb, TrendingUp, AlertTriangle, Info, X } from 'lucide-react'
import { aiService, AIResponse } from '@/services/aiService'
import { Card } from '@/components/ui/Card'

interface AIInsightCardProps {
  trigger: 'low-stock' | 'performance' | 'payment-methods' | 'pricing' | 'daily-summary' | 'custom'
  context?: string
  autoGenerate?: boolean
  onClose?: () => void
}

const INSIGHT_ICONS = {
  'low-stock': AlertTriangle,
  'performance': TrendingUp,
  'payment-methods': Info,
  'pricing': TrendingUp,
  'daily-summary': Lightbulb,
  'custom': Lightbulb,
}

const INSIGHT_COLORS = {
  'low-stock': 'text-amber-600 bg-amber-50 border-amber-200',
  'performance': 'text-green-600 bg-green-50 border-green-200',
  'payment-methods': 'text-blue-600 bg-blue-50 border-blue-200',
  'pricing': 'text-purple-600 bg-purple-50 border-purple-200',
  'daily-summary': 'text-indigo-600 bg-indigo-50 border-indigo-200',
  'custom': 'text-gray-600 bg-gray-50 border-gray-200',
}

export default function AIInsightCard({ 
  trigger, 
  context = '', 
  autoGenerate = true,
  onClose 
}: AIInsightCardProps) {
  const [insight, setInsight] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (autoGenerate) {
      generateInsight()
    }
  }, [trigger, context, autoGenerate])

  const generateInsight = async () => {
    setLoading(true)
    setError('')

    const contextMap: Record<string, string> = {
      'low-stock': 'low stock items and reorder recommendations',
      'performance': 'today\'s sales performance and trends',
      'payment-methods': 'payment method distribution and insights',
      'pricing': 'pricing strategy and profit margins',
      'daily-summary': 'overall business performance today',
      'custom': context,
    }

    const response: AIResponse = await aiService.generateInsight(
      contextMap[trigger] || context,
      200
    )

    setLoading(false)

    if (response.success) {
      setInsight(response.message)
      setVisible(true)
    } else {
      setError(response.error || 'Unable to generate insight')
    }
  }

  const handleClose = () => {
    setVisible(false)
    if (onClose) onClose()
  }

  if (!visible || (!loading && !insight)) {
    return null
  }

  const Icon = INSIGHT_ICONS[trigger]
  const colorClass = INSIGHT_COLORS[trigger]

  return (
    <Card className={`border-l-4 ${colorClass} relative`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${colorClass.split(' ')[0]}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-gray-900">
              AI Insight
            </h4>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close insight"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              <span>Analyzing your data...</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {insight && !loading && (
            <p className="text-sm text-gray-700 leading-relaxed">
              {insight}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
