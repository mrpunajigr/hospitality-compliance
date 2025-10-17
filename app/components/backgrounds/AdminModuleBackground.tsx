'use client'

import { ReactNode } from 'react'

interface AdminModuleBackgroundProps {
  children: ReactNode
  className?: string
  brightness?: number
  backgroundImage?: string
  gradientOverlay?: string
}

export default function AdminModuleBackground({ 
  children, 
  className = '',
  brightness = 0.9,
  backgroundImage = 'Home-Chef-Chicago-8.webp',
  gradientOverlay = 'from-black/20 via-black/10 to-black/30'
}: AdminModuleBackgroundProps) {
  
  return (
    <div className={`min-h-screen relative overflow-hidden ContentArea ${className}`}>
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

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Preset configurations for different admin contexts
export const AdminBackgroundPresets = {
  standard: {
    brightness: 0.9,
    gradientOverlay: 'from-black/20 via-black/10 to-black/30'
  },
  dimmed: {
    brightness: 0.7,
    gradientOverlay: 'from-black/30 via-black/20 to-black/40'
  },
  bright: {
    brightness: 1.0,
    gradientOverlay: 'from-black/10 via-black/5 to-black/20'
  }
}