'use client'

// Enhanced Delivery Tracker Component - Modularized Version
// Real-time delivery tracking with supplier performance integration
// 
// This is a modular version of the original DeliveryTracker component
// Dependencies: design-system utilities, React hooks
// 
// Usage:
// import { DeliveryTracker } from '@/modules/DeliveryTrackingModule'
// <DeliveryTracker clientId="client-123" userId="user-456" />

import { useState } from 'react'
import { getCardStyle, getTextStyle } from '@/lib/design-system'
import { DeliveryTrackerProps } from '../types'
import { useDeliveryTracking } from '../hooks/useDeliveryTracking'
import { getEventIcon, getEventColor, getRiskColor, formatEventTime, formatEventType } from '../utils/deliveryHelpers'

export default function DeliveryTracker({ 
  clientId, 
  userId, 
  onDeliveryEvent,
  autoTracking = false,
  maxEvents = 20,
  updateInterval = 3000
}: DeliveryTrackerProps) {
  const [currentSupplier, setCurrentSupplier] = useState('')
  const [currentTemperature, setCurrentTemperature] = useState('')
  const [showEventForm, setShowEventForm] = useState(false)

  const {
    recentEvents,
    supplierPerformance,
    isTracking,
    startTracking,
    stopTracking,
    toggleTracking,
    addManualEvent,
    clearEvents
  } = useDeliveryTracking({
    userId,
    autoTracking,
    maxEvents,
    updateInterval,
    onDeliveryEvent
  })

  const handleAddManualEvent = () => {
    if (!currentSupplier || !currentTemperature) return

    const temp = parseFloat(currentTemperature)
    addManualEvent({
      type: 'temperature_check',
      supplierName: currentSupplier,
      temperature: temp,
      isCompliant: temp <= 4.0,
      notes: 'Manual entry',
      userId
    })
    
    setCurrentSupplier('')
    setCurrentTemperature('')
    setShowEventForm(false)
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
              onClick={toggleTracking}
              className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                isTracking 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </button>

            <button
              onClick={clearEvents}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-all duration-200"
            >
              Clear
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
                onClick={handleAddManualEvent}
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
                        Last delivery: {formatEventTime(supplier.lastDeliveryTime)}
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
                        {formatEventType(event.type)}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-1">
                      {formatEventTime(event.timestamp)}
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