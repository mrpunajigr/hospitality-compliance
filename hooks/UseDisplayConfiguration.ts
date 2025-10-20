// hooks/UseDisplayConfiguration.ts

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GetDefaultConfiguration, EnsureCompleteConfiguration, UpdateFieldConfig } from '../lib/ConfigurationDefaults';
import type { 
  DisplayConfiguration, 
  FieldKey, 
  DisplayFieldConfig,
  ToggleEvent 
} from '../app/types/Configuration';

/**
 * Hook return interface with enhanced toggle management
 */
interface UseDisplayConfigurationReturn {
  /** Current configuration state */
  config: DisplayConfiguration | null;
  
  /** Loading state for initial load and updates */
  loading: boolean;
  
  /** Error state for user-friendly error display */
  error: Error | null;
  
  /** Update a specific field with enhanced toggle feedback */
  updateField: (fieldKey: FieldKey, updates: Partial<DisplayFieldConfig>) => Promise<void>;
  
  /** Reset configuration to defaults */
  resetToDefaults: () => Promise<void>;
  
  /** Save current configuration to database */
  saveConfiguration: () => Promise<void>;
  
  /** Toggle field enabled state with positive feedback */
  toggleField: (fieldKey: FieldKey) => Promise<void>;
}

/**
 * Database table structure for client display configurations
 */
interface ClientDisplayConfiguration {
  id: string;
  client_id: string;
  configuration_data: DisplayConfiguration;
  created_at: string;
  updated_at: string;
}

/**
 * Custom hook for display configuration management
 */
export function useDisplayConfiguration(companyId: string): UseDisplayConfigurationReturn {
  const [config, setConfig] = useState<DisplayConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  console.log('🔧 [useDisplayConfiguration] Hook initialized for company:', companyId);

  /**
   * Load configuration from database with fallback to defaults
   */
  const loadConfiguration = async (): Promise<void> => {
    try {
      console.log('🔍 [useDisplayConfiguration] Loading configuration from database');
      setLoading(true);
      setError(null);

      // Query database for existing configuration
      const { data, error: dbError } = await supabase
        .from('client_display_configurations')
        .select('configuration_data')
        .eq('client_id', companyId)
        .single();

      if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Database error: ${dbError.message}`);
      }

      let finalConfig: DisplayConfiguration;

      if (data?.configuration_data) {
        // Merge existing config with defaults to ensure completeness
        console.log('✅ [useDisplayConfiguration] Found existing configuration, merging with defaults');
        finalConfig = await EnsureCompleteConfiguration(data.configuration_data);
      } else {
        // No configuration exists, use defaults
        console.log('📋 [useDisplayConfiguration] No configuration found, creating defaults');
        finalConfig = await GetDefaultConfiguration();
        
        // Save defaults to database for future loads
        await saveConfigurationToDatabase(finalConfig);
      }

      setConfig(finalConfig);
      console.log('🎯 [useDisplayConfiguration] Configuration loaded successfully:', {
        hasConfig: !!finalConfig,
        fieldCount: Object.keys(finalConfig.fields).length,
        enabledFields: Object.values(finalConfig.fields).filter((f: DisplayFieldConfig) => f.enabled).length
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load configuration';
      console.error('❌ [useDisplayConfiguration] Load error:', errorMessage);
      setError(new Error(errorMessage));
      
      // Fallback to defaults on error
      const defaultConfig = await GetDefaultConfiguration();
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save configuration to database
   */
  const saveConfigurationToDatabase = async (configToSave: DisplayConfiguration): Promise<void> => {
    console.log('💾 [useDisplayConfiguration] Saving configuration to database');

    const { error: saveError } = await supabase
      .from('client_display_configurations')
      .upsert({
        client_id: companyId,
        configuration_data: configToSave,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'client_id'
      });

    if (saveError) {
      throw new Error(`Failed to save configuration: ${saveError.message}`);
    }

    console.log('✅ [useDisplayConfiguration] Configuration saved successfully');
  };

  /**
   * Update a specific field with enhanced toggle state
   */
  const updateField = async (
    fieldKey: FieldKey, 
    updates: Partial<DisplayFieldConfig>
  ): Promise<void> => {
    try {
      console.log('🔧 [useDisplayConfiguration] Updating field:', { fieldKey, updates });

      if (!config) {
        throw new Error('Configuration not loaded');
      }

      // Update configuration using type-safe factory
      const updatedConfig = UpdateFieldConfig(config, fieldKey, updates);
      
      // Optimistic update - update UI immediately
      setConfig(updatedConfig);

      // Save to database
      await saveConfigurationToDatabase(updatedConfig);

      // Log success with toggle state info
      const updatedField = updatedConfig.fields[fieldKey];
      console.log('✅ [useDisplayConfiguration] Field updated successfully:', {
        fieldKey,
        enabled: updatedField.enabled,
        toggleState: updatedField.toggleState.state,
        message: updatedField.toggleState.enabledMessage
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update field';
      console.error('❌ [useDisplayConfiguration] Update field error:', errorMessage);
      setError(new Error(errorMessage));
      
      // Revert optimistic update by reloading from database
      await loadConfiguration();
    }
  };

  /**
   * Toggle field enabled state with positive feedback
   */
  const toggleField = async (fieldKey: FieldKey): Promise<void> => {
    console.log('🎨 [useDisplayConfiguration] Toggling field:', fieldKey);

    if (!config) {
      console.error('❌ [useDisplayConfiguration] Cannot toggle - no configuration loaded');
      return;
    }

    const currentField = config.fields[fieldKey];
    if (!currentField) {
      console.error('❌ [useDisplayConfiguration] Field not found:', fieldKey);
      return;
    }

    // Prevent toggling mandatory fields
    if (currentField.category === 'mandatory') {
      console.warn('⚠️ [useDisplayConfiguration] Cannot toggle mandatory field:', fieldKey);
      return;
    }

    const newEnabledState = !currentField.enabled;
    
    // Create toggle event for logging
    const toggleEvent: ToggleEvent = {
      fieldKey,
      previousState: currentField.enabled,
      newState: newEnabledState,
      timestamp: new Date(),
      userMessage: newEnabledState 
        ? `${currentField.label} enabled ✓` 
        : `${currentField.label} disabled`
    };

    console.log('🎯 [useDisplayConfiguration] Toggle event:', toggleEvent);

    // Update field with new enabled state
    await updateField(fieldKey, { enabled: newEnabledState });
  };

  /**
   * Reset configuration to defaults
   */
  const resetToDefaults = async (): Promise<void> => {
    try {
      console.log('🔄 [useDisplayConfiguration] Resetting to defaults');
      setLoading(true);

      const defaultConfig = await GetDefaultConfiguration();
      setConfig(defaultConfig);

      await saveConfigurationToDatabase(defaultConfig);

      console.log('✅ [useDisplayConfiguration] Reset to defaults complete');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset configuration';
      console.error('❌ [useDisplayConfiguration] Reset error:', errorMessage);
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save current configuration to database
   */
  const saveConfiguration = async (): Promise<void> => {
    try {
      if (!config) {
        throw new Error('No configuration to save');
      }

      console.log('💾 [useDisplayConfiguration] Manual save triggered');
      await saveConfigurationToDatabase(config);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save configuration';
      console.error('❌ [useDisplayConfiguration] Manual save error:', errorMessage);
      setError(new Error(errorMessage));
    }
  };

  // Load configuration on mount and when companyId changes
  useEffect(() => {
    if (companyId) {
      loadConfiguration();
    }
  }, [companyId]);

  return {
    config,
    loading,
    error,
    updateField,
    resetToDefaults,
    saveConfiguration,
    toggleField
  };
}