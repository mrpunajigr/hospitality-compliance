# ConfigCard Component Refactor - Separation of Concerns

## 🎯 Objective
Refactor ConfigCard from a stateful component with database logic into a pure display component following React best practices and the JiGR ecosystem architecture standards.

## 📋 Current Issues Analysis

### Issue 1: Violated Single Responsibility Principle
**Problem**: ConfigCard component is trying to do THREE jobs:
- Display UI elements (cards, toggles, labels)
- Manage local component state
- Handle database operations

**Impact**:
- Makes component difficult to test
- Creates state synchronization bugs
- Violates React component best practices
- Hard to reuse in other contexts

### Issue 2: TypeScript Type Safety Gaps
**Problem**: `DisplayFieldConfig` interface has optional fields causing runtime errors:

```typescript
// CURRENT (BROKEN)
interface DisplayFieldConfig {
  enabled: boolean;
  label?: string;  // Optional = undefined errors in rendering
}

// Component crashes when:
<Label>{fieldConfig.label}</Label>  // label is undefined!
```

**Impact**:
- Runtime crashes when labels are undefined
- No compile-time safety
- Silent failures in production
- Difficult to debug

### Issue 3: State Synchronization Problems
**Problem**: Three sources of truth competing:

```typescript
// 1. Database state (source of truth)
const dbConfig = await supabase.from('ClientDisplayConfigurations')...

// 2. Local component state (for UI updates)
const [localConfig, setLocalConfig] = useState(...)

// 3. Parent component state (might exist)
```

**Impact**:
- State gets out of sync
- Toggle changes don't persist
- UI updates don't match database
- Race conditions between updates

### Issue 4: Missing Default Configuration Handling
**Problem**: No fallback when configuration doesn't exist:

```typescript
// Database query returns null
const config = await loadConfiguration(companyId);
// Code assumes config exists
config.fields.supplier.label  // CRASH! config is null
```

**Impact**:
- Errors on first-time users
- No configuration? Everything breaks
- Poor user experience
- Requires manual database seeding

### Issue 5: No Type Safety for Field Keys
**Problem**: Field keys are just strings:

```typescript
// Any string is valid - typos cause silent failures
config.fields['supplyer']  // Typo! No error, just undefined
config.fields['newField']  // Made-up field? No problem!
```

**Impact**:
- Typos cause silent bugs
- No autocomplete in IDE
- Can't refactor safely
- Runtime errors instead of compile errors

---

## ✅ Solution Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────┐
│     ConfigurationPage (Parent)              │
│  - Manages all state & business logic       │
│  - Uses useDisplayConfiguration hook        │
│  - Orchestrates database operations         │
└──────────────────┬──────────────────────────┘
                   │
                   │ Props Flow (One-way)
                   ↓
┌─────────────────────────────────────────────┐
│     ConfigCard (Pure Display Component)     │
│  - Receives config via props                │
│  - Emits events via callbacks               │
│  - NO database logic                        │
│  - NO state management                      │
└─────────────────────────────────────────────┘
```

**Data Flow**:
```
User clicks toggle
  â†' ConfigCard emits onToggle callback
  â†' Parent's updateField function called
  â†' Hook updates database
  â†' Hook updates local state
  â†' React re-renders with new props
  â†' ConfigCard displays updated state
```

---

## ðŸ"§ Implementation Plan

### PHASE 1: Create Configuration Management Hook

**File**: `/hooks/UseDisplayConfiguration.ts`

**Purpose**: Centralized state management for display configuration

**What It Should Do**:
1. Load configuration from database on mount
2. Apply default configuration when none exists
3. Provide type-safe update functions
4. Handle database synchronization
5. Manage loading and error states
6. Ensure single source of truth

**Expected Interface**:
```typescript
interface UseDisplayConfigurationReturn {
  config: DisplayConfiguration | null;
  loading: boolean;
  error: Error | null;
  updateField: (fieldKey: FieldKey, updates: Partial<DisplayFieldConfig>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  saveConfiguration: () => Promise<void>;
}

// Usage
const { config, loading, updateField } = useDisplayConfiguration(companyId);
```

**Implementation Requirements**:
- Use `useState` for config state
- Use `useEffect` for initial load
- Implement `updateField` function that updates both database AND state
- Apply default configuration via `ensureCompleteConfiguration`
- Handle errors gracefully with user-friendly messages
- Add console logging for debugging: `console.log('🔧 [useDisplayConfiguration]', ...)`

**File Structure**:
```typescript
// hooks/UseDisplayConfiguration.ts

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ensureCompleteConfiguration } from '@/lib/ConfigurationDefaults';
import type { DisplayConfiguration, FieldKey, DisplayFieldConfig } from '@/types/Configuration';

export function useDisplayConfiguration(companyId: string) {
  const [config, setConfig] = useState<DisplayConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // TODO: Implement loadConfiguration function
  // TODO: Implement updateField function
  // TODO: Implement resetToDefaults function
  
  return { config, loading, error, updateField, resetToDefaults };
}
```

**Testing Checklist**:
- [ ] Hook loads configuration from database
- [ ] Hook applies defaults when no config exists
- [ ] updateField updates database correctly
- [ ] updateField updates local state immediately
- [ ] Loading states work correctly
- [ ] Error handling displays proper messages

---

### PHASE 2: Create Default Configuration Factory

**File**: `/lib/ConfigurationDefaults.ts`

**Purpose**: Provide complete, type-safe default configurations

**What It Should Do**:
1. Define ALL fields with complete metadata
2. Ensure no optional fields (all required)
3. Provide sensible defaults for new companies
4. Merge partial configurations with defaults
5. Validate configuration completeness

**Expected Interface**:
```typescript
// Get complete default configuration
const defaultConfig = getDefaultConfiguration();

// Merge partial config with defaults
const completeConfig = ensureCompleteConfiguration(partialConfig);

// Validate configuration has all required fields
const isValid = validateConfiguration(config);
```

**Implementation Requirements**:
- Define MANDATORY_FIELDS and OPTIONAL_FIELDS as const arrays
- Create complete DisplayFieldConfig for each field
- Include labels, descriptions, categories, and order
- Implement merge function that preserves custom settings
- Add validation function to check completeness

**File Structure**:
```typescript
// lib/ConfigurationDefaults.ts

import type { DisplayConfiguration, FieldKey } from '@/types/Configuration';

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

export function getDefaultConfiguration(): DisplayConfiguration {
  return {
    fields: {
      supplier: {
        enabled: true,
        label: 'Supplier',
        description: 'Name of the delivery supplier',
        category: 'mandatory',
        order: 1
      },
      // TODO: Define all other fields...
    },
    layout: 'grid',
    theme: 'light'
  };
}

export function ensureCompleteConfiguration(
  partial: Partial<DisplayConfiguration>
): DisplayConfiguration {
  const defaults = getDefaultConfiguration();
  // TODO: Implement smart merge logic
  return merged;
}
```

**Testing Checklist**:
- [ ] All mandatory fields have complete definitions
- [ ] All optional fields have complete definitions
- [ ] Labels are never undefined
- [ ] ensureCompleteConfiguration preserves custom settings
- [ ] Validation catches incomplete configurations

---

### PHASE 3: Enhance TypeScript Type Safety

**File**: `/types/Configuration.ts`

**Purpose**: Provide bulletproof type safety for configuration system

**What It Should Do**:
1. Define const arrays for field keys (no typos possible)
2. Create union types from const arrays
3. Make all fields required (no undefined errors)
4. Provide helper types for type guards
5. Enable IDE autocomplete for field keys

**Expected Type System**:
```typescript
// Field keys are type-safe
type MandatoryFieldKey = 'supplier' | 'deliveryDate' | 'temperature' | 'productClassification';
type OptionalFieldKey = 'invoiceNumber' | 'items' | 'unitSize' | 'unitPrice' | 'sku' | 'tax';
type FieldKey = MandatoryFieldKey | OptionalFieldKey;

// No optional fields = no undefined errors
interface DisplayFieldConfig {
  enabled: boolean;
  label: string;           // REQUIRED
  description: string;     // REQUIRED
  category: 'mandatory' | 'optional';
  order: number;
}
```

**Implementation Requirements**:
- Use `as const` for field key arrays
- Derive types from const arrays (single source of truth)
- All DisplayFieldConfig fields must be required
- Add JSDoc comments for better IDE support
- Export helper type guards if needed

**File Structure**:
```typescript
// types/Configuration.ts

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

export type MandatoryFieldKey = typeof MANDATORY_FIELDS[number];
export type OptionalFieldKey = typeof OPTIONAL_FIELDS[number];
export type FieldKey = MandatoryFieldKey | OptionalFieldKey;

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
  
  /** Optional default value for the field */
  defaultValue?: any;
}

/**
 * Complete display configuration for a company
 */
export interface DisplayConfiguration {
  /** Field configurations keyed by FieldKey */
  fields: Record<FieldKey, DisplayFieldConfig>;
  
  /** Layout preference for results display */
  layout: 'grid' | 'list' | 'compact';
  
  /** Theme preference for results display */
  theme: 'light' | 'dark';
}

// Type guard helpers
export function isFieldKey(key: string): key is FieldKey {
  return [...MANDATORY_FIELDS, ...OPTIONAL_FIELDS].includes(key as FieldKey);
}
```

**Testing Checklist**:
- [ ] TypeScript compilation succeeds
- [ ] No optional fields cause errors
- [ ] IDE autocomplete works for field keys
- [ ] Typos in field keys cause compile errors
- [ ] Type guards work correctly

---

### PHASE 4: Refactor ConfigCard to Pure Display Component

**File**: `/components/admin/ConfigCard.tsx`

**Purpose**: Transform ConfigCard into a stateless, reusable display component

**What It Should Do**:
1. Accept configuration via props (read-only)
2. Emit events via callback props
3. Display UI elements only (no business logic)
4. Be completely reusable in any context
5. Follow React best practices for pure components

**Expected Interface**:
```typescript
interface ConfigCardProps {
  fieldKey: FieldKey;
  fieldConfig: DisplayFieldConfig;
  onToggle: (fieldKey: FieldKey, enabled: boolean) => void;
  disabled?: boolean;
}

// Usage
<ConfigCard
  fieldKey="supplier"
  fieldConfig={config.fields.supplier}
  onToggle={(key, enabled) => updateField(key, { enabled })}
/>
```

**Implementation Requirements**:
- Remove ALL useState hooks
- Remove ALL useEffect hooks
- Remove ALL database operations
- Accept fieldConfig as prop (never fetch it)
- Use callback props for user interactions
- Add proper TypeScript prop types
- Use PascalCase naming convention
- Add console logging: `console.log('🎨 [ConfigCard]', ...)`

**What to Remove**:
```typescript
// ❌ REMOVE - No local state
const [isEnabled, setIsEnabled] = useState(...)

// ❌ REMOVE - No database operations
const updateDatabase = async () => {
  await supabase.from('ClientDisplayConfigurations')...
}

// ❌ REMOVE - No data fetching
useEffect(() => {
  loadConfiguration()...
}, [])
```

**What to Add**:
```typescript
// ✅ ADD - Props-based rendering
interface ConfigCardProps {
  fieldKey: FieldKey;
  fieldConfig: DisplayFieldConfig;
  onToggle: (fieldKey: FieldKey, enabled: boolean) => void;
  disabled?: boolean;
}

// ✅ ADD - Callback emission
const handleToggle = () => {
  onToggle(fieldKey, !fieldConfig.enabled);
};
```

**File Structure**:
```typescript
// components/admin/ConfigCard.tsx

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Label } from '@/components/ui/Label';
import type { FieldKey, DisplayFieldConfig } from '@/types/Configuration';

interface ConfigCardProps {
  fieldKey: FieldKey;
  fieldConfig: DisplayFieldConfig;
  onToggle: (fieldKey: FieldKey, enabled: boolean) => void;
  disabled?: boolean;
}

export function ConfigCard({ 
  fieldKey, 
  fieldConfig, 
  onToggle,
  disabled = false 
}: ConfigCardProps) {
  const handleToggle = () => {
    console.log('🎨 [ConfigCard] Toggle clicked:', fieldKey, !fieldConfig.enabled);
    onToggle(fieldKey, !fieldConfig.enabled);
  };

  return (
    <Card className={fieldConfig.category === 'mandatory' ? 'MandatoryCard' : 'OptionalCard'}>
      <div className="ConfigCardHeader">
        <Label>{fieldConfig.label}</Label>
        <Toggle
          checked={fieldConfig.enabled}
          onChange={handleToggle}
          disabled={disabled || fieldConfig.category === 'mandatory'}
        />
      </div>
      <p className="ConfigCardDescription">{fieldConfig.description}</p>
      {fieldConfig.category === 'mandatory' && (
        <span className="MandatoryBadge">Required</span>
      )}
    </Card>
  );
}
```

**Testing Checklist**:
- [ ] Component renders without errors
- [ ] Toggle calls onToggle callback
- [ ] Props update causes re-render
- [ ] Mandatory fields show disabled toggle
- [ ] Labels always display correctly
- [ ] No database operations occur

---

### PHASE 5: Update Parent Component

**File**: `/app/admin/configuration/page.tsx`

**Purpose**: Orchestrate all configuration management logic

**What It Should Do**:
1. Use useDisplayConfiguration hook for state
2. Render ConfigCard components with proper props
3. Handle loading and error states
4. Manage all business logic
5. Coordinate database operations

**Expected Structure**:
```typescript
export default function ConfigurationPage() {
  const { companyId } = useCompany();
  const { config, loading, error, updateField } = useDisplayConfiguration(companyId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!config) return <NoConfigurationMessage />;

  return (
    <div>
      <h1>Display Configuration</h1>
      
      {/* Mandatory Fields Section */}
      <section>
        <h2>Mandatory Fields</h2>
        {MANDATORY_FIELDS.map(key => (
          <ConfigCard
            key={key}
            fieldKey={key}
            fieldConfig={config.fields[key]}
            onToggle={(fieldKey, enabled) => updateField(fieldKey, { enabled })}
          />
        ))}
      </section>
      
      {/* Optional Fields Section */}
      <section>
        <h2>Optional Fields</h2>
        {OPTIONAL_FIELDS.map(key => (
          <ConfigCard
            key={key}
            fieldKey={key}
            fieldConfig={config.fields[key]}
            onToggle={(fieldKey, enabled) => updateField(fieldKey, { enabled })}
          />
        ))}
      </section>
    </div>
  );
}
```

**Implementation Requirements**:
- Import and use useDisplayConfiguration hook
- Import field key arrays from types
- Separate mandatory and optional sections
- Display loading spinner during initial load
- Display error messages if configuration fails
- Use console logging: `console.log('📋 [ConfigurationPage]', ...)`

**File Structure**:
```typescript
// app/admin/configuration/page.tsx

'use client';

import React from 'react';
import { useCompany } from '@/hooks/UseCompany';
import { useDisplayConfiguration } from '@/hooks/UseDisplayConfiguration';
import { ConfigCard } from '@/components/admin/ConfigCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { MANDATORY_FIELDS, OPTIONAL_FIELDS } from '@/types/Configuration';

export default function ConfigurationPage() {
  const { companyId } = useCompany();
  const { config, loading, error, updateField } = useDisplayConfiguration(companyId);

  console.log('📋 [ConfigurationPage] Render:', { 
    hasConfig: !!config, 
    loading, 
    hasError: !!error 
  });

  // TODO: Implement loading state
  // TODO: Implement error state
  // TODO: Implement main render with sections
  
  return <div>Configuration Page</div>;
}
```

**Testing Checklist**:
- [ ] Page loads configuration successfully
- [ ] Loading spinner displays initially
- [ ] Error messages display when appropriate
- [ ] ConfigCards render with correct props
- [ ] Toggle changes persist to database
- [ ] UI updates immediately after toggle
- [ ] Mandatory fields cannot be disabled

---

## âš ï¸ Safety Requirements

### Do NOT Break Existing Functionality
- Test each phase independently before moving to next
- Keep existing components working during refactor
- Use feature flags if needed for gradual rollout
- Maintain backward compatibility with database schema

### Testing Protocol
After each phase:
1. Run TypeScript compilation: `npm run type-check`
2. Test component rendering in browser
3. Verify database operations work correctly
4. Check console logs for errors
5. Test toggle functionality end-to-end
6. Verify configuration persists after page refresh

### Error Handling Requirements
- Add try-catch blocks around database operations
- Display user-friendly error messages (no stack traces)
- Log detailed errors to console for debugging
- Implement error boundaries for React components
- Handle edge cases (missing config, network errors, etc.)

### Console Logging Standards
Follow this format for debugging:
```typescript
console.log('🔧 [ComponentName] Action:', data);
console.error('❌ [ComponentName] Error:', error);
console.warn('⚠️ [ComponentName] Warning:', warning);
```

Examples:
```typescript
console.log('🔧 [useDisplayConfiguration] Loading configuration for company:', companyId);
console.log('✅ [useDisplayConfiguration] Configuration loaded successfully');
console.log('🎨 [ConfigCard] Toggle clicked:', fieldKey, enabled);
console.log('📋 [ConfigurationPage] Rendering configuration:', config);
```

---

## 📊 Success Criteria

### Functional Requirements
- [ ] ConfigCard renders without TypeScript errors
- [ ] Toggle states persist correctly to database
- [ ] Labels always display (never undefined)
- [ ] Configuration loads with defaults on first use
- [ ] Database updates work reliably
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly
- [ ] Mandatory fields cannot be disabled

### Code Quality Requirements
- [ ] Zero TypeScript compilation errors
- [ ] No console errors in browser
- [ ] Props flow one-way (parent → child)
- [ ] Single source of truth (hook manages state)
- [ ] Pure components (ConfigCard has no side effects)
- [ ] Type-safe field keys (no string typos possible)
- [ ] Following PascalCase naming convention
- [ ] Comprehensive console logging for debugging

### Performance Requirements
- [ ] Initial configuration load < 500ms
- [ ] Toggle updates feel instant (optimistic UI)
- [ ] No unnecessary re-renders
- [ ] Database operations batched when possible

---

## 🚀 Implementation Order

**CRITICAL**: Follow this order exactly. Do NOT skip ahead.

### Step 1: Type Safety Foundation
1. Create `/types/Configuration.ts` with complete type definitions
2. Verify TypeScript compilation succeeds
3. Test type safety with sample code
4. Get approval before proceeding

### Step 2: Default Configuration
1. Create `/lib/ConfigurationDefaults.ts` with all field definitions
2. Test getDefaultConfiguration returns complete config
3. Test ensureCompleteConfiguration merges correctly
4. Get approval before proceeding

### Step 3: Configuration Hook
1. Create `/hooks/UseDisplayConfiguration.ts`
2. Implement loadConfiguration function
3. Implement updateField function
4. Test hook independently in isolation
5. Get approval before proceeding

### Step 4: Refactor ConfigCard
1. Update `/components/admin/ConfigCard.tsx`
2. Remove all state and database logic
3. Convert to pure display component
4. Test rendering with sample props
5. Get approval before proceeding

### Step 5: Update Parent Component
1. Update `/app/admin/configuration/page.tsx`
2. Integrate useDisplayConfiguration hook
3. Pass props to ConfigCard components
4. Test complete integration
5. Perform end-to-end testing

### Step 6: Final Validation
1. Test full user workflow (load → toggle → persist → reload)
2. Verify all success criteria met
3. Check console for any errors or warnings
4. Confirm iPad Air Safari 12 compatibility
5. Document any issues discovered

---

## 🎯 Expected Outcomes

### Before Refactor (Current State)
```
❌ ConfigCard manages database directly
❌ TypeScript errors from undefined labels
❌ State synchronization bugs
❌ No default configuration handling
❌ Field keys are just strings (no type safety)
```

### After Refactor (Target State)
```
✅ Clean separation of concerns
✅ Zero TypeScript errors
✅ Reliable state management
✅ Default configuration always available
✅ Type-safe field keys with autocomplete
✅ Easy to test and maintain
✅ Scalable architecture for bolt-on modules
```

---

## 📞 Support & Questions

### If Issues Arise
1. Check console logs for detailed error messages
2. Verify each phase completed before moving to next
3. Review TypeScript compilation errors carefully
4. Test in isolation before integration
5. Ask for clarification if architecture is unclear

### Debugging Checklist
- [ ] Check browser console for errors
- [ ] Verify database schema matches expectations
- [ ] Check Supabase logs for failed queries
- [ ] Verify component props are correct types
- [ ] Check hook return values are not null/undefined
- [ ] Verify configuration has all required fields

---

## 🎨 JiGR Ecosystem Standards

This refactor follows JiGR ecosystem standards:

### Naming Conventions
- **Files**: PascalCase (ConfigCard.tsx, UseDisplayConfiguration.ts)
- **Components**: PascalCase (ConfigCard, LoadingSpinner)
- **Functions**: PascalCase (GetDefaultConfiguration, UpdateField)
- **CSS Classes**: PascalCase (ConfigCardHeader, MandatoryBadge)
- **Variables**: camelCase (fieldKey, companyId, isEnabled)

### Architecture Patterns
- **Hooks for logic**: Custom hooks manage state and side effects
- **Components for display**: Pure components render UI only
- **Types for safety**: Comprehensive TypeScript definitions
- **Defaults for reliability**: Always provide complete configurations

### Quality Standards
- **Type safety**: Zero TypeScript errors
- **Single responsibility**: Each file has one clear purpose
- **Testability**: Components and hooks tested in isolation
- **Performance**: Optimistic UI updates, efficient re-renders
- **Maintainability**: Clear code structure, comprehensive logging

---

## 📚 Additional Resources

### Related Documentation
- `/docs/ComponentArchitectureGuide.md` - Component design patterns
- `/docs/TypeScriptStandards.md` - Type safety guidelines
- `/types/Configuration.ts` - Complete type definitions
- `/lib/ConfigurationDefaults.ts` - Default configurations

### External References
- [React Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [TypeScript Const Assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
- [Component Composition](https://react.dev/learn/passing-props-to-a-component)

---

## ✅ Final Checklist

Before marking this refactor as complete:

### Code Quality
- [ ] Zero TypeScript errors
- [ ] All console.log statements use consistent format
- [ ] No ESLint warnings
- [ ] Code follows PascalCase naming convention
- [ ] All functions have JSDoc comments

### Functionality
- [ ] Configuration loads successfully
- [ ] Defaults apply for new companies
- [ ] Toggle changes persist to database
- [ ] UI updates immediately after changes
- [ ] Mandatory fields cannot be disabled
- [ ] Error handling works correctly

### Testing
- [ ] Tested on iPad Air (2013) Safari 12
- [ ] Tested with empty database (new company)
- [ ] Tested with existing configuration
- [ ] Tested error scenarios (network failure, etc.)
- [ ] Tested rapid toggle changes

### Documentation
- [ ] Code comments explain complex logic
- [ ] Console logs aid debugging
- [ ] Success criteria all met
- [ ] Any issues documented

---

**Implementation Status**: Ready for Phase 1  
**Last Updated**: [Current Date]  
**Approved By**: [Awaiting approval after each phase]
