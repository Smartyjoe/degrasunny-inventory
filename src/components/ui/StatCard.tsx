import { LucideIcon } from 'lucide-react'
import { Card } from './Card'
import { cn } from '@/utils/cn'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
  change?: {
    value: string
    isPositive: boolean
  }
  onClick?: () => void
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary-600',
  iconBgColor = 'bg-primary-100',
  change,
  onClick,
}: StatCardProps) => {
  return (
    <Card
      hover={!!onClick}
      className={cn(onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
          
          {change && (
            <p
              className={cn(
                'text-sm font-medium',
                change.isPositive ? 'text-success-600' : 'text-danger-600'
              )}
            >
              {change.isPositive ? '↑' : '↓'} {change.value}
            </p>
          )}
        </div>
        
        <div className={cn('p-3 rounded-lg', iconBgColor)}>
          <Icon className={cn('w-6 h-6', iconColor)} />
        </div>
      </div>
    </Card>
  )
}

export default StatCard
