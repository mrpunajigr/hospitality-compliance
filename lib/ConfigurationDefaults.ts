// lib/ConfigurationDefaults.ts

import type { 
  DisplayConfiguration, 
  DisplayFieldConfig, 
  FieldKey,
  MandatoryFieldKey,
  OptionalFieldKey
} from '../app/types/Configuration';
import { CreateToggleState, MANDATORY_FIELDS, OPTIONAL_FIELDS } from '../app/types/Configuration';

/**
 * Complete field definitions with enhanced toggle states
 * Every field has complete metadata to prevent undefined errors
 */
const FIELD_DEFINITIONS: Record<FieldKey, Omit<DisplayFieldConfig, 'toggleState'>> = {
  // MANDATORY FIELDS - Always enabled, cannot be disabled
  supplier: {
    enabled: true,
    label: 'Supplier',
    description: 'Name of the delivery supplier - required for compliance tracking',
    category: 'mandatory',
    order: 1,
    defaultValue: ''
  },
  deliveryDate: {
    enabled: true,
    label: 'Delivery Date',
    description: 'Date when the delivery was received - required for compliance',
    category: 'mandatory',
    order: 2,
    defaultValue: null
  },
  handwrittenNotes: {
    enabled: true,
    label: 'Handwritten Notes',
    description: 'Any handwritten notes on delivery documentation',
    category: 'mandatory',
    order: 3,
    defaultValue: ''
  },
  temperature: {
    enabled: true,
    label: 'Temperature',
    description: 'Delivery temperature reading - critical for food safety',
    category: 'mandatory',
    order: 4,
    defaultValue: null
  },
  productClassification: {
    enabled: true,
    label: 'Product Classification',
    description: 'Type of product delivered - required for proper handling',
    category: 'mandatory',
    order: 5,
    defaultValue: 'general'
  },

  // OPTIONAL FIELDS - Can be enabled/disabled by user
  invoiceNumber: {
    enabled: true, // Default to enabled for better UX
    label: 'Invoice Number',
    description: 'Invoice or reference number for this delivery',
    category: 'optional',
    order: 6,
    defaultValue: ''
  },
  items: {
    enabled: true,
    label: 'Items',
    description: 'List of items included in this delivery',
    category: 'optional',
    order: 7,
    defaultValue: []
  },
  unitSize: {
    enabled: false, // Default to disabled for cleaner interface
    label: 'Unit Size',
    description: 'Size or quantity per unit delivered',
    category: 'optional',
    order: 8,
    defaultValue: ''
  },
  unitPrice: {
    enabled: false,
    label: 'Unit Price',
    description: 'Price per unit for cost tracking',
    category: 'optional',
    order: 9,
    defaultValue: 0
  },
  sku: {
    enabled: false,
    label: 'SKU',
    description: 'Stock Keeping Unit identifier',
    category: 'optional',
    order: 10,
    defaultValue: ''
  },
  tax: {
    enabled: false,
    label: 'Tax',
    description: 'Tax amount or percentage applied',
    category: 'optional',
    order: 11,
    defaultValue: 0
  }
};

/**
 * Generate complete default configuration with enhanced toggle states
 * Now supports loading from database field definitions
 */
export async function GetDefaultConfiguration(): Promise<DisplayConfiguration> {
  console.log('🔧 [ConfigurationDefaults] Generating default configuration');
  
  try {
    // Try to load from field configuration API first
    const response = await fetch('/api/config/fields');
    if (response.ok) {
      const apiData = await response.json();
      const dynamicConfig = await convertApiToDisplayConfiguration(apiData);
      console.log('✅ [ConfigurationDefaults] Loaded dynamic configuration from API');
      return dynamicConfig;
    }
  } catch (error) {
    console.log('ℹ️ [ConfigurationDefaults] API not available, using hardcoded defaults');
  }

  // Fallback to hardcoded configuration
  return getHardcodedConfiguration();
}

/**
 * Get hardcoded configuration (original implementation)
 */
export function getHardcodedConfiguration(): DisplayConfiguration {
  console.log('🔧 [ConfigurationDefaults] Using hardcoded configuration');
  
  const fields: Record<string, DisplayFieldConfig> = {};
  
  // Process each field and add toggle state
  (Object.keys(FIELD_DEFINITIONS) as FieldKey[]).forEach(fieldKey => {
    const fieldDef = FIELD_DEFINITIONS[fieldKey];
    
    // Create enhanced toggle state with positive feedback
    const toggleState = CreateToggleState(
      fieldDef.enabled,
      fieldDef.label,
      fieldDef.category
    );
    
    fields[fieldKey] = {
      ...fieldDef,
      toggleState
    };
    
    console.log('✅ [ConfigurationDefaults] Field configured:', {
      fieldKey,
      enabled: fieldDef.enabled,
      category: fieldDef.category,
      message: toggleState.enabledMessage
    });
  });

  const configuration: DisplayConfiguration = {
    fields,
    layout: 'grid',
    theme: 'light'
  };

  console.log('🎯 [ConfigurationDefaults] Default configuration created:', {
    totalFields: Object.keys(fields).length,
    mandatoryFields: Object.keys(fields).filter(key => fields[key as FieldKey].category === 'mandatory').length,
    optionalFields: Object.keys(fields).filter(key => fields[key as FieldKey].category === 'optional').length,
    enabledFields: Object.keys(fields).filter(key => fields[key as FieldKey].enabled).length
  });

  return configuration;
}

/**
 * Convert API field definitions to DisplayConfiguration format
 */
async function convertApiToDisplayConfiguration(apiData: any): Promise<DisplayConfiguration> {
  const fields: Record<string, DisplayFieldConfig> = {};
  
  // Process mandatory fields
  apiData.mandatoryFields?.forEach((field: any) => {
    if (IsFieldKey(field.key)) {
      const toggleState = CreateToggleState(field.enabled, field.label, 'mandatory');
      fields[field.key] = {
        enabled: field.enabled,
        label: field.label,
        description: field.description,
        category: 'mandatory',
        order: field.order,
        defaultValue: field.defaultValue,
        toggleState
      };
    }
  });

  // Process optional fields  
  apiData.optionalFields?.forEach((field: any) => {
    if (IsFieldKey(field.key)) {
      const toggleState = CreateToggleState(field.enabled, field.label, 'optional');
      fields[field.key] = {
        enabled: field.enabled,
        label: field.label,
        description: field.description,
        category: 'optional',
        order: field.order,
        defaultValue: field.defaultValue,
        toggleState
      };
    }
  });

  return {
    fields,
    layout: 'grid',
    theme: 'light'
  };
}

/**
 * Merge partial configuration with defaults, preserving user customizations
 */
export async function EnsureCompleteConfiguration(
  partial: Partial<DisplayConfiguration>
): Promise<DisplayConfiguration> {
  console.log('🔧 [ConfigurationDefaults] Ensuring complete configuration');
  
  const defaults = await GetDefaultConfiguration();
  
  // If no partial config provided, return defaults
  if (!partial || !partial.fields) {
    console.log('⚠️ [ConfigurationDefaults] No partial config, using full defaults');
    return defaults;
  }

  // Merge fields, preserving user customizations
  const mergedFields: Record<string, DisplayFieldConfig> = { ...defaults.fields };
  
  Object.keys(partial.fields).forEach(key => {
    if (IsFieldKey(key)) {
      const userField = partial.fields![key];
      const defaultField = defaults.fields[key];
      
      if (userField && defaultField) {
        // Preserve user's enabled state but regenerate toggle state
        const toggleState = CreateToggleState(
          userField.enabled,
          defaultField.label,
          defaultField.category
        );
        
        mergedFields[key] = {
          ...defaultField, // Start with defaults
          ...userField, // Override with user preferences
          toggleState // Always use fresh toggle state
        };
        
        console.log('🔄 [ConfigurationDefaults] Merged field:', {
          fieldKey: key,
          userEnabled: userField.enabled,
          defaultEnabled: defaultField.enabled,
          finalEnabled: mergedFields[key].enabled
        });
      }
    }
  });

  const finalConfig: DisplayConfiguration = {
    fields: mergedFields,
    layout: partial.layout || defaults.layout,
    theme: partial.theme || defaults.theme
  };

  console.log('✅ [ConfigurationDefaults] Configuration merge complete:', {
    preservedUserSettings: Object.keys(partial.fields).length,
    totalFields: Object.keys(finalConfig.fields).length
  });

  return finalConfig;
}

/**
 * Validate that configuration has all required fields
 */
export function ValidateConfiguration(config: DisplayConfiguration): boolean {
  console.log('🔍 [ConfigurationDefaults] Validating configuration');
  
  // Check that all mandatory fields exist
  const missingMandatory = MANDATORY_FIELDS.filter(
    fieldKey => !config.fields[fieldKey]
  );
  
  if (missingMandatory.length > 0) {
    console.error('❌ [ConfigurationDefaults] Missing mandatory fields:', missingMandatory);
    return false;
  }

  // Check that all optional fields exist
  const missingOptional = OPTIONAL_FIELDS.filter(
    fieldKey => !config.fields[fieldKey]
  );
  
  if (missingOptional.length > 0) {
    console.error('❌ [ConfigurationDefaults] Missing optional fields:', missingOptional);
    return false;
  }

  // Check that all fields have required properties
  const invalidFields = Object.keys(config.fields).filter(fieldKey => {
    const field = config.fields[fieldKey];
    return !field.label || !field.description || !field.toggleState;
  });

  if (invalidFields.length > 0) {
    console.error('❌ [ConfigurationDefaults] Invalid fields (missing required properties):', invalidFields);
    return false;
  }

  console.log('✅ [ConfigurationDefaults] Configuration validation passed');
  return true;
}

/**
 * Get field configuration by key with type safety
 */
export function GetFieldConfig(
  config: DisplayConfiguration,
  fieldKey: FieldKey
): DisplayFieldConfig | null {
  const field = config.fields[fieldKey];
  
  if (!field) {
    console.warn('⚠️ [ConfigurationDefaults] Field not found:', fieldKey);
    return null;
  }
  
  return field;
}

/**
 * Update field configuration with new toggle state
 */
export function UpdateFieldConfig(
  config: DisplayConfiguration,
  fieldKey: FieldKey,
  updates: Partial<Omit<DisplayFieldConfig, 'toggleState'>>
): DisplayConfiguration {
  console.log('🔧 [ConfigurationDefaults] Updating field config:', { fieldKey, updates });
  
  const currentField = config.fields[fieldKey];
  if (!currentField) {
    console.error('❌ [ConfigurationDefaults] Cannot update non-existent field:', fieldKey);
    return config;
  }

  // Create updated field with new toggle state
  const updatedField: DisplayFieldConfig = {
    ...currentField,
    ...updates,
    toggleState: CreateToggleState(
      updates.enabled !== undefined ? updates.enabled : currentField.enabled,
      updates.label || currentField.label,
      currentField.category
    )
  };

  const updatedConfig: DisplayConfiguration = {
    ...config,
    fields: {
      ...config.fields,
      [fieldKey]: updatedField
    }
  };

  console.log('✅ [ConfigurationDefaults] Field updated successfully:', {
    fieldKey,
    newToggleState: updatedField.toggleState.state,
    newMessage: updatedField.toggleState.enabledMessage
  });

  return updatedConfig;
}

// Helper function to check if string is valid field key
function IsFieldKey(key: string): key is FieldKey {
  const validKeys = [...MANDATORY_FIELDS, ...OPTIONAL_FIELDS] as string[];
  return validKeys.includes(key);
}