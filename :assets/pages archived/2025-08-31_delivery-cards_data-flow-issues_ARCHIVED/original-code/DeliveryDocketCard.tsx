'use client'

// DeliveryDocketCard - Stage 3 Implementation
// Displays: Supplier Name, Delivery Date, Line Items Count, Temperature, Thumbnail

import { getCardStyle, getTextStyle } from '@/lib/design-system'

interface DeliveryDocketCardProps {
  supplierName: string
  deliveryDate: string
  lineItemsCount: number
  temperature?: number
  temperatureUnit?: string
  thumbnailUrl: string
  fileName: string
  confidenceScore?: number
  complianceStatus?: 'compliant' | 'violation' | 'warning'
}

export default function DeliveryDocketCard({
  supplierName,
  deliveryDate,
  lineItemsCount,
  temperature,
  temperatureUnit = 'C',
  thumbnailUrl,
  fileName,
  confidenceScore,
  complianceStatus = 'compliant'
}: DeliveryDocketCardProps) {
  
  // Format delivery date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Get temperature status color
  const getTemperatureColor = () => {
    if (!temperature) return 'text-gray-400'
    if (temperature <= 4) return 'text-green-300'
    if (temperature <= 7) return 'text-yellow-300'
    return 'text-red-300'
  }

  // Get compliance badge
  const getComplianceBadge = () => {
    switch (complianceStatus) {
      case 'compliant':
        return <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-xs">✓ Compliant</span>
      case 'warning':
        return <span className="px-2 py-1 bg-yellow-600/20 text-yellow-300 rounded text-xs">⚠ Warning</span>
      case 'violation':
        return <span className="px-2 py-1 bg-red-600/20 text-red-300 rounded text-xs">✗ Violation</span>
      default:
        return null
    }
  }

  return (
    <div className={getCardStyle('secondary')}>
      <div className="p-4">
        
        {/* Header with Thumbnail and Basic Info */}
        <div className="flex items-start space-x-4 mb-4">
          
          {/* Thumbnail */}
          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt={fileName}
                className="w-16 h-16 object-cover rounded-lg border border-white/30"
              />
            ) : (
              <span className="text-white text-2xl">📄</span>
            )}
          </div>
          
          {/* Document Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className={`${getTextStyle('cardTitle')} text-white font-semibold truncate`}>
                {fileName}
              </h4>
              {getComplianceBadge()}
            </div>
            
            {confidenceScore && (
              <div className="text-xs text-white/60">
                {(confidenceScore * 100).toFixed(1)}% confidence
              </div>
            )}
          </div>
        </div>

        {/* Business Data Grid - The 5 Required Fields */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* 1. Supplier Name */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-white/70 text-xs mb-1">Supplier</div>
            <div className="text-white text-sm font-medium truncate" title={supplierName}>
              {supplierName}
            </div>
          </div>
          
          {/* 2. Delivery Date */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-white/70 text-xs mb-1">Delivery Date</div>
            <div className="text-white text-sm font-medium">
              {formatDate(deliveryDate)}
            </div>
          </div>
          
          {/* 3. Line Items Count */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-white/70 text-xs mb-1">Items</div>
            <div className="text-blue-300 text-sm font-bold">
              {lineItemsCount} products
            </div>
          </div>
          
          {/* 4. Temperature (if available) */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-white/70 text-xs mb-1">Temperature</div>
            {temperature !== undefined ? (
              <div className={`text-sm font-bold ${getTemperatureColor()}`}>
                {temperature}°{temperatureUnit}
              </div>
            ) : (
              <div className="text-gray-400 text-sm">Not detected</div>
            )}
          </div>
          
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
          <button className="text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors">
            View Details
          </button>
          <button className="text-white/60 hover:text-white text-sm transition-colors">
            Download
          </button>
        </div>
        
      </div>
    </div>
  )
}