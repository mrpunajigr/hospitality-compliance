# Phase 3: useDisplayConfiguration Hook

## 🎯 Objective
Create a centralized state management hook that handles configuration loading, database operations, and enhanced toggle states with positive feedback.

## 📁 File: `/hooks/UseDisplayConfiguration.ts`

```typescript
// hooks/UseDisplayConfiguration.ts

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GetDefaultConfiguration, EnsureCompleteConfiguration, UpdateFieldConfig } from '@/lib/ConfigurationDefaults';
import type { 
  DisplayConfiguration, 
  FieldKey, 
  DisplayFieldConfig,
  ToggleEvent 
} from '@/app/types/Configuration';

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
        finalConfig = EnsureCompleteConfiguration(data.configuration_data);
      } else {
        // No configuration exists, use defaults
        console.log('📋 [useDisplayConfiguration] No configuration found, creating defaults');
        finalConfig = GetDefaultConfiguration();
        
        // Save defaults to database for future loads
        await saveConfigurationToDatabase(finalConfig);
      }

      setConfig(finalConfig);
      console.log('🎯 [useDisplayConfiguration] Configuration loaded successfully:', {
        hasConfig: !!finalConfig,
        fieldCount: Object.keys(finalConfig.fields).length,
        enabledFields: Object.values(finalConfig.fields).filter(f => f.enabled).length
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load configuration';
      console.error('❌ [useDisplayConfiguration] Load error:', errorMessage);
      setError(new Error(errorMessage));
      
      // Fallback to defaults on error
      const defaultConfig = GetDefaultConfiguration();
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

      const defaultConfig = GetDefaultConfiguration();
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
```

## 🗄️ Database Schema Required

### Create `client_display_configurations` table:

```sql
-- Create client display configurations table
CREATE TABLE IF NOT EXISTS client_display_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  configuration_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(client_id)
);

-- Create index for client lookups
CREATE INDEX IF NOT EXISTS idx_client_display_configurations_client_id 
ON client_display_configurations(client_id);

-- Enable RLS
ALTER TABLE client_display_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their client's display configuration" 
ON client_display_configurations
FOR SELECT USING (
  client_id IN (
    SELECT client_id FROM client_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their client's display configuration" 
ON client_display_configurations
FOR ALL USING (
  client_id IN (
    SELECT client_id FROM client_users 
    WHERE user_id = auth.uid()
    AND role IN ('OWNER', 'MANAGER', 'CHAMPION')
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_client_display_configurations_updated_at 
  BEFORE UPDATE ON client_display_configurations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🎨 Enhanced Features

### **Optimistic UI Updates**
- **Immediate feedback**: UI updates instantly before database save
- **Error recovery**: Reverts changes if database operation fails
- **Positive messaging**: Clear success indicators with checkmarks

### **Smart State Management**
- **Single source of truth**: Hook manages all configuration state
- **Type safety**: All operations fully type-checked
- **Default fallback**: Always provides complete configuration
- **Auto-save**: Database updates happen automatically

### **Enhanced Toggle Experience**
- **Positive feedback**: "Field enabled ✓" messaging
- **Protected mandatory fields**: Cannot disable required fields
- **Toggle events**: Detailed logging for debugging
- **Visual indicators**: Green/gray states with proper messaging

### **Error Handling**
- **Graceful degradation**: Falls back to defaults on errors
- **User-friendly messages**: No technical stack traces
- **Recovery mechanisms**: Reload from database on update failures
- **Comprehensive logging**: Debug information for development

## 🧪 Testing Checklist

### Core Functionality
- [ ] Hook loads configuration from database
- [ ] Falls back to defaults when no config exists
- [ ] Saves new configurations to database
- [ ] Updates existing configurations correctly
- [ ] Handles database errors gracefully

### Toggle Functionality
- [ ] toggleField() updates enabled state
- [ ] Prevents toggling mandatory fields
- [ ] Updates toggle state with positive messaging
- [ ] Optimistic updates work correctly
- [ ] Error recovery reverts optimistic updates

### State Management
- [ ] Single source of truth maintained
- [ ] Loading states displayed correctly
- [ ] Error states shown to user
- [ ] Configuration persistence works
- [ ] Re-renders happen appropriately

### Type Safety
- [ ] All field operations type-checked
- [ ] Invalid field keys cause compile errors
- [ ] Hook return types are correct
- [ ] Database operations use proper types

## ✅ Success Criteria

- [ ] Centralized configuration state management
- [ ] Enhanced toggle functionality with positive feedback
- [ ] Optimistic UI updates with error recovery
- [ ] Complete type safety throughout
- [ ] Graceful error handling and fallbacks
- [ ] Database persistence with RLS security

## 🚀 Ready for Phase 4

Once this hook is implemented and tested, we can proceed to Phase 4: Refactoring the ConfigCard component to use this hook and become a pure display component.

## 📋 Implementation Notes

### Key Improvements Over Old System
1. **Separation of concerns**: Hook handles logic, components handle display
2. **Type safety**: No more undefined field errors
3. **Positive feedback**: Clear success messaging for user actions
4. **Error recovery**: Graceful handling of database failures
5. **Performance**: Optimistic updates for instant feedback

### Integration with Previous Phases
- **Uses Phase 1 types**: Full type safety with FieldKey and DisplayConfiguration
- **Uses Phase 2 defaults**: EnsureCompleteConfiguration and UpdateFieldConfig
- **Prepares for Phase 4**: Clean interface for ConfigCard component
- **Enables Phase 5**: Parent components get centralized state management