interface ExpirationBadgeProps {
  expirationDate: string | null
  className?: string
  showDate?: boolean
}

export function ExpirationBadge({ 
  expirationDate, 
  className = '',
  showDate = true 
}: ExpirationBadgeProps) {
  if (!expirationDate) {
    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
        No expiry
      </span>
    )
  }

  const now = new Date()
  const expiry = new Date(expirationDate)
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  const getUrgencyStyles = () => {
    if (daysUntilExpiry < 0) {
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        label: 'Expired',
        emoji: '🔴'
      }
    } else if (daysUntilExpiry === 0) {
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        label: 'Expires Today',
        emoji: '🔴'
      }
    } else if (daysUntilExpiry === 1) {
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        label: 'Tomorrow',
        emoji: '🔴'
      }
    } else if (daysUntilExpiry <= 3) {
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-200',
        label: `${daysUntilExpiry} days`,
        emoji: '🟡'
      }
    } else if (daysUntilExpiry <= 7) {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        label: `${daysUntilExpiry} days`,
        emoji: '🟡'
      }
    } else {
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        label: `${daysUntilExpiry} days`,
        emoji: '🟢'
      }
    }
  }

  const { bg, text, border, label, emoji } = getUrgencyStyles()

  return (
    <div className={`inline-flex items-center space-x-1 ${className}`}>
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${bg} ${text} ${border}`}>
        <span className="mr-1">{emoji}</span>
        {label}
      </span>
      {showDate && (
        <span className="text-xs text-gray-500 ml-2">
          {expiry.toLocaleDateString()}
        </span>
      )}
    </div>
  )
}

export function ExpirationUrgencySection({
  title,
  urgencyLevel,
  count,
  isExpanded,
  onToggle,
  children,
  className = ''
}: {
  title: string
  urgencyLevel: 'critical' | 'warning' | 'good'
  count: number
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
  className?: string
}) {
  const getUrgencyStyles = () => {
    switch (urgencyLevel) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: '🔴',
          buttonBg: 'bg-red-100 hover:bg-red-200'
        }
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200', 
          text: 'text-amber-800',
          icon: '🟡',
          buttonBg: 'bg-amber-100 hover:bg-amber-200'
        }
      case 'good':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: '🟢',
          buttonBg: 'bg-green-100 hover:bg-green-200'
        }
    }
  }

  const { bg, border, text, icon, buttonBg } = getUrgencyStyles()

  if (count === 0) {
    return null
  }

  return (
    <div className={`${bg} ${border} border rounded-lg ${className}`}>
      <button
        onClick={onToggle}
        className={`w-full p-4 text-left ${buttonBg} transition-colors rounded-t-lg`}
        style={{ minHeight: '60px' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">{icon}</span>
            <div>
              <h3 className={`font-semibold ${text}`}>{title}</h3>
              <p className={`text-sm ${text}/70`}>
                {count} {count === 1 ? 'batch' : 'batches'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium bg-white ${text}`}>
              {count}
            </span>
            <span className={`${text} transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </div>
      </button>
      
      {isExpanded && (
        <div className="p-4 border-t border-white/50">
          {children}
        </div>
      )}
    </div>
  )
}