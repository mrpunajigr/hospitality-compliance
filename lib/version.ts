/**
 * Enhanced Version Management System
 * Supports both development (v1.8.11.045d) and production (v1.8.11.f) versioning
 * 
 * Development: vMAJOR.MONTH.DAY.BUILD[ALPHA]
 * Production: vMAJOR.MONTH.DAY[ALPHA]
 * 
 * Usage:
 * import { getVersionInfo, getVersionDisplay } from '@/lib/version'
 */

// Default version data (fallback)
let versionData = {
  major: 1,
  month: 8,
  day: 16,
  build: 8,
  alpha: ''
}

// Server-side version loading (only when not in browser)
if (typeof window === 'undefined') {
  try {
    // Try to import static version first (for Vercel deployment)
    const { STATIC_VERSION } = require('./version-static')
    if (STATIC_VERSION) {
      versionData = STATIC_VERSION
    }
  } catch (error) {
    // Fallback to fs reading for local development
    try {
      const fs = require('fs')
      const path = require('path')
      const versionPath = path.join(process.cwd(), 'version.json')
      if (fs.existsSync(versionPath)) {
        versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'))
      }
    } catch (fsError) {
      // Keep default values if both methods fail
    }
  }
}

// Generate version strings
const developmentVersion = `${versionData.major}.${versionData.month}.${versionData.day}.${String(versionData.build).padStart(3, '0')}${versionData.alpha}`
const productionVersion = `${versionData.major}.${versionData.month}.${versionData.day}${versionData.alpha}`

// Export current version (development format)
export const APP_VERSION = developmentVersion

// Build information
export const BUILD_DATE = new Date().toISOString().split('T')[0]
export const BUILD_ENVIRONMENT = process.env.NODE_ENV || 'development'

// Version components
export const VERSION_PARTS = {
  major: parseInt(APP_VERSION.split('.')[0]),
  minor: parseInt(APP_VERSION.split('.')[1]), 
  patch: APP_VERSION.split('.')[2]
}

// Enhanced version information
export const getVersionInfo = () => {
  // Client-side: try to get version from window object (set by public/version.js)
  let clientVersion = null
  let clientBuildTime = null
  if (typeof window !== 'undefined') {
    clientVersion = (window as any).APP_VERSION
    clientBuildTime = (window as any).BUILD_TIME
  }

  const currentVersion = clientVersion || `v${APP_VERSION}`
  const isProduction = BUILD_ENVIRONMENT === 'production'
  
  return {
    version: currentVersion,
    developmentVersion: `v${developmentVersion}`,
    productionVersion: `v${productionVersion}`, 
    buildDate: BUILD_DATE,
    buildTime: clientBuildTime,
    environment: BUILD_ENVIRONMENT,
    timestamp: Date.now(),
    displayName: currentVersion,
    fullVersion: clientBuildTime 
      ? `${currentVersion} (${new Date(clientBuildTime).toLocaleString()})`
      : `${currentVersion} (${BUILD_DATE})`,
    isProduction,
    isDevelopment: !isProduction,
    buildNumber: versionData.build,
    alpha: versionData.alpha
  }
}

// Enhanced version display helpers
export const getVersionDisplay = (format: 'short' | 'full' | 'detailed' | 'dev' | 'prod' = 'short') => {
  const info = getVersionInfo()
  
  switch (format) {
    case 'short':
      return info.displayName
    case 'full':
      return info.fullVersion
    case 'detailed':
      return `${info.displayName} (${info.environment}) - Built: ${info.buildTime ? new Date(info.buildTime).toLocaleString() : info.buildDate}`
    case 'dev':
      // Development format: v1.8.11.045d | DEV | 14:23
      const time = info.buildTime ? new Date(info.buildTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : 'N/A'
      return `${info.developmentVersion} | ${info.environment.toUpperCase()} | ${time}`
    case 'prod':
      // Production format: v1.8.11.f (clean, no build numbers)
      return `v${productionVersion}`
    default:
      return info.displayName
  }
}

// Development helpers
export const isNewerThan = (compareVersion: string): boolean => {
  const [thisMajor, thisMinor, thisPatch] = APP_VERSION.split('.')
  const [compMajor, compMinor, compPatch] = compareVersion.split('.')
  
  if (parseInt(thisMajor) > parseInt(compMajor)) return true
  if (parseInt(thisMajor) < parseInt(compMajor)) return false
  
  if (parseInt(thisMinor) > parseInt(compMinor)) return true
  if (parseInt(thisMinor) < parseInt(compMinor)) return false
  
  return thisPatch > compPatch
}

// Console logging for deployment verification
if (typeof window === 'undefined') {
  // Server-side logging
  console.log(`🚀 Hospitality Compliance SaaS v${APP_VERSION} - ${BUILD_ENVIRONMENT} (${BUILD_DATE})`)
} else {
  // Client-side logging (with enhanced info)
  setTimeout(() => {
    const info = getVersionInfo()
    if (info.isDevelopment) {
      console.log(`🔧 Development Build: ${getVersionDisplay('dev')}`)
    } else {
      console.log(`🏨 Production App: ${getVersionDisplay('prod')}`)
    }
  }, 100)
}

export default {
  APP_VERSION,
  BUILD_DATE,
  BUILD_ENVIRONMENT,
  VERSION_PARTS,
  getVersionInfo,
  getVersionDisplay,
  isNewerThan,
  developmentVersion,
  productionVersion
}