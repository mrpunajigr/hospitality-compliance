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
  backgroundImage = 'restaurant.jpg'
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
    <div className={`min-h-screen relative ${className}`}>
      {/* Background Image - Using fixed positioning like upload layout */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/restaurant.jpg?v=' + Date.now())`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          // iOS 12 vendor prefix
          WebkitBackgroundSize: 'cover',
          // Use opacity instead of filter brightness
          opacity: settings.brightness,
          // Force GPU acceleration
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)'
        } as React.CSSProperties}
      />
      
      {/* Overlay for text readability */}
      <div className={`fixed inset-0 -z-10 ${settings.overlay}`} />

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
  backgroundImage = 'restaurant.jpg'
}: {
  children: ReactNode
  className?: string
  gradientStart?: string
  gradientEnd?: string
  additionalOverlay?: string
  backgroundImage?: string
}) {
  return (
    <div className={`min-h-screen relative ${className}`}>
      {/* Background with gradient overlay - Using fixed positioning like upload layout */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `
            linear-gradient(${gradientStart}, ${gradientEnd}),
            url("https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/restaurant.jpg?v=" + Date.now())
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          // iOS 12 vendor prefixes
          WebkitBackgroundSize: 'cover',
          // Force GPU acceleration
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          // DO NOT USE: backgroundAttachment: 'fixed' - NOT SUPPORTED ON iOS 12
        } as React.CSSProperties}
      />
      
      {/* Additional text readability overlay */}
      <div className="fixed inset-0 -z-10" style={{ backgroundColor: additionalOverlay }} />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}