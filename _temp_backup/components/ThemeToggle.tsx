'use client'

import { useTheme } from '@/lib/theme-context'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

interface ThemeToggleProps {
  className?: string
  showLabels?: boolean
}

export default function ThemeToggle({ className = '', showLabels = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabels && (
        <span className={`${getTextStyle('bodySmall', theme)} ${
          theme === 'dark' ? 'text-white/90' : 'text-gray-700'
        }`}>
          Theme:
        </span>
      )}
      
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-8 w-16 items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          theme === 'dark' 
            ? 'bg-white/20 border border-white/30' 
            : 'bg-gray-200 border border-gray-300'
        }`}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <div
          className={`absolute inset-1 flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-all duration-200 ${
            theme === 'dark'
              ? 'translate-x-0 bg-gray-800'
              : 'translate-x-8 bg-white'
          }`}
        >
          {theme === 'dark' ? (
            // Moon icon for dark mode
            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" clipRule="evenodd" />
            </svg>
          ) : (
            // Sun icon for light mode  
            <svg className="h-3 w-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </button>
      
      {showLabels && (
        <span className={`${getTextStyle('bodySmall', theme)} ${
          theme === 'dark' ? 'text-white/70' : 'text-gray-500'
        } capitalize`}>
          {theme}
        </span>
      )}
    </div>
  )
}