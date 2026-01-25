/**
 * AI Error Warning Component
 * Displays smart error prevention warnings before transactions
 */

import React from 'react'
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ErrorWarning } from '@/services/ai/aiEngine'

interface AIErrorWarningProps {
  warnings: ErrorWarning[]
  onDismiss: () => void
  onProceed?: () => void
}

export const AIErrorWarning: React.FC<AIErrorWarningProps> = ({
  warnings,
  onDismiss,
  onProceed,
}) => {
  if (warnings.length === 0) return null

  const criticalWarnings = warnings.filter(w => w.severity === 'critical')
  const canProceed = warnings.every(w => w.canProceed)

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-300 bg-red-50'
      case 'warning':
        return 'border-yellow-300 bg-yellow-50'
      case 'info':
        return 'border-blue-300 bg-blue-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {criticalWarnings.length > 0 ? (
              <AlertTriangle className="h-6 w-6 text-red-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">
              {criticalWarnings.length > 0 ? 'Transaction Cannot Proceed' : 'Transaction Warning'}
            </h3>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getSeverityColor(warning.severity)}`}
            >
              <div className="flex items-start gap-3">
                {getIcon(warning.severity)}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-2">{warning.message}</p>
                  <div className="bg-white bg-opacity-60 rounded p-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Suggestion:</span> {warning.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onDismiss}
            variant="outline"
            className="flex-1"
          >
            Go Back
          </Button>
          {canProceed && onProceed && (
            <Button
              onClick={onProceed}
              className={`flex-1 ${
                warnings.some(w => w.severity === 'warning')
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Proceed Anyway
            </Button>
          )}
        </div>

        {!canProceed && (
          <p className="text-sm text-red-600 text-center mt-3">
            This transaction cannot proceed due to critical errors. Please address the issues above.
          </p>
        )}
      </Card>
    </div>
  )
}
