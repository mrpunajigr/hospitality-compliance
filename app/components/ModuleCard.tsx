// ModuleCard - Reusable card component with iOS 12 Safari compatible styling
interface ModuleCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function ModuleCard({ 
  children, 
  className = '', 
  hover = false,
  onClick 
}: ModuleCardProps) {
  const baseStyles = "bg-gray-900/40 border border-gray-600/30 rounded-3xl relative overflow-hidden"
  const hoverStyles = hover ? "hover:bg-gray-900/50 transition-all duration-300 cursor-pointer" : ""
  const clickableStyles = onClick ? "cursor-pointer" : ""
  
  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${clickableStyles} ${className}`}
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
  accentColor = 'blue'
}: {
  children: React.ReactNode
  className?: string
  accentColor?: 'blue' | 'purple' | 'green' | 'yellow' | 'orange'
}) {
  const accentColors = {
    blue: 'bg-blue-500/10',
    purple: 'bg-purple-500/10', 
    green: 'bg-green-500/10',
    yellow: 'bg-yellow-500/10',
    orange: 'bg-orange-500/10'
  }

  return (
    <ModuleCard className={`p-6 ${className}`}>
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
  disabled = false
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <ModuleCard 
      className={`p-6 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      hover={!disabled}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </ModuleCard>
  )
}