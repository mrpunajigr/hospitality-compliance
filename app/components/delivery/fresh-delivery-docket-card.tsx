// Fresh Delivery Docket Card Component
// Built to integrate with existing Edge Function response structure
// Optimized for iPad Air (2013) Safari 12 compatibility

import React from 'react'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

interface DeliveryDocketCardProps {
  deliveryRecord: {
    id: string
    file: File
    status: string
    result?: {
      deliveryRecordId: string
      enhancedExtraction: {
        supplier: {
          value: string
          confidence: number
        }
        deliveryDate: {
          value: string
          confidence: number
        }
        temperatureData: {
          readings: Array<{
            value: number
            unit: string
            complianceStatus: string
          }>
        }
        lineItems: Array<{
          description: string
          quantity: number
        }>
        analysis: {
          overallConfidence: number
          itemCount: number
          processingTime: number
        }
      }
    }
    preview?: string
  }
}

// Temperature compliance color helper
function getTemperatureColor(temp: number): string {
  if (temp <= 4) return 'text-green-400'
  if (temp <= 7) return 'text-yellow-400'
  return 'text-red-400'
}

// Format date for NZ display
function formatNZDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-NZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

export default function DeliveryDocketCard({ deliveryRecord }: DeliveryDocketCardProps) {
  // Safety checks
  if (!deliveryRecord?.result?.enhancedExtraction) {
    return (
      <div className={getCardStyle('secondary')}>
        <div className="p-4">
          <div className={`${getTextStyle('body')} text-red-400`}>
            No extraction data available
          </div>
        </div>
      </div>
    )
  }

  const extraction = deliveryRecord.result.enhancedExtraction
  const tempReading = extraction.temperatureData?.readings?.[0]
  const supplier = extraction.supplier?.value || 'Unknown Supplier'
  const deliveryDate = extraction.deliveryDate?.value || ''
  const itemCount = extraction.analysis?.itemCount || 0
  const confidence = extraction.analysis?.overallConfidence || 0

  return (
    <div className={getCardStyle('secondary')}>
      <div className="p-4 space-y-3">
        
        {/* Thumbnail and Basic Info */}
        <div className="flex items-start space-x-3">
          {/* Document Thumbnail */}
          <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
            {deliveryRecord.preview ? (
              <img 
                src={deliveryRecord.preview}
                alt="Delivery docket"
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <span className="text-white/60 text-2xl">📄</span>
            )}
          </div>

          {/* Basic Information */}
          <div className="flex-1 min-w-0">
            <h4 className={`${getTextStyle('cardTitle')} text-white font-semibold truncate`}>
              {supplier}
            </h4>
            <div className={`${getTextStyle('body')} text-white/70 text-sm`}>
              {formatNZDate(deliveryDate)}
            </div>
            <div className={`${getTextStyle('body')} text-white/60 text-xs`}>
              {deliveryRecord.file.name}
            </div>
          </div>
        </div>

        {/* Key Data Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Line Items Count */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className={`${getTextStyle('body')} text-white/60 text-xs uppercase tracking-wide mb-1`}>
              Products
            </div>
            <div className={`${getTextStyle('cardTitle')} text-white font-bold`}>
              {itemCount}
            </div>
          </div>

          {/* Temperature Reading */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className={`${getTextStyle('body')} text-white/60 text-xs uppercase tracking-wide mb-1`}>
              Temperature
            </div>
            <div className={`${getTextStyle('cardTitle')} font-bold ${tempReading ? getTemperatureColor(tempReading.value) : 'text-white/60'}`}>
              {tempReading ? `${tempReading.value}°${tempReading.unit}` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Compliance Status Bar */}
        <div className="flex items-center justify-between">
          {/* Compliance Badge */}
          <div className={`px-2 py-1 rounded-md text-xs font-medium ${
            tempReading?.complianceStatus === 'pass' 
              ? 'bg-green-600/20 text-green-300' 
              : tempReading?.complianceStatus === 'fail'
              ? 'bg-red-600/20 text-red-300'
              : 'bg-yellow-600/20 text-yellow-300'
          }`}>
            {tempReading?.complianceStatus === 'pass' ? '✓ Compliant' : 
             tempReading?.complianceStatus === 'fail' ? '✗ Violation' : 
             '⚠ Check Required'}
          </div>

          {/* Confidence Score */}
          <div className={`${getTextStyle('body')} text-white/60 text-xs`}>
            {(confidence * 100).toFixed(1)}% confidence
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 pt-2 border-t border-white/10">
          <button 
            className="flex-1 py-2 text-white/70 hover:text-white text-xs font-medium transition-colors"
            onClick={() => console.log('View details for:', deliveryRecord.result?.deliveryRecordId)}
          >
            View Details
          </button>
          <button 
            className="flex-1 py-2 text-white/70 hover:text-white text-xs font-medium transition-colors"
            onClick={() => console.log('Download report for:', deliveryRecord.result?.deliveryRecordId)}
          >
            Report
          </button>
        </div>
      </div>
    </div>
  )
}

// Card Container Component for EnhancedUpload integration
export function DeliveryDocketCardContainer({ uploadFiles }: { uploadFiles: any[] }) {
  const completedFiles = uploadFiles.filter(f => f.status === 'completed' && f.result?.enhancedExtraction)
  
  console.log('🎯 Card Container Debug:')
  console.log('- Total upload files:', uploadFiles.length)
  console.log('- Completed files:', completedFiles.length)
  console.log('- Files with extraction data:', uploadFiles.filter(f => f.result?.enhancedExtraction).length)
  
  if (completedFiles.length === 0) {
    return null
  }

  return (
    <div className={getCardStyle('primary')}>
      <div className="p-6">
        <h3 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
          📋 Delivery Dockets ({completedFiles.length} processed)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedFiles.map((uploadFile) => (
            <DeliveryDocketCard
              key={uploadFile.id}
              deliveryRecord={uploadFile}
            />
          ))}
        </div>
      </div>
    </div>
  )
}