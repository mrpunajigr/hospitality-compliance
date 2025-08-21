'use client'

// Enhanced Delivery Tracker with Supplier Performance Integration
// Tracks deliveries in real-time and provides supplier performance insights

import { useState, useEffect } from 'react'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

interface DeliveryEvent {
  id: string
  timestamp: string
  type: 'arrival' | 'temperature_check' | 'compliance_verified' | 'violation_detected' | 'accepted' | 'rejected'
  supplierName: string
  temperature?: number
  isCompliant?: boolean
  notes?: string
  userId: string
}

interface SupplierPerformance {
  name: string
  todayDeliveries: number
  todayCompliance: number
  avgTemperature: number
  lastDeliveryTime?: string
  trend: 'improving' | 'declining' | 'stable'
  riskLevel: 'low' | 'medium' | 'high'
}

interface DeliveryTrackerProps {
  clientId: string
  userId: string
  onDeliveryEvent?: (event: DeliveryEvent) => void
}

export default function DeliveryTracker({ clientId, userId, onDeliveryEvent }: DeliveryTrackerProps) {
  const [recentEvents, setRecentEvents] = useState<DeliveryEvent[]>([])
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance[]>([])
  const [isTracking, setIsTracking] = useState(false)
  const [currentSupplier, setCurrentSupplier] = useState('')
  const [currentTemperature, setCurrentTemperature] = useState('')
  const [showEventForm, setShowEventForm] = useState(false)

  // Simulate real-time delivery events (in production, this would connect to actual delivery systems)
  useEffect(() => {
    if (!isTracking) return

    const interval = setInterval(() => {
      // Simulate random delivery events for demo
      const suppliers = ['Premium Foods Ltd', 'Budget Supplies Co', 'Local Fresh Market', 'Quality Meats Inc']
      const eventTypes: DeliveryEvent['type'][] = ['arrival', 'temperature_check', 'compliance_verified', 'accepted']
      
      const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)]
      const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
      const randomTemp = (Math.random() * 8).toFixed(1) // 0-8°C range
      
      const newEvent: DeliveryEvent = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: randomEventType,
        supplierName: randomSupplier,
        temperature: randomEventType === 'temperature_check' ? parseFloat(randomTemp) : undefined,
        isCompliant: randomEventType === 'compliance_verified' ? parseFloat(randomTemp) <= 4.0 : undefined,
        userId
      }

      setRecentEvents(prev => [newEvent, ...prev.slice(0, 19)]) // Keep last 20 events
      onDeliveryEvent?.(newEvent)
      
      // Update supplier performance
      updateSupplierPerformance(newEvent)
      
    }, 3000) // New event every 3 seconds

    return () => clearInterval(interval)
  }, [isTracking, userId, onDeliveryEvent])

  const updateSupplierPerformance = (event: DeliveryEvent) => {
    setSupplierPerformance(prev => {
      const updated = [...prev]
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
        supplier.riskLevel = supplier.todayCompliance < 80 || supplier.avgTemperature > 5 ? 'high' :
                           supplier.todayCompliance < 90 || supplier.avgTemperature > 3 ? 'medium' : 'low'
        
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
    })
  }

  const addManualEvent = () => {
    if (!currentSupplier || !currentTemperature) return

    const temp = parseFloat(currentTemperature)
    const newEvent: DeliveryEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: 'temperature_check',
      supplierName: currentSupplier,
      temperature: temp,
      isCompliant: temp <= 4.0,
      notes: 'Manual entry',
      userId
    }

    setRecentEvents(prev => [newEvent, ...prev.slice(0, 19)])
    updateSupplierPerformance(newEvent)
    onDeliveryEvent?.(newEvent)
    
    setCurrentSupplier('')
    setCurrentTemperature('')
    setShowEventForm(false)
  }

  const getEventIcon = (type: DeliveryEvent['type']) => {
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

  const getEventColor = (type: DeliveryEvent['type']) => {
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

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'bg-green-600/20 text-green-300'
      case 'medium': return 'bg-yellow-600/20 text-yellow-300'
      case 'high': return 'bg-red-600/20 text-red-300'
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Tracking Controls */}
      <div className={getCardStyle('primary')}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-2`}>
              📊 Real-Time Delivery Tracking
            </h2>
            <p className={`${getTextStyle('body')} text-white/80`}>
              Monitor deliveries and supplier performance in real-time
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowEventForm(!showEventForm)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200"
            >
              Add Event
            </button>
            
            <button
              onClick={() => setIsTracking(!isTracking)}
              className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                isTracking 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </button>
          </div>
        </div>

        {/* Manual Event Form */}
        {showEventForm && (
          <div className="bg-white/10 rounded-xl p-4 mb-6">
            <h3 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
              Add Manual Delivery Event
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Supplier name"
                value={currentSupplier}
                onChange={(e) => setCurrentSupplier(e.target.value)}
                className="px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/50"
              />
              <input
                type="number"
                step="0.1"
                placeholder="Temperature (°C)"
                value={currentTemperature}
                onChange={(e) => setCurrentTemperature(e.target.value)}
                className="px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/50"
              />
              <button
                onClick={addManualEvent}
                disabled={!currentSupplier || !currentTemperature}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-xl transition-all duration-200"
              >
                Add Event
              </button>
            </div>
          </div>
        )}

        {isTracking && (
          <div className="bg-green-600/20 border border-green-400/30 rounded-xl p-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm font-medium">
                Live tracking active - {recentEvents.length} events captured
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Supplier Performance Dashboard */}
        <div className={getCardStyle('secondary')}>
          <div className="p-6">
            <h3 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
              🏆 Supplier Performance Today
            </h3>
            
            {supplierPerformance.length > 0 ? (
              <div className="space-y-3">
                {supplierPerformance.slice(0, 5).map((supplier) => (
                  <div key={supplier.name} className="bg-white/10 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-white">
                        {supplier.name}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(supplier.riskLevel)}`}>
                        {supplier.riskLevel.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm text-white/70">
                      <div>
                        <div className="text-white font-medium">{supplier.todayDeliveries}</div>
                        <div className="text-xs">Deliveries</div>
                      </div>
                      <div>
                        <div className="text-white font-medium">{supplier.todayCompliance}%</div>
                        <div className="text-xs">Compliance</div>
                      </div>
                      <div>
                        <div className="text-white font-medium">{supplier.avgTemperature.toFixed(1)}°C</div>
                        <div className="text-xs">Avg Temp</div>
                      </div>
                    </div>
                    
                    {supplier.lastDeliveryTime && (
                      <div className="text-xs text-white/50 mt-2">
                        Last delivery: {new Date(supplier.lastDeliveryTime).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-center py-4">
                No delivery data available yet. Start tracking to see supplier performance.
              </p>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className={getCardStyle('form')}>
          <div className="p-6">
            <h3 className={`${getTextStyle('sectionTitle')} text-gray-900 mb-4`}>
              📝 Recent Delivery Events
            </h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentEvents.length > 0 ? (
                recentEvents.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getEventIcon(event.type)}</span>
                        <span className="font-medium text-gray-900 text-sm">
                          {event.supplierName}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventColor(event.type)}`}>
                        {event.type.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-1">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                    
                    {event.temperature && (
                      <div className="text-xs text-gray-700">
                        Temperature: {event.temperature}°C 
                        {event.isCompliant !== undefined && (
                          <span className={`ml-2 ${event.isCompliant ? 'text-green-600' : 'text-red-600'}`}>
                            ({event.isCompliant ? 'Compliant' : 'Non-compliant'})
                          </span>
                        )}
                      </div>
                    )}
                    
                    {event.notes && (
                      <div className="text-xs text-gray-500 italic mt-1">
                        {event.notes}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">
                  No recent events. Start tracking or add manual events.
                </p>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}