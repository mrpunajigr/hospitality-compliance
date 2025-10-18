/**
 * Console Utilities - Clean Testing Experience
 * 
 * Provides filtered console logging to reduce noise during testing
 * while maintaining important error and success messages.
 */

type LogLevel = 'error' | 'warn' | 'info' | 'success' | 'debug'

interface LogConfig {
  showDebug: boolean
  showInfo: boolean
  showAuth: boolean
  showAPI: boolean
  environment: 'development' | 'production' | 'testing'
}

// Configuration based on environment
const getLogConfig = (): LogConfig => {
  const env = process.env.NODE_ENV || 'development'
  const isTestingMode = typeof window !== 'undefined' && window.location.search.includes('quiet=true')
  
  if (isTestingMode || env === 'production') {
    return {
      showDebug: false,
      showInfo: false,
      showAuth: false,
      showAPI: false,
      environment: 'testing'
    }
  }
  
  return {
    showDebug: true,
    showInfo: true,
    showAuth: true,
    showAPI: true,
    environment: env as 'development' | 'production'
  }
}

const config = getLogConfig()

/**
 * Filtered console logging that respects testing mode
 */
export const logger = {
  error: (message: string, ...args: any[]) => {
    console.error(`❌ ${message}`, ...args)
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`⚠️ ${message}`, ...args)
  },
  
  success: (message: string, ...args: any[]) => {
    console.log(`✅ ${message}`, ...args)
  },
  
  info: (message: string, ...args: any[]) => {
    if (config.showInfo) {
      console.log(`ℹ️ ${message}`, ...args)
    }
  },
  
  debug: (message: string, ...args: any[]) => {
    if (config.showDebug) {
      console.log(`🔍 ${message}`, ...args)
    }
  },
  
  auth: (message: string, ...args: any[]) => {
    if (config.showAuth) {
      console.log(`🔐 ${message}`, ...args)
    }
  },
  
  api: (message: string, ...args: any[]) => {
    if (config.showAPI) {
      console.log(`🌐 ${message}`, ...args)
    }
  },
  
  champion: (message: string, ...args: any[]) => {
    // Champion messages always show (they're important for testing)
    console.log(`🏆 CHAMPION: ${message}`, ...args)
  }
}

/**
 * Enable quiet mode for clean testing
 * Add ?quiet=true to URL to suppress debug logs
 */
export const enableQuietMode = () => {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    url.searchParams.set('quiet', 'true')
    window.history.replaceState({}, '', url.toString())
    
    // Show notification that quiet mode is enabled
    console.log(`🔇 Quiet mode enabled - only showing errors, warnings, and important messages`)
    console.log(`🔊 To re-enable debug logs, remove ?quiet=true from URL`)
  }
}

/**
 * Disable quiet mode to see all logs
 */
export const disableQuietMode = () => {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    url.searchParams.delete('quiet')
    window.history.replaceState({}, '', url.toString())
    
    console.log(`🔊 Debug logging re-enabled`)
  }
}

/**
 * Console utilities for testing
 */
export const testUtils = {
  clearConsole: () => {
    if (typeof window !== 'undefined') {
      console.clear()
      console.log(`🧹 Console cleared for testing`)
    }
  },
  
  showOnlyErrors: () => {
    enableQuietMode()
  },
  
  showAll: () => {
    disableQuietMode()
  },
  
  getCurrentMode: () => {
    const isQuiet = typeof window !== 'undefined' && window.location.search.includes('quiet=true')
    return isQuiet ? 'quiet' : 'verbose'
  }
}

// Export for browser console access
if (typeof window !== 'undefined') {
  (window as any).jigrLogger = {
    quiet: enableQuietMode,
    verbose: disableQuietMode,
    clear: testUtils.clearConsole,
    mode: testUtils.getCurrentMode
  }
}