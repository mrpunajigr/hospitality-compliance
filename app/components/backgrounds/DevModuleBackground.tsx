'use client'

import { ReactNode } from 'react'

interface DevModuleBackgroundProps {
  children: ReactNode
  className?: string
  brightness?: number
  backgroundImage?: string
  gradientOverlay?: string
  showDevHeader?: boolean
  headerContent?: ReactNode
}

export default function DevModuleBackground({ 
  children, 
  className = '',
  brightness = 0.5,
  backgroundImage = 'chef-workspace1jpg.jpg',
  gradientOverlay = 'from-gray-900/80 via-gray-900/60 to-black/80',
  showDevHeader = true,
  headerContent
}: DevModuleBackgroundProps) {
  
  return (
    <div className={`min-h-screen relative overflow-hidden ${className}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('/${backgroundImage}')`,
          backgroundPosition: '50% 50%',
          backgroundAttachment: 'fixed',
          filter: `brightness(${brightness})`
        }}
      />
      
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientOverlay}`} />

      {/* DEV Header (optional) */}
      {showDevHeader && (
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="bg-orange-600 text-white text-center py-2 text-sm font-medium">
            {headerContent || '🔧 DEVELOPMENT ENVIRONMENT - Internal Tools Only'}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Preset configurations for different dev contexts
export const DevBackgroundPresets = {
  standard: {
    brightness: 0.5,
    gradientOverlay: 'from-gray-900/80 via-gray-900/60 to-black/80'
  },
  darker: {
    brightness: 0.3,
    gradientOverlay: 'from-gray-900/90 via-gray-900/80 to-black/90'
  },
  lighter: {
    brightness: 0.7,
    gradientOverlay: 'from-gray-900/60 via-gray-900/40 to-black/60'
  }
}