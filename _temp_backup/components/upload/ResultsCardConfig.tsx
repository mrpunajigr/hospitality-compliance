'use client'

import { useState } from 'react'
import { getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'

// Configuration interface for Results Card display
export interface ResultsCardConfig {
  supplier: boolean         // Always true (mandatory)
  deliveryDate: boolean     // Always true (mandatory)
  itemCode: boolean
  itemDescription: boolean
  quantity: boolean
  unitPrice: boolean
  totalAmount: boolean
}

// Default configuration
const DEFAULT_CONFIG: ResultsCardConfig = {
  supplier: true,      // Mandatory
  deliveryDate: true,  // Mandatory
  itemCode: false,
  itemDescription: false,
  quantity: false,
  unitPrice: false,
  totalAmount: false
}

interface ResultsCardConfigProps {
  initialConfig?: ResultsCardConfig
  onConfigChange?: (config: ResultsCardConfig) => void
  className?: string
}

export default function ResultsCardConfig({ 
  initialConfig = DEFAULT_CONFIG, 
  onConfigChange,
  className = '' 
}: ResultsCardConfigProps) {
  const [config, setConfig] = useState<ResultsCardConfig>(initialConfig)

  const handleFieldToggle = (field: keyof ResultsCardConfig) => {
    // Don't allow toggling mandatory fields
    if (field === 'supplier' || field === 'deliveryDate') return

    const newConfig = {
      ...config,
      [field]: !config[field]
    }
    
    setConfig(newConfig)
    onConfigChange?.(newConfig)
  }

  const resetToDefault = () => {
    setConfig(DEFAULT_CONFIG)
    onConfigChange?.(DEFAULT_CONFIG)
  }

  const getSelectedFieldsCount = () => {
    return Object.values(config).filter(Boolean).length
  }

  // Sample data for preview
  const previewData = {
    supplier_name: 'Fresh Foods Ltd',
    delivery_date: '2025-08-19',
    item_code: 'FF-001',
    item_description: 'Organic Tomatoes',
    quantity: 24,
    unit_price: 2.50,
    total_amount: 60.00
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Configuration Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Upload Results Display</h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure which fields appear on Results Cards after AI processing
          </p>
        </div>
        <button
          onClick={resetToDefault}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Reset to Default
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Configuration Options */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Select Fields to Display</h4>
          
          <div className="space-y-3">
            {/* Mandatory Fields */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs font-medium text-blue-800 mb-2 uppercase tracking-wide">
                Mandatory Fields
              </p>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.supplier}
                    disabled
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 opacity-50"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Supplier Name
                    <span className="text-blue-600 ml-1">*</span>
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.deliveryDate}
                    disabled
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 opacity-50"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Delivery Date
                    <span className="text-blue-600 ml-1">*</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Optional Fields */}
            <div>
              <p className="text-xs font-medium text-gray-800 mb-2 uppercase tracking-wide">
                Optional Fields
              </p>
              
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.itemCode}
                    onChange={() => handleFieldToggle('itemCode')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Item Code</span>
                </label>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.itemDescription}
                    onChange={() => handleFieldToggle('itemDescription')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Item Description</span>
                </label>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.quantity}
                    onChange={() => handleFieldToggle('quantity')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Quantity</span>
                </label>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.unitPrice}
                    onChange={() => handleFieldToggle('unitPrice')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Unit Price</span>
                </label>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.totalAmount}
                    onChange={() => handleFieldToggle('totalAmount')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Total Amount</span>
                </label>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <span className="font-medium">{getSelectedFieldsCount()} fields selected</span>
            {getSelectedFieldsCount() > 4 && (
              <span className="text-amber-600 ml-2">• Consider fewer fields for mobile users</span>
            )}
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Preview</h4>
          
          <div className="border-2 border-dashed border-gray-200 p-4 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">
              Results Card Preview
            </p>
            
            {/* Mini Results Card Preview */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
              {/* Always show mandatory fields */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {previewData.supplier_name}
                  </div>
                  <div className="text-xs text-gray-600">
                    Delivery: {previewData.delivery_date}
                  </div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0"></div>
              </div>
              
              {/* Conditionally show optional fields */}
              {(config.itemCode || config.itemDescription || config.quantity || config.unitPrice || config.totalAmount) && (
                <div className="border-t pt-2 space-y-1">
                  {config.itemCode && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Code:</span> {previewData.item_code}
                    </div>
                  )}
                  
                  {config.itemDescription && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Description:</span> {previewData.item_description}
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs">
                    {config.quantity && (
                      <span className="text-gray-600">
                        <span className="font-medium">Qty:</span> {previewData.quantity}
                      </span>
                    )}
                    
                    {config.unitPrice && (
                      <span className="text-gray-600">
                        <span className="font-medium">Price:</span> ${previewData.unit_price}
                      </span>
                    )}
                    
                    {config.totalAmount && (
                      <span className="text-gray-900 font-medium">
                        Total: ${previewData.total_amount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              This is how Results Cards will appear after document processing
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export the config interface and default for use in other components
export { DEFAULT_CONFIG }
export type { ResultsCardConfig }