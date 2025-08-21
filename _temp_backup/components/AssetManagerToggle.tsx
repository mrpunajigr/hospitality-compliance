'use client'

import { useState } from 'react'
import { getTextStyle } from '@/lib/design-system'

interface AssetManagerToggleProps {
  className?: string
  onAction: (action: 'upload-background' | 'upload-logo' | 'select-background' | 'select-logo') => void
  theme?: 'light' | 'dark'
}

export default function AssetManagerToggle({ 
  className = '', 
  onAction,
  theme = 'dark' 
}: AssetManagerToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = (action: 'upload-background' | 'upload-logo' | 'select-background' | 'select-logo') => {
    onAction(action)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          theme === 'dark'
            ? 'bg-white/10 border border-white/20 text-white/90 hover:bg-white/15'
            : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'
        }`}
        aria-label="Asset Manager"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
        <span className={`text-xs font-medium ${getTextStyle('bodySmall', theme)}`}>
          Assets
        </span>
        <svg 
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className={`absolute right-0 mt-2 w-48 z-20 rounded-lg shadow-lg border backdrop-blur-sm ${
            theme === 'dark'
              ? 'bg-gray-800/90 border-white/20'
              : 'bg-white/90 border-gray-200'
          }`}>
            <div className="py-1">
              {/* Upload Section */}
              <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                theme === 'dark' ? 'text-white/60' : 'text-gray-500'
              }`}>
                Upload Assets
              </div>
              
              <button
                onClick={() => handleAction('upload-background')}
                className={`w-full text-left px-3 py-2 text-sm flex items-center space-x-2 transition-colors ${
                  theme === 'dark'
                    ? 'text-black hover:bg-white/10'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <span>📤 Upload Background</span>
              </button>
              
              <button
                onClick={() => handleAction('upload-logo')}
                className={`w-full text-left px-3 py-2 text-sm flex items-center space-x-2 transition-colors ${
                  theme === 'dark'
                    ? 'text-black hover:bg-white/10'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <span>📤 Upload Logo</span>
              </button>

              {/* Divider */}
              <div className={`my-1 border-t ${
                theme === 'dark' ? 'border-white/10' : 'border-gray-200'
              }`} />

              {/* Select Section */}
              <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                theme === 'dark' ? 'text-white/60' : 'text-gray-500'
              }`}>
                Select Assets
              </div>
              
              <button
                onClick={() => handleAction('select-background')}
                className={`w-full text-left px-3 py-2 text-sm flex items-center space-x-2 transition-colors ${
                  theme === 'dark'
                    ? 'text-black hover:bg-white/10'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
                <span>🖼️ Select Background</span>
              </button>
              
              <button
                onClick={() => handleAction('select-logo')}
                className={`w-full text-left px-3 py-2 text-sm flex items-center space-x-2 transition-colors ${
                  theme === 'dark'
                    ? 'text-black hover:bg-white/10'
                    : 'text-black hover:bg-gray-100'
                }`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
                <span>🏷️ Select Logo</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}