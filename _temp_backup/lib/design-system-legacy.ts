/**
 * Centralized Design System
 * Single source of truth for all styling and typography across the application
 * 
 * Usage:
 * import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'
 */

// =============================================================================
// DESIGN TOKENS - Core design values
// =============================================================================

export const DesignTokens = {
  // Color System
  colors: {
    // Glass Morphism Effects
    glass: {
      // Card backgrounds
      cardPrimary: 'bg-white/15',           // Main content cards
      cardSecondary: 'bg-white/10',         // Secondary cards  
      cardSolid: 'bg-white/90',            // Form inputs
      cardSidebar: 'bg-white/20',          // Quick actions, sidebar items
      
      // Borders
      borderLight: 'border-white/20',       // Standard borders
      borderMedium: 'border-white/30',      // Input borders
      borderStrong: 'border-white/40',      // Emphasized borders
      
      // Overlays
      overlayLight: 'bg-black/20',          // Light overlay
      overlayMedium: 'bg-black/40',         // Header overlays
      overlayStrong: 'bg-black/70',         // Navigation containers
    },
    
    // Text Colors
    text: {
      // On glass/dark backgrounds
      onGlass: 'text-white',
      onGlassSecondary: 'text-white/90',
      onGlassMuted: 'text-white/70',
      
      // On solid/light backgrounds  
      onSolid: 'text-black',
      onSolidSecondary: 'text-gray-800',
      onSolidMuted: 'text-gray-600',
      
      // Navigation specific
      navActive: 'text-black',
      navInactive: 'text-black/80',
      navHover: 'text-black',
      
      // Form elements
      formLabel: 'text-white',
      formInput: 'text-black',
      formPlaceholder: 'placeholder-gray-600',
    },
    
    // Status Colors
    status: {
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700', 
      error: 'bg-red-100 text-red-700',
      info: 'bg-blue-100 text-blue-700',
    }
  },
  
  // Typography System
  typography: {
    // Headings
    pageTitle: 'text-2xl font-bold',
    cardTitle: 'text-lg font-semibold', 
    sectionTitle: 'text-xl font-semibold',
    
    // Body Text
    body: 'text-sm font-medium',
    bodyLarge: 'text-base font-medium',
    bodySmall: 'text-xs font-medium',
    
    // Form Elements
    label: 'text-sm font-medium',
    input: 'font-sans text-sm',
    
    // Special
    meta: 'text-xs',
    version: 'text-xs font-medium',
  },
  
  // Spacing System
  spacing: {
    cardPadding: 'p-6',
    cardPaddingLarge: 'p-8', 
    formSpacing: 'space-y-6',
    gridGap: 'gap-6',
    sectionMargin: 'mb-8',
  },
  
  // Effects System
  effects: {
    blur: 'backdrop-blur-lg',
    blurLight: 'backdrop-blur-sm',
    
    shadow: 'shadow-lg',
    shadowStrong: 'shadow-2xl',
    
    transition: 'transition-all duration-200',
    
    textShadow: 'drop-shadow-lg',
    textShadowLight: 'drop-shadow-md',
  },
  
  // Layout System  
  layout: {
    rounded: 'rounded-2xl',
    roundedLarge: 'rounded-3xl',
    roundedPill: 'rounded-full',
    
    maxWidth: 'max-w-7xl',
    container: 'mx-auto px-4 sm:px-6 lg:px-8',
  }
}

// =============================================================================
// THEME SYSTEM - Light and Dark mode variants (MUST BE BEFORE UTILITY FUNCTIONS)
// =============================================================================

export type Theme = 'light' | 'dark'

export const LightModeTokens = {
  colors: {
    glass: {
      // Light mode uses solid backgrounds with subtle opacity
      cardPrimary: 'bg-white/95',
      cardSecondary: 'bg-gray-50/90', 
      cardSolid: 'bg-white',
      cardSidebar: 'bg-gray-100/80',
      
      // Light mode borders
      borderLight: 'border-gray-200',
      borderMedium: 'border-gray-300',
      borderStrong: 'border-gray-400',
      
      // Light mode overlays
      overlayLight: 'bg-white/50',
      overlayMedium: 'bg-white/80',
      overlayStrong: 'bg-white/95',
    },
    
    text: {
      // On light backgrounds
      onGlass: 'text-gray-900',
      onGlassSecondary: 'text-gray-700',
      onGlassMuted: 'text-gray-500',
      
      onSolid: 'text-gray-900',
      onSolidSecondary: 'text-gray-700',
      onSolidMuted: 'text-gray-500',
      
      navActive: 'text-blue-700',
      navInactive: 'text-gray-600',
      navHover: 'text-blue-600',
      
      formLabel: 'text-gray-900',
      formInput: 'text-gray-900',
      formPlaceholder: 'placeholder-gray-400',
    },
    
    status: {
      success: 'bg-green-50 text-green-800 border-green-200',
      warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      error: 'bg-red-50 text-red-800 border-red-200',
      info: 'bg-blue-50 text-blue-800 border-blue-200',
    }
  },
  
  effects: {
    blur: '',  // No blur needed in light mode
    blurLight: '',
    shadow: 'shadow-sm',
    shadowStrong: 'shadow-lg',
    transition: 'transition-all duration-200',
    textShadow: '',
    textShadowLight: '',
  }
}

export const DarkModeTokens = {
  colors: DesignTokens.colors,  // Use existing dark mode colors
  effects: DesignTokens.effects, // Use existing effects
}

// Theme-aware design tokens
export const getThemeTokens = (theme: Theme = 'dark') => {
  return theme === 'light' ? {
    colors: LightModeTokens.colors,
    effects: LightModeTokens.effects,
    typography: DesignTokens.typography,
    spacing: DesignTokens.spacing,
    layout: DesignTokens.layout,
  } : DesignTokens
}

// =============================================================================
// UTILITY FUNCTIONS - Generate complete styling classes
// =============================================================================

/**
 * Generate card styling based on variant and theme
 */
export const getCardStyle = (variant: 'primary' | 'secondary' | 'sidebar' | 'form' = 'primary', theme: Theme = 'dark') => {
  const tokens = getThemeTokens(theme)
  const base = `${tokens.effects.blur} ${tokens.layout.rounded} ${tokens.spacing.cardPadding} ${tokens.effects.shadow}`
  
  switch (variant) {
    case 'primary':
      return `${tokens.colors.glass.cardPrimary} ${tokens.colors.glass.borderLight} border ${base}`
    case 'secondary': 
      return `${tokens.colors.glass.cardSecondary} ${tokens.colors.glass.borderLight} border ${base}`
    case 'sidebar':
      return `${tokens.colors.glass.cardSidebar} ${tokens.colors.glass.borderLight} border ${base}`
    case 'form':
      return `${tokens.colors.glass.cardPrimary} ${tokens.colors.glass.borderLight} border ${tokens.layout.roundedLarge} ${tokens.spacing.cardPaddingLarge} ${tokens.effects.shadowStrong} ${tokens.effects.blur}`
    default:
      return `${tokens.colors.glass.cardPrimary} ${tokens.colors.glass.borderLight} border ${base}`
  }
}

/**
 * Generate text styling based on type and theme
 */
export const getTextStyle = (type: 'pageTitle' | 'sectionTitle' | 'cardTitle' | 'body' | 'bodyLarge' | 'bodySmall' | 'label' | 'input' | 'meta' | 'version' | 'caption' | 'bodySecondary' | 'inputLabel', theme: Theme = 'dark') => {
  const tokens = getThemeTokens(theme)
  
  switch (type) {
    case 'pageTitle': return tokens.typography.pageTitle
    case 'sectionTitle': return tokens.typography.sectionTitle
    case 'cardTitle': return tokens.typography.cardTitle
    case 'body': return tokens.typography.body
    case 'bodyLarge': return tokens.typography.bodyLarge
    case 'bodySmall': return tokens.typography.bodySmall
    case 'label': return tokens.typography.label
    case 'input': return tokens.typography.input
    case 'meta': return tokens.typography.meta
    case 'version': return tokens.typography.version
    case 'caption': return tokens.typography.meta
    case 'bodySecondary': return tokens.typography.body
    case 'inputLabel': return tokens.typography.label
    default: return tokens.typography.body
  }
}

/**
 * Generate form field styling with theme support
 */
export const getFormFieldStyle = (type: 'input' | 'select' | 'textarea' = 'input', theme: Theme = 'dark') => {
  const tokens = getThemeTokens(theme)
  const base = `w-full px-4 py-3 ${tokens.colors.glass.cardSolid} ${tokens.colors.glass.borderMedium} border ${tokens.layout.rounded} ${tokens.colors.text.formInput} ${tokens.colors.text.formPlaceholder} ${tokens.effects.blurLight} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${tokens.typography.input} ${tokens.effects.transition}`
  
  return base
}

/**
 * Generate navigation pill styling with theme support
 */
export const getNavPillStyle = (isActive: boolean = false, theme: Theme = 'dark') => {
  const tokens = getThemeTokens(theme)
  const base = `px-4 py-2 ${tokens.layout.roundedPill} ${tokens.typography.body} ${tokens.effects.transition}`
  
  if (isActive) {
    const activeBg = theme === 'light' ? 'bg-blue-100' : 'bg-white'
    return `${base} ${activeBg} ${tokens.colors.text.navActive} ${tokens.effects.blurLight} ${tokens.effects.shadow}`
  } else {
    const hoverBg = theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/25'
    return `${base} ${tokens.colors.text.navInactive} hover:${tokens.colors.text.navHover} ${hoverBg}`
  }
}

/**
 * Generate page header styling  
 */
export const getPageHeaderStyle = () => {
  return `${DesignTokens.layout.container} py-6`
}

/**
 * Generate header title styling
 */
export const getHeaderTitleStyle = () => {
  return `${DesignTokens.typography.pageTitle} ${DesignTokens.colors.text.onGlass} ${DesignTokens.effects.textShadow}`
}

/**
 * Generate header subtitle styling
 */
export const getHeaderSubtitleStyle = () => {
  return `${DesignTokens.typography.body} ${DesignTokens.colors.text.onGlassSecondary} ${DesignTokens.effects.textShadowLight}`
}

// =============================================================================
// COMPONENT PATTERNS - Complete component styling
// =============================================================================

export const ComponentPatterns = {
  // Navigation
  navContainer: `flex ${DesignTokens.colors.glass.overlayStrong} ${DesignTokens.effects.blurLight} ${DesignTokens.layout.roundedPill} p-1 space-x-1 ${DesignTokens.colors.glass.borderStrong} border ${DesignTokens.effects.shadow}`,
  
  // Cards
  businessInfoCard: getCardStyle('primary'),
  quickActionCard: getCardStyle('sidebar'),
  formCard: getCardStyle('form'),
  
  // Headers
  pageHeader: getPageHeaderStyle(),
  pageTitle: getHeaderTitleStyle(),
  pageSubtitle: getHeaderSubtitleStyle(),
  
  // Form Elements
  formLabel: `block ${DesignTokens.typography.label} ${DesignTokens.colors.text.formLabel} mb-2`,
  formInput: getFormFieldStyle('input'),
  formSelect: getFormFieldStyle('select'),
  
  // Layout
  mainContainer: `min-h-screen relative overflow-hidden`,
  contentWrapper: `${DesignTokens.layout.maxWidth} ${DesignTokens.layout.container} py-8`,
  twoColumnGrid: `grid grid-cols-1 lg:grid-cols-4 ${DesignTokens.spacing.gridGap}`,
}

// =============================================================================
// THEME VARIANTS - Different visual themes  
// =============================================================================

export const ThemeVariants = {
  dark: {
    name: 'Dark Mode',
    description: 'Glass morphism with semi-transparent cards and blur effects',
    tokens: DarkModeTokens,
  },
  
  light: {
    name: 'Light Mode',
    description: 'Clean solid backgrounds with subtle shadows',
    tokens: LightModeTokens,
  }
}

export default DesignTokens