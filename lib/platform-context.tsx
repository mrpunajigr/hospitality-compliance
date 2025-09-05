'use client'

// Platform Context for iPad Optimization Testing
// Development-only context for switching between web and iOS-optimized layouts

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type PlatformMode = 'web' | 'ios'

interface PlatformContextType {
  platformMode: PlatformMode
  setPlatformMode: (mode: PlatformMode) => void
  isIOS: boolean
  isWeb: boolean
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined)

interface PlatformProviderProps {
  children: ReactNode
}

export function PlatformProvider({ children }: PlatformProviderProps) {
  const [platformMode, setPlatformMode] = useState<PlatformMode>('web')

  // Persist platform mode in localStorage for development
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const saved = localStorage.getItem('jigr-platform-mode') as PlatformMode
      if (saved === 'web' || saved === 'ios') {
        setPlatformMode(saved)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      localStorage.setItem('jigr-platform-mode', platformMode)
    }
  }, [platformMode])

  const contextValue: PlatformContextType = {
    platformMode,
    setPlatformMode,
    isIOS: platformMode === 'ios',
    isWeb: platformMode === 'web'
  }

  return (
    <PlatformContext.Provider value={contextValue}>
      <div className={`Platform${platformMode.charAt(0).toUpperCase()}${platformMode.slice(1)}`}>
        {children}
      </div>
    </PlatformContext.Provider>
  )
}

export function usePlatform() {
  const context = useContext(PlatformContext)
  if (context === undefined) {
    throw new Error('usePlatform must be used within a PlatformProvider')
  }
  return context
}

// Higher-order component for platform-aware components
export function withPlatformMode<T extends object>(Component: React.ComponentType<T>) {
  return function PlatformAwareComponent(props: T) {
    const { platformMode } = usePlatform()
    
    return (
      <div className={`Platform${platformMode.charAt(0).toUpperCase()}${platformMode.slice(1)}`}>
        <Component {...props} />
      </div>
    )
  }
}