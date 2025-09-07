'use client'

// DeliveryDocketCard - Stage 3 Implementation
// Displays: Supplier Name, Delivery Date, Line Items Count, Temperature, Thumbnail

import { useState } from 'react'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

interface DeliveryRecord {
  id: string
  supplier_name: string
  delivery_date: string
  image_path: string
  raw_extracted_text: string
  created_at: string
}

interface DeliveryDocketCardProps {
  record: DeliveryRecord
}

export default function DeliveryDocketCard({ record }: DeliveryDocketCardProps) {
  const [imageError, setImageError] = useState(false)
  
  // Determine compliance status based on temperature
  const getComplianceStatus = (): 'compliant' | 'warning' | 'violation' => {
    const temp = getTemperature(record.raw_extracted_text)
    if (!temp || temp === 'Not recorded') return 'warning'
    const tempValue = parseFloat(temp.replace('°C', ''))
    if (isNaN(tempValue)) return 'warning'
    if (tempValue <= 4) return 'compliant'
    if (tempValue <= 7) return 'warning'
    return 'violation'
  }
  
  const complianceStatus = getComplianceStatus()
  
  // Extract line items count from real Service Foods text
  const getLineItemsCount = (text: string): number => {
    const lines = text.split('\n')
    let count = 0
    let inItemSection = false
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Start counting after "Item Code" or "Description" headers
      if (/Item Code|Description/i.test(trimmedLine)) {
        inItemSection = true
        continue
      }
      
      // Count VEGF product codes or food items
      if (inItemSection && /^VEGF\d+|TOMATOES|LETTUCE|CAPSICUM|CUCUMBER|ONIONS/i.test(trimmedLine)) {
        count++
      }
      
      // Stop at totals
      if (/total|subtotal|gst|payment/i.test(trimmedLine)) {
        break
      }
    }
    
    return count
  }
  
  // Extract temperature from raw text  
  const getTemperature = (text: string): string => {
    const tempPatterns = [
      /temp[erature]*[:\s]+(\d+\.?\d*)[°\s]*c/i,
      /(\d+\.?\d*)[°\s]*c/g,
      /cold[:\s]+(\d+\.?\d*)/i
    ]
    
    for (const pattern of tempPatterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return `${match[1]}°C`
      }
    }
    
    return 'Not recorded'
  }
  
  const lineItemsCount = getLineItemsCount(record.raw_extracted_text)
  const temperature = getTemperature(record.raw_extracted_text)
  
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
    if (!temperature || temperature === 'Not recorded') return 'text-gray-400'
    const tempValue = parseFloat(temperature.replace('°C', ''))
    if (isNaN(tempValue)) return 'text-gray-400'
    if (tempValue <= 4) return 'text-green-300'
    if (tempValue <= 7) return 'text-yellow-300'
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
            {!imageError ? (
              <img 
                src={`/api/get-upload-url?fileName=${encodeURIComponent(record.image_path)}`}
                alt={record.image_path}
                className="w-16 h-16 object-cover rounded-lg border border-white/30"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-white text-2xl">📄</span>
            )}
          </div>
          
          {/* Document Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className={`${getTextStyle('cardTitle')} text-white font-semibold truncate`}>
                {record.image_path}
              </h4>
            </div>
          </div>
        </div>

        {/* Business Data Grid - The 5 Required Fields */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* 1. Supplier Name */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-white/70 text-xs mb-1">Supplier</div>
            <div className="text-white text-sm font-medium truncate" title={record.supplier_name}>
              {record.supplier_name}
            </div>
          </div>
          
          {/* 2. Delivery Date */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-white/70 text-xs mb-1">Delivery Date</div>
            <div className="text-white text-sm font-medium">
              {formatDate(record.delivery_date)}
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
            <div className={`text-sm font-bold ${getTemperatureColor()}`}>
              {temperature}
            </div>
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