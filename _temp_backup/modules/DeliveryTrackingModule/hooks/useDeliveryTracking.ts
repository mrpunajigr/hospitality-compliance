// Delivery Tracking Module - React Hook
// Custom hook for delivery tracking functionality

import { useState, useEffect, useCallback } from 'react'
import { DeliveryEvent, SupplierPerformance } from '../types'
import { updateSupplierPerformance, createMockEvent } from '../utils/deliveryHelpers'

interface UseDeliveryTrackingProps {
  userId: string
  autoTracking?: boolean
  maxEvents?: number
  updateInterval?: number
  onDeliveryEvent?: (event: DeliveryEvent) => void
}

interface UseDeliveryTrackingReturn {
  recentEvents: DeliveryEvent[]
  supplierPerformance: SupplierPerformance[]
  isTracking: boolean
  startTracking: () => void
  stopTracking: () => void
  toggleTracking: () => void
  addManualEvent: (event: Omit<DeliveryEvent, 'id' | 'timestamp'>) => void
  clearEvents: () => void
}

export const useDeliveryTracking = ({
  userId,
  autoTracking = false,
  maxEvents = 20,
  updateInterval = 3000,
  onDeliveryEvent
}: UseDeliveryTrackingProps): UseDeliveryTrackingReturn => {
  const [recentEvents, setRecentEvents] = useState<DeliveryEvent[]>([])
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance[]>([])
  const [isTracking, setIsTracking] = useState(autoTracking)

  // Auto-tracking simulation
  useEffect(() => {
    if (!isTracking) return

    const interval = setInterval(() => {
      const newEvent = createMockEvent(userId)
      
      setRecentEvents(prev => [newEvent, ...prev.slice(0, maxEvents - 1)])
      setSupplierPerformance(prev => updateSupplierPerformance(prev, newEvent))
      onDeliveryEvent?.(newEvent)
      
    }, updateInterval)

    return () => clearInterval(interval)
  }, [isTracking, userId, maxEvents, updateInterval, onDeliveryEvent])

  const startTracking = useCallback(() => {
    setIsTracking(true)
  }, [])

  const stopTracking = useCallback(() => {
    setIsTracking(false)
  }, [])

  const toggleTracking = useCallback(() => {
    setIsTracking(prev => !prev)
  }, [])

  const addManualEvent = useCallback((eventData: Omit<DeliveryEvent, 'id' | 'timestamp'>) => {
    const newEvent: DeliveryEvent = {
      ...eventData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }

    setRecentEvents(prev => [newEvent, ...prev.slice(0, maxEvents - 1)])
    setSupplierPerformance(prev => updateSupplierPerformance(prev, newEvent))
    onDeliveryEvent?.(newEvent)
  }, [maxEvents, onDeliveryEvent])

  const clearEvents = useCallback(() => {
    setRecentEvents([])
    setSupplierPerformance([])
  }, [])

  return {
    recentEvents,
    supplierPerformance,
    isTracking,
    startTracking,
    stopTracking,
    toggleTracking,
    addManualEvent,
    clearEvents
  }
}