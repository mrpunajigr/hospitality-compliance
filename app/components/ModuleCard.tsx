// ModuleCard - Reusable card component using working sidebar blur pattern
interface ModuleCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  theme?: 'upload' | 'admin' | 'default'
}

export function ModuleCard({ 
  children, 
  className = '', 
  hover = false,
  onClick,
  theme = 'default'
}: ModuleCardProps) {
  // Working pattern from production-deploy: WHITE backgrounds with single blur layer
  const themeClasses = {
    upload: 'bg-white/15 backdrop-blur-lg',   // WHITE on amber background - proven working
    admin: 'bg-white/10 backdrop-blur-lg',    // WHITE on slate background - subtle contrast
    default: 'bg-white/12 backdrop-blur-lg'   // WHITE neutral default
  }
  
  const baseClasses = `${themeClasses[theme]} border border-white/20 rounded-3xl relative overflow-hidden z-10`
  const hoverClasses = hover ? 'hover:opacity-80 transition-all duration-300 cursor-pointer' : ''
  const clickableClasses = onClick ? 'cursor-pointer' : ''
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
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
  theme?: 'upload' | 'admin' | 'default'
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
      {/* Decorative accent circle */}
      <div className={`absolute top-0 right-0 w-20 h-20 ${accentColors[accentColor]} rounded-full -mr-10 -mt-10`}></div>
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
  theme?: 'upload' | 'admin' | 'default'
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