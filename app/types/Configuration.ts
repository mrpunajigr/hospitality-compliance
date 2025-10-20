// types/Configuration.ts

/**
 * Field keys with complete type safety
 * Using const arrays ensures no typos and enables IDE autocomplete
 */
export const MANDATORY_FIELDS = [
  'supplier',
  'deliveryDate',
  'handwrittenNotes', 
  'temperature',
  'productClassification'
] as const;

export const OPTIONAL_FIELDS = [
  'invoiceNumber',
  'items',
  'unitSize',
  'unitPrice',
  'sku',
  'tax'
] as const;

// Derive types from const arrays (single source of truth)
export type MandatoryFieldKey = typeof MANDATORY_FIELDS[number];
export type OptionalFieldKey = typeof OPTIONAL_FIELDS[number];
export type FieldKey = MandatoryFieldKey | OptionalFieldKey | string; // Allow dynamic field keys

/**
 * Toggle state configuration for positive user feedback
 */
export interface ToggleState {
  /** Current enabled state */
  enabled: boolean;
  
  /** Visual state for user feedback */
  state: 'enabled' | 'disabled';
  
  /** Positive feedback message when enabled */
  enabledMessage: string;
  
  /** Neutral message when disabled */
  disabledMessage: string;
  
  /** Visual indicator (color/icon) for current state */
  indicator: {
    color: 'green' | 'gray';
    icon: '✅' | '⚪';
    background: string;
  };
}

/**
 * Configuration for a single display field
 * All fields are REQUIRED to prevent undefined errors
 */
export interface DisplayFieldConfig {
  /** Whether this field is enabled for display */
  enabled: boolean;
  
  /** Display label for the field (REQUIRED) */
  label: string;
  
  /** Description/help text for the field (REQUIRED) */
  description: string;
  
  /** Category determines if field can be disabled */
  category: 'mandatory' | 'optional';
  
  /** Display order (lower numbers appear first) */
  order: number;
  
  /** Toggle state configuration for positive feedback */
  toggleState: ToggleState;
  
  /** Optional default value for the field */
  defaultValue?: any;
}

/**
 * Complete display configuration for a company
 */
export interface DisplayConfiguration {
  /** Field configurations keyed by FieldKey - supports dynamic fields */
  fields: Record<string, DisplayFieldConfig>;
  
  /** Layout preference for results display */
  layout: 'grid' | 'list' | 'compact';
  
  /** Theme preference for results display */
  theme: 'light' | 'dark';
}

/**
 * Toggle state helpers for positive user feedback
 */
export const TOGGLE_STATES = {
  ENABLED: {
    state: 'enabled' as const,
    indicator: {
      color: 'green' as const,
      icon: '✅' as const,
      background: 'bg-green-100 border-green-300'
    }
  },
  DISABLED: {
    state: 'disabled' as const,
    indicator: {
      color: 'gray' as const,
      icon: '⚪' as const,
      background: 'bg-gray-100 border-gray-300'
    }
  }
} as const;

/**
 * Helper function to create toggle state with positive messaging
 */
export function CreateToggleState(
  enabled: boolean,
  fieldLabel: string,
  category: 'mandatory' | 'optional'
): ToggleState {
  const baseState = enabled ? TOGGLE_STATES.ENABLED : TOGGLE_STATES.DISABLED;
  
  return {
    enabled,
    state: baseState.state,
    enabledMessage: category === 'mandatory' 
      ? `${fieldLabel} is required and active ✓`
      : `${fieldLabel} is enabled and will be shown ✓`,
    disabledMessage: category === 'mandatory'
      ? `${fieldLabel} is required (cannot disable)`
      : `${fieldLabel} is disabled and will be hidden`,
    indicator: baseState.indicator
  };
}

// Type guard helpers
export function IsFieldKey(key: string): key is FieldKey {
  // For dynamic fields, we accept any non-empty string as a valid field key
  // The hardcoded arrays are kept for backward compatibility
  return typeof key === 'string' && key.length > 0;
}

export function IsMandatoryField(key: FieldKey): key is MandatoryFieldKey {
  return MANDATORY_FIELDS.includes(key as MandatoryFieldKey);
}

export function IsOptionalField(key: FieldKey): key is OptionalFieldKey {
  return OPTIONAL_FIELDS.includes(key as OptionalFieldKey);
}

/**
 * Toggle interaction event types
 */
export interface ToggleEvent {
  fieldKey: FieldKey;
  previousState: boolean;
  newState: boolean;
  timestamp: Date;
  userMessage: string;
}

/**
 * Toggle callback function type
 */
export type ToggleCallback = (event: ToggleEvent) => void;

/**
 * Props interface for ConfigCard component
 */
export interface ConfigCardProps {
  fieldKey: FieldKey;
  fieldConfig: DisplayFieldConfig;
  onToggle: ToggleCallback;
  disabled?: boolean;
  showPositiveFeedback?: boolean;
}

/**
 * Enhanced toggle component props with 2-state feedback
 */
export interface EnhancedToggleProps {
  /** Current enabled state */
  enabled: boolean;
  
  /** Toggle state configuration */
  toggleState: ToggleState;
  
  /** Callback when toggle is clicked */
  onToggle: (enabled: boolean) => void;
  
  /** Whether toggle is disabled */
  disabled?: boolean;
  
  /** Show positive feedback animation */
  showFeedback?: boolean;
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}