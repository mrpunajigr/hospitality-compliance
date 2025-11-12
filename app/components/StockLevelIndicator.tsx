interface StockLevelIndicatorProps {
  current: number | null
  parLow?: number | null
  parHigh?: number | null
  unit?: string
  showText?: boolean
  className?: string
}

export function StockLevelIndicator({ 
  current, 
  parLow, 
  parHigh, 
  unit = '', 
  showText = true,
  className = ''
}: StockLevelIndicatorProps) {
  
  const getStockStatus = () => {
    if (!current || current === 0) {
      return { 
        indicator: '🔴', 
        status: 'Out of Stock', 
        color: 'text-red-500',
        bgColor: 'bg-red-50'
      }
    }
    
    if (parLow && current < parLow) {
      return { 
        indicator: '🟡', 
        status: 'Low Stock', 
        color: 'text-amber-500',
        bgColor: 'bg-amber-50'
      }
    }
    
    return { 
      indicator: '🟢', 
      status: 'Normal', 
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    }
  }

  const { indicator, status, color, bgColor } = getStockStatus()
  const displayValue = current ? `${current} ${unit}`.trim() : '0'

  if (!showText) {
    return (
      <span className={`text-lg ${className}`} title={status}>
        {indicator}
      </span>
    )
  }

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${bgColor} ${className}`}>
      <span className="text-sm">{indicator}</span>
      <span className={`text-sm font-medium ${color}`}>
        {displayValue}
      </span>
      <span className="text-xs text-gray-500">
        {status}
      </span>
    </div>
  )
}