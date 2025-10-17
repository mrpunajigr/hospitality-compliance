'use client'

import { ReactNode } from 'react'

interface PublicPageBackgroundProps {
  children: ReactNode
  className?: string
  overlayOpacity?: 'light' | 'medium' | 'dark'
  backgroundImage?: string
}

export default function PublicPageBackground({ 
  children, 
  className = '',
  overlayOpacity = 'light',
  backgroundImage = 'CafeWindow.jpg'
}: PublicPageBackgroundProps) {
  
  // Centralized overlay opacity settings
  const overlaySettings = {
    light: {
      brightness: 0.48,
      overlay: 'bg-black/12'
    },
    medium: {
      brightness: 0.4,
      overlay: 'bg-black/15'
    },
    dark: {
      brightness: 0.32,
      overlay: 'bg-black/24'
    }
  }

  const settings = overlaySettings[overlayOpacity]

  return (
    <div className={`min-h-screen relative overflow-hidden ${className}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/${backgroundImage}')`,
          filter: `brightness(${settings.brightness})`
        }}
      />
      
      {/* Overlay for text readability */}
      <div className={`absolute inset-0 ${settings.overlay}`} />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Alternative version for pages using linear gradient (like login)
export function PublicPageBackgroundWithGradient({ 
  children, 
  className = '',
  gradientStart = 'rgba(0,0,0,0.32)',
  gradientEnd = 'rgba(0,0,0,0.48)',
  additionalOverlay = 'rgba(0,0,0,0.24)',
  backgroundImage = 'CafeWindow.jpg'
}: {
  children: ReactNode
  className?: string
  gradientStart?: string
  gradientEnd?: string
  additionalOverlay?: string
  backgroundImage?: string
}) {
  return (
    <div className={`min-h-screen relative overflow-hidden ${className}`}>
      {/* Background with gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(${gradientStart}, ${gradientEnd}),
            url("https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/${backgroundImage}")
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Additional text readability overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: additionalOverlay }} />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}