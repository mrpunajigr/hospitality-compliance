'use client'

import { ReactNode } from 'react'

interface UploadModuleBackgroundProps {
  children: ReactNode
  className?: string
  brightness?: number
  backgroundImage?: string
  overlayOpacity?: 'light' | 'medium' | 'dark'
  variant?: 'standard' | 'document-focused' | 'minimal'
}

export default function UploadModuleBackground({ 
  children, 
  className = '',
  brightness = 0.8,
  backgroundImage = 'CafeWindow.jpg',
  overlayOpacity = 'light',
  variant = 'standard'
}: UploadModuleBackgroundProps) {
  
  // Overlay settings optimized for document upload workflows
  const overlaySettings = {
    light: 'bg-black/10',
    medium: 'bg-black/20', 
    dark: 'bg-black/30'
  }

  // Variant configurations
  const variantSettings = {
    standard: {
      brightness: 0.8,
      overlay: overlaySettings[overlayOpacity]
    },
    'document-focused': {
      brightness: 0.9,
      overlay: 'bg-white/10' // Better contrast for document viewing
    },
    minimal: {
      brightness: 1.0,
      overlay: 'bg-black/5' // Very subtle for clean interfaces
    }
  }

  const settings = variantSettings[variant]

  return (
    <div className={`min-h-screen relative overflow-hidden ${className}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/${backgroundImage}')`,
          filter: `brightness(${variant === 'standard' ? brightness : settings.brightness})`
        }}
      />
      
      {/* Overlay optimized for form visibility */}
      <div className={`absolute inset-0 ${variant === 'standard' ? overlaySettings[overlayOpacity] : settings.overlay}`} />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// Preset configurations for different upload contexts
export const UploadBackgroundPresets = {
  documentUpload: {
    variant: 'document-focused' as const,
    brightness: 0.9
  },
  bulkProcessing: {
    variant: 'standard' as const,
    overlayOpacity: 'medium' as const
  },
  trainingInterface: {
    variant: 'minimal' as const,
    brightness: 1.0
  }
}