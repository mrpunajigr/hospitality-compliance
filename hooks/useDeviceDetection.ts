'use client'

import { useEffect, useState } from 'react'
import { detectDevice, type DeviceInfo } from '@/lib/device-detection'

/**
 * React hook for device detection and analytics capture
 * Automatically captures device info and sends to backend
 */
export function useDeviceDetection(userId?: string) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function captureDeviceInfo() {
      try {
        setIsLoading(true)
        
        // Detect device information
        const info = detectDevice()
        setDeviceInfo(info)
        
        // If we have a user ID, send to backend for storage
        if (userId) {
          const response = await fetch('/api/user/device-info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              deviceInfo: info
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to store device info')
          }

          const result = await response.json()
          console.log('✅ Device info captured:', result.analytics?.description)
        }

      } catch (err) {
        console.error('Device detection error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    // Only run once per session
    if (!deviceInfo) {
      captureDeviceInfo()
    }
  }, [userId, deviceInfo])

  return {
    deviceInfo,
    isLoading,
    error,
    // Utility functions
    isTablet: deviceInfo?.isTablet || false,
    isMobile: deviceInfo?.isMobile || false,
    isDesktop: deviceInfo?.isDesktop || false,
    isIPad: deviceInfo?.isIPad || false,
    isRecommendedForHospitality: deviceInfo?.isTablet || deviceInfo?.isDesktop || false
  }
}

/**
 * Simplified hook for just getting device type without backend storage
 */
export function useDeviceType() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)

  useEffect(() => {
    const info = detectDevice()
    setDeviceInfo(info)
  }, [])

  return {
    deviceType: deviceInfo?.deviceType || 'unknown',
    isTablet: deviceInfo?.isTablet || false,
    isMobile: deviceInfo?.isMobile || false,
    isDesktop: deviceInfo?.isDesktop || false,
    isIPad: deviceInfo?.isIPad || false,
    platform: deviceInfo?.platform || 'unknown'
  }
}