'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { detectDevice, type DeviceInfo } from '@/lib/device-detection'

interface DeviceContextType {
  // Core device info
  deviceInfo: DeviceInfo | null
  isLoading: boolean
  
  // Quick access booleans
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isIPad: boolean
  isIPhone: boolean
  isAndroid: boolean
  
  // Enhanced iOS detection
  isIPadPro: boolean
  isIPadAir: boolean
  isIOSCompatible: boolean // iOS 12+ for Safari compatibility
  
  // Screen and orientation
  isPortrait: boolean
  isLandscape: boolean
  screenSize: 'tiny' | 'small' | 'medium' | 'large'
  
  // Hospitality-specific
  isRecommendedForHospitality: boolean
  supportsAdvancedFeatures: boolean
  
  // UI state management
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  contentOffset: number // For content shifting when sidebar hidden
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined)

interface DeviceProviderProps {
  children: React.ReactNode
  userId?: string // Optional for analytics capture
}

export function DeviceProvider({ children, userId }: DeviceProviderProps) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  
  // Enhanced device detection
  const [enhancedDetection, setEnhancedDetection] = useState<{
    isIPadPro: boolean
    isIPadAir: boolean
    isIOSCompatible: boolean
    isPortrait: boolean
    screenSize: 'tiny' | 'small' | 'medium' | 'large'
  }>({
    isIPadPro: false,
    isIPadAir: false,
    isIOSCompatible: false,
    isPortrait: true,
    screenSize: 'medium'
  })

  // Detect device and capture analytics
  useEffect(() => {
    async function initializeDevice() {
      try {
        setIsLoading(true)
        
        // Basic device detection
        const info = detectDevice()
        setDeviceInfo(info)
        
        // Enhanced iOS detection
        const enhanced = detectEnhancedDevice(info)
        setEnhancedDetection(enhanced)
        
        // Auto-collapse sidebar on mobile/tablet
        if (info.isMobile || info.isTablet) {
          setSidebarCollapsed(true)
        }
        
        // Send to analytics if user ID provided
        if (userId) {
          fetch('/api/user/device-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, deviceInfo: info })
          }).then(response => {
            if (response.ok) {
              console.log('✅ Device context: Analytics captured')
            }
          }).catch(err => {
            console.warn('Device analytics failed:', err)
          })
        }
        
      } catch (error) {
        console.error('Device context initialization failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeDevice()
  }, [userId])

  // Listen for orientation and resize changes
  useEffect(() => {
    if (!deviceInfo) return

    function handleResize() {
      const info = detectDevice()
      setDeviceInfo(info)
      
      const enhanced = detectEnhancedDevice(info)
      setEnhancedDetection(enhanced)
    }

    function handleOrientationChange() {
      // Delay to allow orientation to complete
      setTimeout(handleResize, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [deviceInfo])

  // Calculate content offset based on sidebar state and device
  const contentOffset = calculateContentOffset(deviceInfo, sidebarCollapsed)

  const contextValue: DeviceContextType = {
    // Core device info
    deviceInfo,
    isLoading,
    
    // Quick access booleans
    isMobile: deviceInfo?.isMobile || false,
    isTablet: deviceInfo?.isTablet || false,
    isDesktop: deviceInfo?.isDesktop || false,
    isIPad: deviceInfo?.isIPad || false,
    isIPhone: deviceInfo?.isIPhone || false,
    isAndroid: deviceInfo?.isAndroid || false,
    
    // Enhanced iOS detection
    isIPadPro: enhancedDetection.isIPadPro,
    isIPadAir: enhancedDetection.isIPadAir,
    isIOSCompatible: enhancedDetection.isIOSCompatible,
    
    // Screen and orientation
    isPortrait: enhancedDetection.isPortrait,
    isLandscape: !enhancedDetection.isPortrait,
    screenSize: enhancedDetection.screenSize,
    
    // Hospitality-specific
    isRecommendedForHospitality: deviceInfo?.isTablet || deviceInfo?.isDesktop || false,
    supportsAdvancedFeatures: deviceInfo ? checkAdvancedFeatures(deviceInfo) : false,
    
    // UI state management
    sidebarCollapsed,
    setSidebarCollapsed,
    contentOffset
  }

  return (
    <DeviceContext.Provider value={contextValue}>
      {children}
    </DeviceContext.Provider>
  )
}

// Enhanced device detection for iOS devices
function detectEnhancedDevice(deviceInfo: DeviceInfo) {
  const { screenWidth, screenHeight, isIPad, platform, browserVersion } = deviceInfo
  
  // Enhanced iPad detection
  const isIPadPro = isIPad && (
    (screenWidth >= 1024 && screenHeight >= 1366) || // 12.9" iPad Pro
    (screenWidth >= 834 && screenHeight >= 1194) ||  // 11" iPad Pro
    (screenWidth >= 1366 && screenHeight >= 1024) || // Landscape variants
    (screenWidth >= 1194 && screenHeight >= 834)
  )
  
  const isIPadAir = isIPad && !isIPadPro && (
    (screenWidth >= 768 && screenHeight >= 1024) || // Standard iPad/Air
    (screenWidth >= 1024 && screenHeight >= 768)   // Landscape
  )
  
  // iOS Safari 12+ compatibility check
  const isIOSCompatible = platform === 'ios' && 
    parseFloat(browserVersion) >= 12
  
  // Orientation
  const isPortrait = screenHeight > screenWidth
  
  // Screen size categorization
  let screenSize: 'tiny' | 'small' | 'medium' | 'large' = 'medium'
  if (screenWidth < 480) screenSize = 'tiny'
  else if (screenWidth < 768) screenSize = 'small'
  else if (screenWidth < 1440) screenSize = 'medium'
  else screenSize = 'large'
  
  return {
    isIPadPro,
    isIPadAir,
    isIOSCompatible,
    isPortrait,
    screenSize
  }
}

// Check advanced feature support
function checkAdvancedFeatures(deviceInfo: DeviceInfo): boolean {
  // iPad Air Safari 12+ compatibility
  if (deviceInfo.isIPad && deviceInfo.platform === 'ios') {
    return parseFloat(deviceInfo.browserVersion) >= 12
  }
  
  // Modern desktop browsers
  if (deviceInfo.isDesktop) {
    return parseFloat(deviceInfo.browserVersion) >= 80
  }
  
  // Modern Android
  if (deviceInfo.isAndroid) {
    return parseFloat(deviceInfo.browserVersion) >= 80
  }
  
  return false
}

// Calculate content offset for sidebar management
function calculateContentOffset(deviceInfo: DeviceInfo | null, sidebarCollapsed: boolean): number {
  if (!deviceInfo) return 0
  
  // On mobile, content doesn't shift (sidebar overlays)
  if (deviceInfo.isMobile) return 0
  
  // On tablet/desktop, content shifts when sidebar is visible
  if (sidebarCollapsed) {
    return 150 // Collapsed sidebar width
  } else {
    return 400 // Expanded sidebar width
  }
}

// Hook to use device context
export function useDevice() {
  const context = useContext(DeviceContext)
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider')
  }
  return context
}

// Simplified hook for just device type (doesn't require provider)
export function useDeviceType() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)

  useEffect(() => {
    const info = detectDevice()
    setDeviceInfo(info)
  }, [])

  return {
    isMobile: deviceInfo?.isMobile || false,
    isTablet: deviceInfo?.isTablet || false,
    isDesktop: deviceInfo?.isDesktop || false,
    isIPad: deviceInfo?.isIPad || false,
    platform: deviceInfo?.platform || 'unknown'
  }
}