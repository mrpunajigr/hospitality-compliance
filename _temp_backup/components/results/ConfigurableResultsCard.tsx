'use client'

// Configurable Results Card
// Displays delivery docket results based on client configuration settings

import { useState } from 'react'
import { getCardStyle, getTextStyle } from '@/lib/design-system'
import type { DisplayConfiguration } from '@/app/api/client-config/display/route'

// Enhanced extraction data interfaces
export interface ConfigurableResultsData {
  // Core fields
  supplier: {
    value: string
    confidence: number
  }
  deliveryDate: {
    value: string
    confidence: number
    format: string
  }
  handwrittenNotes: {
    signedBy: string
    confidence: number
  }
  
  // Temperature data
  temperatureData: {
    readings: Array<{
      value: number
      unit: 'C' | 'F'
      productContext: string
      confidence: number
      complianceStatus: 'pass' | 'fail' | 'warning'
      riskLevel: 'low' | 'medium' | 'high' | 'critical'
    }>
    overallCompliance: 'compliant' | 'violation' | 'warning'
  }
  
  // Optional business data
  invoiceNumber?: {
    value: string
    confidence: number
  }
  
  lineItems: Array<{
    description: string
    quantity: number
    unitSize: string
    unitPrice: number
    totalPrice: number
    sku: string
    productCategory: 'frozen' | 'chilled' | 'ambient' | 'unclassified'
    confidence: number
  }>
  
  // Analysis data
  analysis: {
    productClassification: {
      frozen: Array<{ name: string; confidence: number }>
      chilled: Array<{ name: string; confidence: number }>
      ambient: Array<{ name: string; confidence: number }>
      unclassified: Array<{ name: string; confidence: number }>
      summary: {
        totalProducts: number
        frozenCount: number
        chilledCount: number
        ambientCount: number
        unclassifiedCount: number
        confidence: number
      }
    }
    estimatedValue: number
    itemCount: number
    overallConfidence: number
  }
}

interface ConfigurableResultsCardProps {
  data: ConfigurableResultsData
  configuration: DisplayConfiguration
  onEdit?: () => void
  showEditButton?: boolean
}

export default function ConfigurableResultsCard({
  data,
  configuration,
  onEdit,
  showEditButton = false
}: ConfigurableResultsCardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const formatDate = (dateString: string, format: string): string => {
    try {
      const date = new Date(dateString)
      if (format === 'DD/MM/YYYY') {
        return date.toLocaleDateString('en-GB')
      } else if (format === 'MM/DD/YYYY') {
        return date.toLocaleDateString('en-US')
      } else {
        return date.toLocaleDateString()
      }
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount: number): string => {
    return `${configuration.displayPreferences.currencySymbol}${amount.toFixed(2)}`
  }

  const formatTemperature = (temp: number, unit: 'C' | 'F'): string => {
    const displayUnit = configuration.displayPreferences.temperatureUnit
    let displayTemp = temp
    
    // Convert if needed
    if (unit !== displayUnit) {
      if (displayUnit === 'F' && unit === 'C') {
        displayTemp = (temp * 9/5) + 32
      } else if (displayUnit === 'C' && unit === 'F') {
        displayTemp = (temp - 32) * 5/9
      }
    }
    
    return `${displayTemp.toFixed(1)}°${displayUnit}`
  }

  const getComplianceColor = (status: string): string => {
    switch (status) {
      case 'compliant': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'violation': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'text-green-400'
    if (confidence >= 0.7) return 'text-yellow-400'
    return 'text-red-400'
  }

  const cardLayoutClass = configuration.displayPreferences.resultsCardLayout === 'minimal' 
    ? 'space-y-4' 
    : configuration.displayPreferences.resultsCardLayout === 'detailed' 
    ? 'space-y-6' 
    : 'space-y-5'

  return (
    <div className={`${getCardStyle('primary')} ${cardLayoutClass}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`${getTextStyle('sectionTitle')} text-white mb-1`}>
            Delivery Docket Results
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-white/70">
              Layout: {configuration.displayPreferences.resultsCardLayout}
            </span>
            <span className="text-white/70">•</span>
            <span className={getComplianceColor(data.temperatureData.overallCompliance)}>
              {data.temperatureData.overallCompliance.toUpperCase()}
            </span>
            {configuration.displayPreferences.showConfidenceScores && (
              <>
                <span className="text-white/70">•</span>
                <span className={getConfidenceColor(data.analysis.overallConfidence)}>
                  {Math.round(data.analysis.overallConfidence * 100)}% confidence
                </span>
              </>
            )}
          </div>
        </div>
        
        {showEditButton && onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200"
          >
            Edit Config
          </button>
        )}
      </div>

      {/* Mandatory Fields Section */}
      <div className="space-y-4">
        
        {/* Supplier */}
        {configuration.mandatoryFields.showSupplier && (
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <label className="text-white/70 text-sm">Supplier</label>
              <div className="text-white font-medium">{data.supplier.value}</div>
            </div>
            {configuration.displayPreferences.showConfidenceScores && (
              <span className={`text-sm ${getConfidenceColor(data.supplier.confidence)}`}>
                {Math.round(data.supplier.confidence * 100)}%
              </span>
            )}
          </div>
        )}

        {/* Delivery Date */}
        {configuration.mandatoryFields.showDeliveryDate && (
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <label className="text-white/70 text-sm">Delivery Date</label>
              <div className="text-white font-medium">
                {formatDate(data.deliveryDate.value, configuration.displayPreferences.dateFormat)}
              </div>
            </div>
            {configuration.displayPreferences.showConfidenceScores && (
              <span className={`text-sm ${getConfidenceColor(data.deliveryDate.confidence)}`}>
                {Math.round(data.deliveryDate.confidence * 100)}%
              </span>
            )}
          </div>
        )}

        {/* Signed By */}
        {configuration.mandatoryFields.showSignedBy && (
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <label className="text-white/70 text-sm">Signed By</label>
              <div className="text-white font-medium">{data.handwrittenNotes.signedBy}</div>
            </div>
            {configuration.displayPreferences.showConfidenceScores && (
              <span className={`text-sm ${getConfidenceColor(data.handwrittenNotes.confidence)}`}>
                {Math.round(data.handwrittenNotes.confidence * 100)}%
              </span>
            )}
          </div>
        )}

        {/* Temperature Data */}
        {configuration.mandatoryFields.showTemperatureData && (
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white/70 text-sm">Temperature Readings</label>
              <span className={`text-sm font-medium ${getComplianceColor(data.temperatureData.overallCompliance)}`}>
                {data.temperatureData.overallCompliance.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-2">
              {data.temperatureData.readings.slice(0, configuration.displayPreferences.resultsCardLayout === 'minimal' ? 2 : 999).map((reading, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">
                      {formatTemperature(reading.value, reading.unit)}
                    </div>
                    <div className="text-white/70 text-xs">{reading.productContext}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${getComplianceColor(reading.complianceStatus)}`}>
                      {reading.complianceStatus}
                    </div>
                    {configuration.displayPreferences.showConfidenceScores && (
                      <div className={`text-xs ${getConfidenceColor(reading.confidence)}`}>
                        {Math.round(reading.confidence * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Classification */}
        {configuration.mandatoryFields.showProductClassification && (
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white/70 text-sm">Product Classification</label>
              <span className="text-white/70 text-xs">
                {data.analysis.productClassification.summary.totalProducts} total items
              </span>
            </div>
            
            {configuration.displayPreferences.groupByTemperatureCategory ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Frozen */}
                {data.analysis.productClassification.summary.frozenCount > 0 && (
                  <div className="bg-blue-600/20 rounded-lg p-3">
                    <h4 className="text-blue-300 font-medium text-sm mb-2">
                      Frozen ({data.analysis.productClassification.summary.frozenCount})
                    </h4>
                    <div className="space-y-1">
                      {data.analysis.productClassification.frozen.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="text-blue-200 text-xs">{item.name}</div>
                      ))}
                      {data.analysis.productClassification.frozen.length > 3 && (
                        <div className="text-blue-300/70 text-xs">
                          +{data.analysis.productClassification.frozen.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Chilled */}
                {data.analysis.productClassification.summary.chilledCount > 0 && (
                  <div className="bg-green-600/20 rounded-lg p-3">
                    <h4 className="text-green-300 font-medium text-sm mb-2">
                      Chilled ({data.analysis.productClassification.summary.chilledCount})
                    </h4>
                    <div className="space-y-1">
                      {data.analysis.productClassification.chilled.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="text-green-200 text-xs">{item.name}</div>
                      ))}
                      {data.analysis.productClassification.chilled.length > 3 && (
                        <div className="text-green-300/70 text-xs">
                          +{data.analysis.productClassification.chilled.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Ambient */}
                {data.analysis.productClassification.summary.ambientCount > 0 && (
                  <div className="bg-yellow-600/20 rounded-lg p-3">
                    <h4 className="text-yellow-300 font-medium text-sm mb-2">
                      Ambient ({data.analysis.productClassification.summary.ambientCount})
                    </h4>
                    <div className="space-y-1">
                      {data.analysis.productClassification.ambient.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="text-yellow-200 text-xs">{item.name}</div>
                      ))}
                      {data.analysis.productClassification.ambient.length > 3 && (
                        <div className="text-yellow-300/70 text-xs">
                          +{data.analysis.productClassification.ambient.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-white/80 text-sm">
                Classification: {data.analysis.productClassification.summary.frozenCount} frozen, {' '}
                {data.analysis.productClassification.summary.chilledCount} chilled, {' '}
                {data.analysis.productClassification.summary.ambientCount} ambient
              </div>
            )}
          </div>
        )}
      </div>

      {/* Optional Fields Section */}
      {(configuration.optionalFields.showInvoiceNumber ||
        configuration.optionalFields.showItems ||
        configuration.optionalFields.showEstimatedValue ||
        configuration.optionalFields.showItemCount) && (
        <div className="border-t border-white/20 pt-6">
          <h4 className="text-white/80 font-medium mb-4">Additional Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Invoice Number */}
            {configuration.optionalFields.showInvoiceNumber && data.invoiceNumber && (
              <div className="bg-white/5 rounded-xl p-4">
                <label className="text-white/70 text-sm">Invoice Number</label>
                <div className="text-white font-medium">{data.invoiceNumber.value}</div>
              </div>
            )}

            {/* Estimated Value */}
            {configuration.optionalFields.showEstimatedValue && (
              <div className="bg-white/5 rounded-xl p-4">
                <label className="text-white/70 text-sm">Estimated Value</label>
                <div className="text-white font-medium">{formatCurrency(data.analysis.estimatedValue)}</div>
              </div>
            )}

            {/* Item Count */}
            {configuration.optionalFields.showItemCount && (
              <div className="bg-white/5 rounded-xl p-4">
                <label className="text-white/70 text-sm">Total Items</label>
                <div className="text-white font-medium">{data.analysis.itemCount}</div>
              </div>
            )}
          </div>

          {/* Line Items */}
          {configuration.optionalFields.showItems && data.lineItems.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-white/70 text-sm">Line Items</label>
                <button
                  onClick={() => toggleSection('lineItems')}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {expandedSections.has('lineItems') ? 'Show Less' : 'Show All'}
                </button>
              </div>
              
              <div className="space-y-2">
                {data.lineItems
                  .slice(0, expandedSections.has('lineItems') ? 999 : 3)
                  .map((item, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-white font-medium">{item.description}</div>
                        <div className="text-white/70 text-sm">
                          Qty: {item.quantity}
                          {configuration.optionalFields.showUnitSize && item.unitSize && (
                            <span> • Size: {item.unitSize}</span>
                          )}
                          {configuration.optionalFields.showSkuCode && item.sku && (
                            <span> • SKU: {item.sku}</span>
                          )}
                        </div>
                      </div>
                      
                      {configuration.optionalFields.showUnitPrice && (
                        <div className="text-right">
                          <div className="text-white font-medium">
                            {formatCurrency(item.totalPrice)}
                          </div>
                          <div className="text-white/70 text-xs">
                            {formatCurrency(item.unitPrice)} each
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {!expandedSections.has('lineItems') && data.lineItems.length > 3 && (
                  <div className="text-center py-2">
                    <span className="text-white/60 text-sm">
                      +{data.lineItems.length - 3} more items
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}