// ModuleCard - Reusable card component using working sidebar blur pattern
import { getThemedCardStyles } from '@/lib/theme-utils'

interface ModuleCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  theme?: 'upload' | 'admin' | 'default' | 'light'
}

export function ModuleCard({ 
  children, 
  className = '', 
  hover = false,
  onClick,
  theme = 'default'
}: ModuleCardProps) {
  const hoverClasses = hover ? 'hover:opacity-80 transition-all duration-300 cursor-pointer' : ''
  const clickableClasses = onClick ? 'cursor-pointer' : ''
  
  // Map theme to our theme system
  const themeMode = theme === 'admin' ? 'dark' : 'light'
  const { getInlineStyles } = getThemedCardStyles(themeMode)
  
  return (
    <div 
      className={`${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      style={getInlineStyles()}
    >
      {children}
    </div>
  )
}

// Specialized card variants for different contexts
export function StatCard({ 
  children, 
  className = '',
  accentColor = 'blue',
  theme = 'default'
}: {
  children: React.ReactNode
  className?: string
  accentColor?: 'blue' | 'purple' | 'green' | 'yellow' | 'orange'
  theme?: 'upload' | 'admin' | 'default' | 'light'
}) {
  const accentColors = {
    blue: 'bg-blue-500/10',
    purple: 'bg-purple-500/10', 
    green: 'bg-green-500/10',
    yellow: 'bg-yellow-500/10',
    orange: 'bg-orange-500/10'
  }

  return (
    <ModuleCard className={`p-6 ${className}`} theme={theme}>
      <div className="relative">
        {children}
      </div>
    </ModuleCard>
  )
}

export function ActionCard({
  children,
  className = '',
  onClick,
  disabled = false,
  theme = 'default'
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  theme?: 'upload' | 'admin' | 'default' | 'light'
}) {
  return (
    <ModuleCard 
      className={`p-6 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      theme={theme}
      hover={!disabled}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </ModuleCard>
  )
}