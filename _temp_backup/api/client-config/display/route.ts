// Client Display Configuration API
// Manages configurable results display settings for each client

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export interface DisplayConfiguration {
  id?: string
  clientId: string
  configName: string
  isActive: boolean
  
  // Mandatory fields (always shown)
  mandatoryFields: {
    showSupplier: boolean
    showDeliveryDate: boolean
    showSignedBy: boolean
    showTemperatureData: boolean
    showProductClassification: boolean
  }
  
  // Optional fields (configurable)
  optionalFields: {
    showInvoiceNumber: boolean
    showItems: boolean
    showUnitSize: boolean
    showUnitPrice: boolean
    showSkuCode: boolean
    showTax: boolean
    showEstimatedValue: boolean
    showItemCount: boolean
  }
  
  // Display preferences
  displayPreferences: {
    resultsCardLayout: 'compact' | 'detailed' | 'minimal'
    groupByTemperatureCategory: boolean
    showConfidenceScores: boolean
    currencySymbol: string
    dateFormat: string
    temperatureUnit: 'C' | 'F'
  }
  
  // Industry preset
  industryPreset: 'restaurant' | 'hotel' | 'cafe' | 'catering' | 'custom'
  
  createdAt?: string
  updatedAt?: string
}

// Industry preset templates
const INDUSTRY_PRESETS: Record<string, Partial<DisplayConfiguration>> = {
  restaurant: {
    configName: 'Restaurant Standard',
    industryPreset: 'restaurant',
    mandatoryFields: {
      showSupplier: true,
      showDeliveryDate: true,
      showSignedBy: true,
      showTemperatureData: true,
      showProductClassification: true
    },
    optionalFields: {
      showInvoiceNumber: true,
      showItems: true,
      showUnitSize: false,
      showUnitPrice: false,
      showSkuCode: false,
      showTax: false,
      showEstimatedValue: true,
      showItemCount: true
    },
    displayPreferences: {
      resultsCardLayout: 'compact',
      groupByTemperatureCategory: true,
      showConfidenceScores: false,
      currencySymbol: '$',
      dateFormat: 'DD/MM/YYYY',
      temperatureUnit: 'C'
    }
  },
  
  hotel: {
    configName: 'Hotel Catering',
    industryPreset: 'hotel',
    mandatoryFields: {
      showSupplier: true,
      showDeliveryDate: true,
      showSignedBy: true,
      showTemperatureData: true,
      showProductClassification: true
    },
    optionalFields: {
      showInvoiceNumber: true,
      showItems: true,
      showUnitSize: true,
      showUnitPrice: true,
      showSkuCode: false,
      showTax: true,
      showEstimatedValue: true,
      showItemCount: true
    },
    displayPreferences: {
      resultsCardLayout: 'detailed',
      groupByTemperatureCategory: true,
      showConfidenceScores: false,
      currencySymbol: '$',
      dateFormat: 'DD/MM/YYYY',
      temperatureUnit: 'C'
    }
  },
  
  cafe: {
    configName: 'Café Basic',
    industryPreset: 'cafe',
    mandatoryFields: {
      showSupplier: true,
      showDeliveryDate: true,
      showSignedBy: true,
      showTemperatureData: true,
      showProductClassification: true
    },
    optionalFields: {
      showInvoiceNumber: false,
      showItems: false,
      showUnitSize: false,
      showUnitPrice: false,
      showSkuCode: false,
      showTax: false,
      showEstimatedValue: false,
      showItemCount: true
    },
    displayPreferences: {
      resultsCardLayout: 'minimal',
      groupByTemperatureCategory: true,
      showConfidenceScores: false,
      currencySymbol: '$',
      dateFormat: 'DD/MM/YYYY',
      temperatureUnit: 'C'
    }
  },
  
  catering: {
    configName: 'Catering Business',
    industryPreset: 'catering',
    mandatoryFields: {
      showSupplier: true,
      showDeliveryDate: true,
      showSignedBy: true,
      showTemperatureData: true,
      showProductClassification: true
    },
    optionalFields: {
      showInvoiceNumber: true,
      showItems: true,
      showUnitSize: true,
      showUnitPrice: true,
      showSkuCode: true,
      showTax: true,
      showEstimatedValue: true,
      showItemCount: true
    },
    displayPreferences: {
      resultsCardLayout: 'detailed',
      groupByTemperatureCategory: false,
      showConfidenceScores: true,
      currencySymbol: '$',
      dateFormat: 'DD/MM/YYYY',
      temperatureUnit: 'C'
    }
  }
}

/**
 * GET - Retrieve client display configuration
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }
    
    
    // Get active configuration for client
    const { data: config, error } = await supabase
      .from('client_display_configurations')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching display configuration:', error)
      return NextResponse.json(
        { error: 'Failed to fetch configuration' },
        { status: 500 }
      )
    }
    
    // If no configuration found, return default restaurant preset
    if (!config) {
      const defaultConfig = createDefaultConfiguration(clientId, 'restaurant')
      
      return NextResponse.json({
        success: true,
        configuration: defaultConfig,
        isDefault: true
      })
    }
    
    // Transform database format to API format
    const configuration: DisplayConfiguration = transformFromDatabase(config)
    
    return NextResponse.json({
      success: true,
      configuration,
      isDefault: false
    })
    
  } catch (error) {
    console.error('Configuration API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create or update client display configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, configuration, applyPreset } = body
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }
    
    
    let configToSave: DisplayConfiguration
    
    // Apply industry preset if requested
    if (applyPreset && INDUSTRY_PRESETS[applyPreset]) {
      configToSave = {
        ...createDefaultConfiguration(clientId, applyPreset),
        ...INDUSTRY_PRESETS[applyPreset],
        clientId,
        isActive: true
      }
    } else if (configuration) {
      configToSave = {
        ...configuration,
        clientId,
        isActive: true
      }
    } else {
      return NextResponse.json(
        { error: 'Configuration or preset is required' },
        { status: 400 }
      )
    }
    
    // Validate configuration
    const validation = validateConfiguration(configToSave)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: validation.errors },
        { status: 400 }
      )
    }
    
    // Deactivate existing configurations
    await supabase
      .from('client_display_configurations')
      .update({ is_active: false })
      .eq('client_id', clientId)
    
    // Transform to database format and insert new configuration
    const dbConfig = transformToDatabase(configToSave)
    
    const { data: newConfig, error } = await supabase
      .from('client_display_configurations')
      .insert(dbConfig)
      .select()
      .single()
    
    if (error) {
      console.error('Error saving configuration:', error)
      return NextResponse.json(
        { error: 'Failed to save configuration' },
        { status: 500 }
      )
    }
    
    const savedConfiguration = transformFromDatabase(newConfig)
    
    return NextResponse.json({
      success: true,
      configuration: savedConfiguration,
      message: applyPreset ? `Applied ${applyPreset} preset` : 'Configuration saved'
    })
    
  } catch (error) {
    console.error('Configuration save error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET available industry presets
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({
    success: true,
    presets: Object.keys(INDUSTRY_PRESETS).map(key => ({
      id: key,
      name: INDUSTRY_PRESETS[key].configName,
      description: getPresetDescription(key)
    }))
  })
}

// Helper functions

function createDefaultConfiguration(clientId: string, preset: string = 'restaurant'): DisplayConfiguration {
  const baseConfig = INDUSTRY_PRESETS[preset] || INDUSTRY_PRESETS.restaurant
  
  return {
    clientId,
    configName: baseConfig.configName || 'Default Configuration',
    isActive: true,
    mandatoryFields: {
      showSupplier: true,
      showDeliveryDate: true,
      showSignedBy: true,
      showTemperatureData: true,
      showProductClassification: true
    },
    optionalFields: {
      showInvoiceNumber: false,
      showItems: false,
      showUnitSize: false,
      showUnitPrice: false,
      showSkuCode: false,
      showTax: false,
      showEstimatedValue: false,
      showItemCount: false
    },
    displayPreferences: {
      resultsCardLayout: 'compact',
      groupByTemperatureCategory: true,
      showConfidenceScores: false,
      currencySymbol: '$',
      dateFormat: 'DD/MM/YYYY',
      temperatureUnit: 'C'
    },
    industryPreset: preset as any,
    ...baseConfig
  }
}

function transformFromDatabase(dbConfig: any): DisplayConfiguration {
  return {
    id: dbConfig.id,
    clientId: dbConfig.client_id,
    configName: dbConfig.config_name,
    isActive: dbConfig.is_active,
    
    mandatoryFields: {
      showSupplier: dbConfig.show_supplier,
      showDeliveryDate: dbConfig.show_delivery_date,
      showSignedBy: dbConfig.show_signed_by,
      showTemperatureData: dbConfig.show_temperature_data,
      showProductClassification: dbConfig.show_product_classification
    },
    
    optionalFields: {
      showInvoiceNumber: dbConfig.show_invoice_number,
      showItems: dbConfig.show_items,
      showUnitSize: dbConfig.show_unit_size,
      showUnitPrice: dbConfig.show_unit_price,
      showSkuCode: dbConfig.show_sku_code,
      showTax: dbConfig.show_tax,
      showEstimatedValue: dbConfig.show_estimated_value,
      showItemCount: dbConfig.show_item_count
    },
    
    displayPreferences: {
      resultsCardLayout: dbConfig.results_card_layout,
      groupByTemperatureCategory: dbConfig.group_by_temperature_category,
      showConfidenceScores: dbConfig.show_confidence_scores,
      currencySymbol: dbConfig.currency_symbol,
      dateFormat: dbConfig.date_format,
      temperatureUnit: dbConfig.temperature_unit
    },
    
    industryPreset: dbConfig.industry_preset,
    createdAt: dbConfig.created_at,
    updatedAt: dbConfig.updated_at
  }
}

function transformToDatabase(config: DisplayConfiguration) {
  return {
    client_id: config.clientId,
    config_name: config.configName,
    is_active: config.isActive,
    
    // Mandatory fields
    show_supplier: config.mandatoryFields.showSupplier,
    show_delivery_date: config.mandatoryFields.showDeliveryDate,
    show_signed_by: config.mandatoryFields.showSignedBy,
    show_temperature_data: config.mandatoryFields.showTemperatureData,
    show_product_classification: config.mandatoryFields.showProductClassification,
    
    // Optional fields
    show_invoice_number: config.optionalFields.showInvoiceNumber,
    show_items: config.optionalFields.showItems,
    show_unit_size: config.optionalFields.showUnitSize,
    show_unit_price: config.optionalFields.showUnitPrice,
    show_sku_code: config.optionalFields.showSkuCode,
    show_tax: config.optionalFields.showTax,
    show_estimated_value: config.optionalFields.showEstimatedValue,
    show_item_count: config.optionalFields.showItemCount,
    
    // Display preferences
    results_card_layout: config.displayPreferences.resultsCardLayout,
    group_by_temperature_category: config.displayPreferences.groupByTemperatureCategory,
    show_confidence_scores: config.displayPreferences.showConfidenceScores,
    currency_symbol: config.displayPreferences.currencySymbol,
    date_format: config.displayPreferences.dateFormat,
    temperature_unit: config.displayPreferences.temperatureUnit,
    
    // Industry preset
    industry_preset: config.industryPreset
  }
}

function validateConfiguration(config: DisplayConfiguration): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!config.clientId) {
    errors.push('Client ID is required')
  }
  
  if (!config.configName || config.configName.trim().length === 0) {
    errors.push('Configuration name is required')
  }
  
  if (!['compact', 'detailed', 'minimal'].includes(config.displayPreferences.resultsCardLayout)) {
    errors.push('Invalid results card layout')
  }
  
  if (!['C', 'F'].includes(config.displayPreferences.temperatureUnit)) {
    errors.push('Invalid temperature unit')
  }
  
  if (!config.displayPreferences.currencySymbol || config.displayPreferences.currencySymbol.length === 0) {
    errors.push('Currency symbol is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

function getPresetDescription(preset: string): string {
  const descriptions: Record<string, string> = {
    restaurant: 'Standard restaurant configuration with basic compliance focus',
    hotel: 'Detailed hotel catering setup with pricing and inventory tracking',
    cafe: 'Minimal café setup focusing on essential compliance only',
    catering: 'Comprehensive catering business with full financial tracking'
  }
  
  return descriptions[preset] || 'Custom configuration'
}