'use client'

import { useState, useEffect } from 'react'
import { testUtils } from '@/lib/console-utils'

export default function ConsoleToggle() {
  const [isQuietMode, setIsQuietMode] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development or when testing
    const isDev = process.env.NODE_ENV === 'development'
    const isTesting = window.location.search.includes('testing=true')
    setIsVisible(isDev || isTesting)
    
    // Check current mode
    const currentMode = testUtils.getCurrentMode()
    setIsQuietMode(currentMode === 'quiet')
  }, [])

  const toggleQuietMode = () => {
    if (isQuietMode) {
      testUtils.showAll()
      setIsQuietMode(false)
    } else {
      testUtils.showOnlyErrors()
      setIsQuietMode(true)
    }
  }

  const clearConsole = () => {
    testUtils.clearConsole()
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/20">
        <div className="flex items-center gap-2 text-xs text-white">
          <span>Console:</span>
          <button
            onClick={toggleQuietMode}
            className={`px-3 py-1 rounded transition-colors ${
              isQuietMode 
                ? 'bg-green-500/20 text-green-300 border border-green-500/40' 
                : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }`}
          >
            {isQuietMode ? '🔇 Quiet' : '🔊 Verbose'}
          </button>
          <button
            onClick={clearConsole}
            className="px-3 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 transition-colors"
          >
            🧹 Clear
          </button>
        </div>
        <div className="text-xs text-white/60 mt-1">
          {isQuietMode ? 'Only errors & warnings' : 'All debug messages'}
        </div>
      </div>
    </div>
  )
}