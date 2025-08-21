// Delivery Tracking Module - Utility Functions
// Helper functions for delivery tracking and supplier performance analysis

import { DeliveryEvent, SupplierPerformance, EventType, RiskLevel } from '../types'

export const getEventIcon = (type: EventType): string => {
  switch (type) {
    case 'arrival': return '🚚'
    case 'temperature_check': return '🌡️'
    case 'compliance_verified': return '✅'
    case 'violation_detected': return '⚠️'
    case 'accepted': return '📦'
    case 'rejected': return '❌'
    default: return '📋'
  }
}

export const getEventColor = (type: EventType): string => {
  switch (type) {
    case 'arrival': return 'bg-blue-600/20 text-blue-300'
    case 'temperature_check': return 'bg-purple-600/20 text-purple-300'
    case 'compliance_verified': return 'bg-green-600/20 text-green-300'
    case 'violation_detected': return 'bg-red-600/20 text-red-300'
    case 'accepted': return 'bg-green-600/20 text-green-300'
    case 'rejected': return 'bg-red-600/20 text-red-300'
    default: return 'bg-gray-600/20 text-gray-300'
  }
}

export const getRiskColor = (level: RiskLevel): string => {
  switch (level) {
    case 'low': return 'bg-green-600/20 text-green-300'
    case 'medium': return 'bg-yellow-600/20 text-yellow-300'
    case 'high': return 'bg-red-600/20 text-red-300'
  }
}

export const calculateRiskLevel = (compliance: number, avgTemperature: number): RiskLevel => {
  if (compliance < 80 || avgTemperature > 5) return 'high'
  if (compliance < 90 || avgTemperature > 3) return 'medium'
  return 'low'
}

export const updateSupplierPerformance = (
  currentPerformance: SupplierPerformance[],
  event: DeliveryEvent
): SupplierPerformance[] => {
  const updated = [...currentPerformance]
  const existingIndex = updated.findIndex(s => s.name === event.supplierName)
  
  if (existingIndex >= 0) {
    // Update existing supplier
    const supplier = updated[existingIndex]
    if (event.type === 'arrival') {
      supplier.todayDeliveries += 1
      supplier.lastDeliveryTime = event.timestamp
    }
    if (event.type === 'temperature_check' && event.temperature) {
      // Simple running average (in production, would be more sophisticated)
      supplier.avgTemperature = ((supplier.avgTemperature + event.temperature) / 2)
    }
    if (event.type === 'compliance_verified' && event.isCompliant !== undefined) {
      // Update compliance rate (simplified calculation)
      supplier.todayCompliance = event.isCompliant ? 
        Math.min(100, supplier.todayCompliance + 5) : 
        Math.max(0, supplier.todayCompliance - 10)
    }
    
    // Update risk level based on performance
    supplier.riskLevel = calculateRiskLevel(supplier.todayCompliance, supplier.avgTemperature)
    
  } else {
    // Add new supplier
    updated.push({
      name: event.supplierName,
      todayDeliveries: event.type === 'arrival' ? 1 : 0,
      todayCompliance: event.isCompliant === true ? 95 : event.isCompliant === false ? 60 : 85,
      avgTemperature: event.temperature || 3.0,
      lastDeliveryTime: event.timestamp,
      trend: 'stable',
      riskLevel: 'low'
    })
  }
  
  return updated.sort((a, b) => b.todayDeliveries - a.todayDeliveries)
}

export const createMockEvent = (
  userId: string,
  suppliers: string[] = ['Premium Foods Ltd', 'Budget Supplies Co', 'Local Fresh Market', 'Quality Meats Inc']
): DeliveryEvent => {
  const eventTypes: EventType[] = ['arrival', 'temperature_check', 'compliance_verified', 'accepted']
  
  const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)]
  const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
  const randomTemp = (Math.random() * 8).toFixed(1) // 0-8°C range
  
  return {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    type: randomEventType,
    supplierName: randomSupplier,
    temperature: randomEventType === 'temperature_check' ? parseFloat(randomTemp) : undefined,
    isCompliant: randomEventType === 'compliance_verified' ? parseFloat(randomTemp) <= 4.0 : undefined,
    userId
  }
}

export const formatEventTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString()
}

export const formatEventType = (type: EventType): string => {
  return type.replace('_', ' ').toUpperCase()
}