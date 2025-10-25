// ModuleCard - Reusable card component with iOS 12 Safari compatible styling
interface ModuleCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

export function ModuleCard({ 
  children, 
  className = '', 
  hover = false,
  onClick,
  style = {}
}: ModuleCardProps) {
  const baseStyle: React.CSSProperties = {
    backgroundColor: 'rgba(17, 24, 39, 0.4)', // gray-900 with 40% opacity
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(75, 85, 99, 0.3)', // gray-600 with 30% opacity
    borderRadius: '24px',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 10, // Above background, below sidebar (which uses z-20+)
    cursor: onClick ? 'pointer' : 'default'
  }
  
  const hoverStyle: React.CSSProperties = hover ? {
    transition: 'all 300ms ease',
    cursor: 'pointer'
  } : {}
  
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hover) {
      e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 0.5)'
    }
  }
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hover) {
      e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 0.4)'
    }
  }
  
  return (
    <div 
      style={{...baseStyle, ...hoverStyle, ...style}}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
    blue: 'rgba(59, 130, 246, 0.1)', // blue-500 with 10% opacity
    purple: 'rgba(168, 85, 247, 0.1)', // purple-500 with 10% opacity
    green: 'rgba(34, 197, 94, 0.1)', // green-500 with 10% opacity
    yellow: 'rgba(234, 179, 8, 0.1)', // yellow-500 with 10% opacity
    orange: 'rgba(249, 115, 22, 0.1)' // orange-500 with 10% opacity
  }

  const accentStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '80px', // w-20
    height: '80px', // h-20
    backgroundColor: accentColors[accentColor],
    borderRadius: '50%',
    marginRight: '-40px', // -mr-10
    marginTop: '-40px' // -mt-10
  }

  return (
    <ModuleCard className={className} style={{padding: '24px'}}>
      {/* Decorative accent circle */}
      <div style={accentStyle}></div>
      <div style={{position: 'relative'}}>
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
  const actionStyle: React.CSSProperties = {
    padding: '24px',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'default'
  }

  return (
    <ModuleCard 
      className={className}
      style={actionStyle}
      hover={!disabled}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </ModuleCard>
  )
}