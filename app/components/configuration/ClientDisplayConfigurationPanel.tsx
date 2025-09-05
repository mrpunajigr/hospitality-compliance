'use client'

// Client Display Configuration Panel
// Allows administrators to configure which fields appear in delivery docket results

import { useState, useEffect } from 'react'
import { getCardStyle, getTextStyle } from '@/lib/design-system'
import type { DisplayConfiguration } from '@/app/api/client-config/display/route'

interface ClientDisplayConfigurationPanelProps {
  clientId: string
  onConfigurationSaved?: (config: DisplayConfiguration) => void
}

interface FieldConfig {
  key: string
  label: string
  description: string
  category: 'mandatory' | 'optional'
}

const FIELD_CONFIGURATIONS: FieldConfig[] = [
  // Mandatory fields (always shown)
  { key: 'showSupplier', label: 'Supplier Name', description: 'Name of the delivery supplier', category: 'mandatory' },
  { key: 'showDeliveryDate', label: 'Delivery Date', description: 'Date when the delivery was made', category: 'mandatory' },
  { key: 'showSignedBy', label: 'Signed By', description: 'Person who signed for the delivery', category: 'mandatory' },
  { key: 'showTemperatureData', label: 'Temperature Data', description: 'Temperature readings and compliance status', category: 'mandatory' },
  { key: 'showProductClassification', label: 'Product Classification', description: 'Products categorized by temperature requirements', category: 'mandatory' },
  
  // Optional fields (configurable)
  { key: 'showInvoiceNumber', label: 'Invoice Number', description: 'Invoice or docket reference number', category: 'optional' },
  { key: 'showItems', label: 'Line Items', description: 'Individual products and quantities', category: 'optional' },
  { key: 'showUnitSize', label: 'Unit Sizes', description: 'Package sizes (1kg, 500ml, etc.)', category: 'optional' },
  { key: 'showUnitPrice', label: 'Unit Prices', description: 'Individual item prices', category: 'optional' },
  { key: 'showSkuCode', label: 'SKU/Product Codes', description: 'Product codes and SKUs', category: 'optional' },
  { key: 'showTax', label: 'Tax Information', description: 'Tax amounts and rates', category: 'optional' },
  { key: 'showEstimatedValue', label: 'Estimated Value', description: 'Total estimated value of delivery', category: 'optional' },
  { key: 'showItemCount', label: 'Item Count', description: 'Number of individual items', category: 'optional' }
]

const INDUSTRY_PRESETS = [
  { id: 'restaurant', name: 'Restaurant Standard', description: 'Basic compliance focus for restaurants' },
  { id: 'hotel', name: 'Hotel Catering', description: 'Detailed setup with pricing and inventory' },
  { id: 'cafe', name: 'Café Basic', description: 'Minimal setup for essential compliance only' },
  { id: 'catering', name: 'Catering Business', description: 'Comprehensive financial tracking' }
]

export default function ClientDisplayConfigurationPanel({
  clientId,
  onConfigurationSaved
}: ClientDisplayConfigurationPanelProps) {
  const [configuration, setConfiguration] = useState<DisplayConfiguration | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Load existing configuration
  useEffect(() => {
    loadConfiguration()
  }, [clientId])

  const loadConfiguration = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/client-config/display?clientId=${clientId}`)
      const data = await response.json()
      
      if (data.success) {
        setConfiguration(data.configuration)
      } else {
        setError('Failed to load configuration')
      }
    } catch (err) {
      setError('Error loading configuration')
      console.error('Configuration load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFieldToggle = (fieldKey: string, category: 'mandatory' | 'optional') => {
    if (!configuration) return

    setConfiguration(prev => {
      if (!prev) return prev
      
      const updatedConfig = { ...prev }
      
      if (category === 'mandatory') {
        updatedConfig.mandatoryFields = {
          ...prev.mandatoryFields,
          [fieldKey]: !prev.mandatoryFields[fieldKey as keyof typeof prev.mandatoryFields]
        }
      } else {
        updatedConfig.optionalFields = {
          ...prev.optionalFields,
          [fieldKey]: !prev.optionalFields[fieldKey as keyof typeof prev.optionalFields]
        }
      }
      
      return updatedConfig
    })
  }

  const handleDisplayPreferenceChange = (key: string, value: any) => {
    if (!configuration) return

    setConfiguration(prev => {
      if (!prev) return prev
      
      return {
        ...prev,
        displayPreferences: {
          ...prev.displayPreferences,
          [key]: value
        }
      }
    })
  }

  const applyIndustryPreset = async (presetId: string) => {
    try {
      setSaving(true)
      setError(null)
      
      const response = await fetch('/api/client-config/display', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId,
          applyPreset: presetId
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setConfiguration(data.configuration)
        setSuccessMessage(data.message)
        onConfigurationSaved?.(data.configuration)
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(data.error || 'Failed to apply preset')
      }
    } catch (err) {
      setError('Error applying preset')
      console.error('Preset application error:', err)
    } finally {
      setSaving(false)
    }
  }

  const saveConfiguration = async () => {
    if (!configuration) return

    try {
      setSaving(true)
      setError(null)
      
      const response = await fetch('/api/client-config/display', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId,
          configuration
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setConfiguration(data.configuration)
        setSuccessMessage('Configuration saved successfully')
        onConfigurationSaved?.(data.configuration)
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setError(data.error || 'Failed to save configuration')
      }
    } catch (err) {
      setError('Error saving configuration')
      console.error('Configuration save error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={getCardStyle('primary')}>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="ml-3 text-white">Loading configuration...</span>
        </div>
      </div>
    )
  }

  if (!configuration) {
    return (
      <div className={getCardStyle('primary')}>
        <div className="text-center py-12">
          <p className="text-white/80 mb-4">No configuration found</p>
          <button 
            onClick={loadConfiguration}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200"
          >
            Retry Loading
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className={getCardStyle('primary')}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-2`}>
              Results Display Configuration
            </h2>
            <p className={`${getTextStyle('body')} text-white/80 text-sm`}>
              Configure which fields appear in delivery docket results for this client
            </p>
          </div>
          
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-600/20 border border-red-400/30 rounded-xl p-4">
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-600/20 border border-green-400/30 rounded-xl p-4">
            <p className="text-green-300 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Industry Presets */}
        <div className="mb-8">
          <h3 className="text-white font-medium mb-4">Quick Setup - Industry Presets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {INDUSTRY_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="bg-white/10 rounded-xl p-4 hover:bg-white/15 transition-all duration-200 cursor-pointer"
                onClick={() => applyIndustryPreset(preset.id)}
              >
                <h4 className="text-white font-medium mb-2">{preset.name}</h4>
                <p className="text-white/70 text-sm mb-3">{preset.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    configuration.industryPreset === preset.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white/20 text-white/70'
                  }`}>
                    {configuration.industryPreset === preset.id ? 'Active' : 'Apply'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mandatory Fields Section */}
      <div className={getCardStyle('secondary')}>
        <h3 className="text-white font-medium mb-4">
          Mandatory Information (Always Displayed)
        </h3>
        <div className="space-y-3">
          {FIELD_CONFIGURATIONS.filter(field => field.category === 'mandatory').map((field) => (
            <div key={field.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl opacity-75">
              <div className="flex-1">
                <h4 className="text-white font-medium">{field.label}</h4>
                <p className="text-white/70 text-sm">{field.description}</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="w-5 h-5 rounded bg-gray-600 border-gray-500 text-blue-600 opacity-75"
                />
                <span className="ml-2 text-white/50 text-sm">Required</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Fields Section */}
      <div className={getCardStyle('secondary')}>
        <h3 className="text-white font-medium mb-4">
          Optional Information (Choose What to Display)
        </h3>
        <div className="space-y-3">
          {FIELD_CONFIGURATIONS.filter(field => field.category === 'optional').map((field) => (
            <div key={field.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200">
              <div className="flex-1">
                <h4 className="text-white font-medium">{field.label}</h4>
                <p className="text-white/70 text-sm">{field.description}</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={configuration.optionalFields[field.key as keyof typeof configuration.optionalFields]}
                  onChange={() => handleFieldToggle(field.key, 'optional')}
                  className="w-5 h-5 rounded bg-white/20 border-white/30 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Display Preferences */}
      <div className={getCardStyle('secondary')}>
        <h3 className="text-white font-medium mb-4">Display Preferences</h3>
        <div className="space-y-6">
          
          {/* Card Layout */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">Card Layout</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'compact', label: 'Compact', description: 'Essential info only' },
                { value: 'detailed', label: 'Detailed', description: 'All selected fields' },
                { value: 'minimal', label: 'Minimal', description: 'Critical compliance only' }
              ].map((layout) => (
                <div
                  key={layout.value}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    configuration.displayPreferences.resultsCardLayout === layout.value
                      ? 'border-blue-400 bg-blue-600/20'
                      : 'border-white/30 bg-white/10 hover:bg-white/15'
                  }`}
                  onClick={() => handleDisplayPreferenceChange('resultsCardLayout', layout.value)}
                >
                  <h4 className="text-white font-medium mb-1">{layout.label}</h4>
                  <p className="text-white/70 text-xs">{layout.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Other Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Group by Temperature Category */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white/80 text-sm font-medium">Group by Temperature Category</label>
                <p className="text-white/60 text-xs">Organize items by Frozen/Chilled/Ambient</p>
              </div>
              <input
                type="checkbox"
                checked={configuration.displayPreferences.groupByTemperatureCategory}
                onChange={(e) => handleDisplayPreferenceChange('groupByTemperatureCategory', e.target.checked)}
                className="w-5 h-5 rounded bg-white/20 border-white/30 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Show Confidence Scores */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white/80 text-sm font-medium">Show AI Confidence Scores</label>
                <p className="text-white/60 text-xs">Display how confident AI is about extracted data</p>
              </div>
              <input
                type="checkbox"
                checked={configuration.displayPreferences.showConfidenceScores}
                onChange={(e) => handleDisplayPreferenceChange('showConfidenceScores', e.target.checked)}
                className="w-5 h-5 rounded bg-white/20 border-white/30 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Currency Symbol */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Currency Symbol</label>
              <input
                type="text"
                value={configuration.displayPreferences.currencySymbol}
                onChange={(e) => handleDisplayPreferenceChange('currencySymbol', e.target.value)}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/50"
                placeholder="$"
                maxLength={3}
              />
            </div>

            {/* Temperature Unit */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Temperature Unit</label>
              <select
                value={configuration.displayPreferences.temperatureUnit}
                onChange={(e) => handleDisplayPreferenceChange('temperatureUnit', e.target.value)}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-white/50"
              >
                <option value="C">Celsius (°C)</option>
                <option value="F">Fahrenheit (°F)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={loadConfiguration}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white rounded-xl transition-all duration-200"
          disabled={saving}
        >
          Reset
        </button>
        
        <button
          onClick={saveConfiguration}
          disabled={saving}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl transition-all duration-200 flex items-center space-x-2"
        >
          {saving && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          )}
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>
    </div>
  )
}