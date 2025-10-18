/**
 * Device Detection Utility for JiGR Hospitality Platform
 * Captures comprehensive device information for analytics and optimization
 */

export interface DeviceInfo {
  // Device Type
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown'
  platform: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown'
  
  // Specific Device Detection
  isIPad: boolean
  isIPhone: boolean
  isAndroid: boolean
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  
  // Screen Information
  screenWidth: number
  screenHeight: number
  pixelRatio: number
  orientation: 'portrait' | 'landscape' | 'unknown'
  
  // Browser Information
  browser: string
  browserVersion: string
  userAgent: string
  
  // Capabilities
  touchSupport: boolean
  cookieEnabled: boolean
  onlineStatus: boolean
  
  // Performance Indicators
  connectionType?: string
  memoryGB?: number
  cores?: number
  
  // Timestamp
  detectedAt: string
}

/**
 * Comprehensive device detection function
 * Works in both browser and server environments
 */
export function detectDevice(userAgent?: string): DeviceInfo {
  const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  
  // Basic device type detection
  const isIPad = /iPad/.test(ua) || (navigator?.platform === 'MacIntel' && navigator?.maxTouchPoints > 1)
  const isIPhone = /iPhone/.test(ua)
  const isAndroid = /Android/.test(ua)
  const isMobile = /Mobile|Android|iPhone/.test(ua) && !isIPad
  const isTablet = isIPad || (/Android/.test(ua) && !/Mobile/.test(ua))
  const isDesktop = !isMobile && !isTablet
  
  // Platform detection
  let platform: DeviceInfo['platform'] = 'unknown'
  if (/Mac OS X|macOS/.test(ua)) platform = 'macos'
  else if (/Windows/.test(ua)) platform = 'windows'
  else if (/Android/.test(ua)) platform = 'android'
  else if (/iPhone|iPad|iPod/.test(ua)) platform = 'ios'
  else if (/Linux/.test(ua)) platform = 'linux'
  
  // Device type categorization
  let deviceType: DeviceInfo['deviceType'] = 'unknown'
  if (isDesktop) deviceType = 'desktop'
  else if (isTablet) deviceType = 'tablet'
  else if (isMobile) deviceType = 'mobile'
  
  // Browser detection
  let browser = 'unknown'
  let browserVersion = ''
  
  if (/Chrome/.test(ua)) {
    browser = 'chrome'
    browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || ''
  } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
    browser = 'safari'
    browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || ''
  } else if (/Firefox/.test(ua)) {
    browser = 'firefox'
    browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || ''
  } else if (/Edge/.test(ua)) {
    browser = 'edge'
    browserVersion = ua.match(/Edge\/([0-9.]+)/)?.[1] || ''
  }
  
  // Screen and capabilities (browser only)
  let screenWidth = 0
  let screenHeight = 0
  let pixelRatio = 1
  let orientation: DeviceInfo['orientation'] = 'unknown'
  let touchSupport = false
  let cookieEnabled = false
  let onlineStatus = false
  let connectionType: string | undefined
  let memoryGB: number | undefined
  let cores: number | undefined
  
  if (typeof window !== 'undefined') {
    screenWidth = window.screen?.width || 0
    screenHeight = window.screen?.height || 0
    pixelRatio = window.devicePixelRatio || 1
    orientation = screenWidth > screenHeight ? 'landscape' : 'portrait'
    touchSupport = 'ontouchstart' in window
    cookieEnabled = navigator?.cookieEnabled || false
    onlineStatus = navigator?.onLine || false
    
    // Advanced browser APIs (with fallbacks)
    if ('connection' in navigator) {
      connectionType = (navigator as any).connection?.effectiveType
    }
    
    if ('deviceMemory' in navigator) {
      memoryGB = (navigator as any).deviceMemory
    }
    
    if ('hardwareConcurrency' in navigator) {
      cores = navigator.hardwareConcurrency
    }
  }
  
  return {
    deviceType,
    platform,
    isIPad,
    isIPhone,
    isAndroid,
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    screenHeight,
    pixelRatio,
    orientation,
    browser,
    browserVersion,
    userAgent: ua,
    touchSupport,
    cookieEnabled,
    onlineStatus,
    connectionType,
    memoryGB,
    cores,
    detectedAt: new Date().toISOString()
  }
}

/**
 * Get a human-readable device description
 */
export function getDeviceDescription(deviceInfo: DeviceInfo): string {
  const parts: string[] = []
  
  // Device type and platform
  if (deviceInfo.isIPad) {
    parts.push('iPad')
  } else if (deviceInfo.isIPhone) {
    parts.push('iPhone')
  } else if (deviceInfo.isAndroid && deviceInfo.isTablet) {
    parts.push('Android Tablet')
  } else if (deviceInfo.isAndroid) {
    parts.push('Android Phone')
  } else {
    parts.push(`${deviceInfo.deviceType} (${deviceInfo.platform})`)
  }
  
  // Screen resolution
  if (deviceInfo.screenWidth && deviceInfo.screenHeight) {
    parts.push(`${deviceInfo.screenWidth}×${deviceInfo.screenHeight}`)
  }
  
  // Browser
  if (deviceInfo.browser !== 'unknown') {
    parts.push(`${deviceInfo.browser} ${deviceInfo.browserVersion}`)
  }
  
  return parts.join(' • ')
}

/**
 * Check if device is compatible with advanced features
 */
export function getDeviceCapabilities(deviceInfo: DeviceInfo) {
  const isModernDevice = 
    (deviceInfo.platform === 'ios' && parseFloat(deviceInfo.browserVersion) >= 12) ||
    (deviceInfo.platform === 'android' && parseFloat(deviceInfo.browserVersion) >= 80) ||
    (deviceInfo.isDesktop && parseFloat(deviceInfo.browserVersion) >= 80)
  
  return {
    supportsAdvancedFeatures: isModernDevice,
    supportsWebGL: isModernDevice,
    supportsPWA: isModernDevice,
    recommendedForHospitality: deviceInfo.isTablet || deviceInfo.isDesktop,
    isLegacyDevice: !isModernDevice,
    needsOptimization: deviceInfo.memoryGB ? deviceInfo.memoryGB < 4 : false
  }
}

/**
 * Analytics-friendly device categorization
 */
export function categorizeDeviceForAnalytics(deviceInfo: DeviceInfo) {
  return {
    category: deviceInfo.deviceType,
    subcategory: deviceInfo.isIPad ? 'ipad' : 
                deviceInfo.isIPhone ? 'iphone' : 
                deviceInfo.isAndroid && deviceInfo.isTablet ? 'android-tablet' :
                deviceInfo.isAndroid ? 'android-phone' : 
                deviceInfo.platform,
    screenSize: deviceInfo.screenWidth >= 1920 ? 'large' :
               deviceInfo.screenWidth >= 1024 ? 'medium' :
               deviceInfo.screenWidth >= 768 ? 'small' : 'tiny',
    isRecommendedDevice: getDeviceCapabilities(deviceInfo).recommendedForHospitality
  }
}