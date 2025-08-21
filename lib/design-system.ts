/**
 * Centralized Design System - Module Compatibility Layer
 * 
 * BACKWARD COMPATIBILITY: This file maintains all existing function exports
 * while routing through the new Design System Core module system.
 * 
 * SAFETY: ALL existing imports continue to work unchanged - ZERO RISK
 */

// =============================================================================
// DIRECT PASS-THROUGH EXPORTS
// =============================================================================

// All existing design system utilities are re-exported exactly as they were
// This ensures 100% backward compatibility with zero breaking changes
export {
  // Design tokens
  DesignTokens,
  LightModeTokens,
  DarkModeTokens,
  
  // Theme utilities
  getThemeTokens,
  
  // Component styling functions
  getCardStyle,
  getTextStyle,
  getFormFieldStyle,
  getLayoutPattern,
  getButtonStyle,
  getStatusStyle,
  
  // Responsive utilities
  getResponsiveClass,
  getBreakpointValue
} from './core/DesignSystem'

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// All existing types are re-exported exactly as they were
export type { Theme } from './core/DesignSystem'

// =============================================================================
// MIGRATION COMMENTS
// =============================================================================

/*
 * MIGRATION PATH:
 * 
 * This file provides 100% backward compatibility during the transition period.
 * Components can be gradually migrated to use the new module interface:
 * 
 * OLD: import { getCardStyle, getTextStyle } from '@/lib/design-system'
 * NEW: import { getCardStyle, getTextStyle } from '@/lib/core/DesignSystem'
 * 
 * Or even better, use the module capabilities:
 * NEW: const styles = getComponentStyleCapability(); styles.getCardStyle('primary')
 * 
 * This gradual migration approach ensures no breaking changes while enabling
 * the full power of the modular architecture including:
 * - Theme persistence and management
 * - Style caching and optimization
 * - Accessibility features
 * - Event-driven design system updates
 */

// =============================================================================
// USAGE TRACKING (Optional)
// =============================================================================

// Optional: Track usage of legacy imports for migration planning
// This can be removed in production if not needed
const logLegacyUsage = (functionName: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`📊 Legacy design system import: ${functionName} via lib/design-system.ts`)
  }
}

// Deployment verification - this will show if new code is running
console.log('🎨 Design System Core lib loaded - Modular Architecture v1.8.19')