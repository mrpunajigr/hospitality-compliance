'use client'

import { useRouter, usePathname } from 'next/navigation'
import { getTextStyle } from '@/lib/design-system'
import { useState, useEffect } from 'react'

interface ConsoleAdminToggleProps {
  className?: string
  showLabels?: boolean
}

export default function ConsoleAdminToggle({ className = '', showLabels = true }: ConsoleAdminToggleProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  
  // Auto-detect theme preference (defaulting to dark for admin/console)
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme('dark') // Force dark theme for admin/console consistency
  }, [])
  
  // Determine current section based on pathname
  const isAdmin = pathname.startsWith('/admin')
  const currentSection = isAdmin ? 'admin' : 'console'
  
  const handleToggle = () => {
    if (isAdmin) {
      // Switch to console
      router.push('/console/dashboard')
    } else {
      // Switch to admin
      router.push('/admin/company')
    }
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showLabels && (
        <span className={`${getTextStyle('bodySmall', theme)} ${
          theme === 'dark' ? 'text-white/90' : 'text-gray-700'
        }`}>
          Mode:
        </span>
      )}
      
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-8 w-32 items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          theme === 'dark' 
            ? 'bg-white/20 border border-white/30' 
            : 'bg-gray-200 border border-gray-300'
        }`}
        aria-label={`Switch to ${isAdmin ? 'console' : 'admin'} mode`}
      >
        {/* Background pills */}
        <div className="absolute inset-1 flex">
          <div className="flex-1" />
          <div className="flex-1" />
        </div>
        
        {/* Active indicator */}
        <div
          className={`absolute inset-1 flex h-6 w-10 items-center justify-center rounded-full shadow-sm transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-gray-800'
              : 'bg-white'
          } ${
            isAdmin ? 'translate-x-0' : 'translate-x-16'
          }`}
        >
          {isAdmin ? (
            // Admin icon (shield/settings)
            <svg className={`h-3 w-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          ) : (
            // Console icon (briefcase)
            <svg className={`h-3 w-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
          )}
        </div>
        
        {/* Text labels */}
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <span className={`text-xs font-medium transition-colors duration-200 ${
            isAdmin 
              ? (theme === 'dark' ? 'text-white' : 'text-gray-900')
              : (theme === 'dark' ? 'text-white/50' : 'text-gray-500')
          }`}>
            Admin
          </span>
          <span className={`text-xs font-medium transition-colors duration-200 ${
            !isAdmin 
              ? (theme === 'dark' ? 'text-white' : 'text-gray-900')
              : (theme === 'dark' ? 'text-white/50' : 'text-gray-500')
          }`}>
            Console
          </span>
        </div>
      </button>
      
      {showLabels && (
        <span className={`${getTextStyle('bodySmall', theme)} ${
          theme === 'dark' ? 'text-white/70' : 'text-gray-500'
        } capitalize`}>
          {currentSection}
        </span>
      )}
    </div>
  )
}