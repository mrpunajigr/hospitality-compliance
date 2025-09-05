/**
 * Enhanced Version Management System - SSR Safe
 * Supports both development (v1.8.11.045d) and production (v1.8.11.f) versioning
 * 
 * Development: vMAJOR.MONTH.DAY.BUILD[ALPHA]
 * Production: vMAJOR.MONTH.DAY[ALPHA]
 * 
 * Usage:
 * import { getVersionInfo, getVersionDisplay } from '@/lib/version'
 */

// Import static version data to ensure consistency between server and client
import { STATIC_VERSION } from './version-static'

// Use static version data to prevent hydration mismatches
const versionData = STATIC_VERSION

// Version data is now consistently loaded from static import above
// This eliminates server/client hydration mismatches

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

// SSR-safe version information - prevents hydration mismatches
export const getVersionInfo = () => {
  const isProduction = BUILD_ENVIRONMENT === 'production'
  const staticVersion = `v${developmentVersion}`
  
  return {
    version: staticVersion,
    developmentVersion: `v${developmentVersion}`,
    productionVersion: `v${productionVersion}`, 
    buildDate: BUILD_DATE,
    environment: BUILD_ENVIRONMENT,
    displayName: staticVersion,
    fullVersion: `${staticVersion} (${BUILD_DATE})`,
    isProduction,
    isDevelopment: !isProduction,
    buildNumber: versionData.build,
    alpha: versionData.alpha
  }
}

// SSR-safe version display - prevents hydration mismatches
export const getVersionDisplay = (format: 'short' | 'full' | 'detailed' | 'dev' | 'prod' = 'short') => {
  // Use static version data to prevent server/client mismatch
  const staticVersion = `v${developmentVersion}`
  
  switch (format) {
    case 'short':
      return staticVersion
    case 'full':
      return `${staticVersion} (${BUILD_DATE})`
    case 'detailed':
      return `${staticVersion} (${BUILD_ENVIRONMENT}) - Built: ${BUILD_DATE}`
    case 'dev':
      return `${staticVersion} | ${BUILD_ENVIRONMENT.toUpperCase()}`
    case 'prod':
      return `v${productionVersion}`
    default:
      return staticVersion
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

// Console logging for deployment verification (server-side only to prevent hydration issues)
if (typeof window === 'undefined') {
  console.log(`🚀 Hospitality Compliance SaaS v${APP_VERSION} - ${BUILD_ENVIRONMENT} (${BUILD_DATE})`)
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