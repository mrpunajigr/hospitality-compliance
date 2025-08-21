/**
 * Design System Core Module - Helper Functions
 * Extracted from lib/design-system.ts - maintains identical function signatures
 * 
 * SAFETY: This preserves ALL existing functionality - ZERO RISK to existing code
 */

import type { 
  Theme, 
   
  ColorTokens, 
  CardVariant, 
  TextVariant, 
  CardStyleProps, 
  TextStyleProps 
} from './DesignSystemTypes'

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
// THEME SYSTEM - Light and Dark mode variants
// =============================================================================

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

// =============================================================================
// THEME UTILITIES
// =============================================================================

// Theme-aware design tokens
export const getThemeTokens = (theme: Theme = 'dark'): any => {
  return theme === 'light' ? {
    colors: LightModeTokens.colors,
    effects: LightModeTokens.effects,
    typography: DesignTokens.typography,
    spacing: DesignTokens.spacing,
    layout: DesignTokens.layout,
  } : DesignTokens
}

// =============================================================================
// UTILITY FUNCTIONS - Component Styling
// =============================================================================

/**
 * Get complete styling for card components
 * @param variant - Card variant type
 * @param theme - Theme preference (optional, defaults to dark)
 * @returns Complete Tailwind class string
 */
export const getCardStyle = (variant: CardVariant = 'primary', theme: Theme = 'dark'): string => {
  const tokens = getThemeTokens(theme)
  
  const baseStyles = [
    tokens.layout.rounded,
    tokens.effects.blur,
    tokens.effects.shadow,
    tokens.effects.transition,
    'border',
    tokens.spacing.cardPadding
  ]
  
  const variantStyles: Record<CardVariant, string[]> = {
    primary: [
      tokens.colors.glass.cardPrimary,
      tokens.colors.glass.borderLight
    ],
    secondary: [
      tokens.colors.glass.cardSecondary,
      tokens.colors.glass.borderLight
    ],
    form: [
      tokens.colors.glass.cardSolid,
      tokens.colors.glass.borderMedium
    ],
    sidebar: [
      tokens.colors.glass.cardSidebar,
      tokens.colors.glass.borderLight
    ],
    solid: [
      'bg-white',
      'border-gray-200'
    ]
  }
  
  return [...baseStyles, ...variantStyles[variant]].join(' ')
}

/**
 * Get typography styling for text elements
 * @param variant - Text variant type
 * @param theme - Theme preference (optional, defaults to dark)
 * @returns Complete Tailwind class string
 */
export const getTextStyle = (variant: TextVariant, theme: Theme = 'dark'): string => {
  const tokens = getThemeTokens(theme)
  
  const variantStyles: Record<TextVariant, string> = {
    pageTitle: `${tokens.typography.pageTitle} ${tokens.colors.text.onGlass}`,
    cardTitle: `${tokens.typography.cardTitle} ${tokens.colors.text.onGlass}`,
    sectionTitle: `${tokens.typography.sectionTitle} ${tokens.colors.text.onGlass}`,
    body: `${tokens.typography.body} ${tokens.colors.text.onGlassSecondary}`,
    bodyLarge: `${tokens.typography.bodyLarge} ${tokens.colors.text.onGlassSecondary}`,
    bodySmall: `${tokens.typography.bodySmall} ${tokens.colors.text.onGlassMuted}`,
    label: `${tokens.typography.label} ${tokens.colors.text.formLabel}`,
    meta: `${tokens.typography.meta} ${tokens.colors.text.onGlassMuted}`,
    version: `${tokens.typography.version} ${tokens.colors.text.onGlassMuted}`
  }
  
  return variantStyles[variant] || variantStyles.body
}

/**
 * Get form field styling
 * @param variant - Form field variant (optional, defaults to 'default')
 * @param theme - Theme preference (optional, defaults to dark)
 * @returns Complete Tailwind class string
 */
export const getFormFieldStyle = (variant: 'default' | 'error' | 'success' = 'default', theme: Theme = 'dark'): string => {
  const tokens = getThemeTokens(theme)
  
  const baseStyles = [
    'w-full',
    'px-4', 'py-3',
    tokens.layout.rounded,
    'border',
    tokens.effects.transition,
    tokens.colors.text.formInput,
    tokens.colors.text.formPlaceholder,
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-blue-500',
    'focus:border-transparent'
  ]
  
  const variantStyles = {
    default: [
      tokens.colors.glass.cardSolid,
      tokens.colors.glass.borderMedium
    ],
    error: [
      tokens.colors.glass.cardSolid,
      'border-red-500',
      'focus:ring-red-500'
    ],
    success: [
      tokens.colors.glass.cardSolid,
      'border-green-500',
      'focus:ring-green-500'
    ]
  }
  
  return [...baseStyles, ...variantStyles[variant]].join(' ')
}

/**
 * Get layout pattern styling
 * @param pattern - Layout pattern type
 * @returns Complete Tailwind class string
 */
export const getLayoutPattern = (pattern: 'container' | 'grid' | 'stack' | 'cluster'): string => {
  const patterns = {
    container: `${DesignTokens.layout.container} ${DesignTokens.layout.maxWidth}`,
    grid: `grid ${DesignTokens.spacing.gridGap}`,
    stack: DesignTokens.spacing.formSpacing,
    cluster: 'flex flex-wrap gap-2'
  }
  
  return patterns[pattern] || patterns.container
}

/**
 * Get button styling
 * @param variant - Button variant type
 * @param theme - Theme preference (optional, defaults to dark)
 * @returns Complete Tailwind class string
 */
export const getButtonStyle = (variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary', theme: Theme = 'dark'): string => {
  const tokens = getThemeTokens(theme)
  
  const baseStyles = [
    'inline-flex', 'items-center', 'justify-center',
    'px-4', 'py-2',
    tokens.typography.body,
    tokens.layout.rounded,
    tokens.effects.transition,
    'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2',
    'disabled:opacity-50', 'disabled:cursor-not-allowed'
  ]
  
  const variantStyles = {
    primary: [
      'bg-blue-600', 'hover:bg-blue-700',
      'text-white',
      'focus:ring-blue-500'
    ],
    secondary: [
      tokens.colors.glass.cardSecondary,
      tokens.colors.glass.borderLight,
      'border',
      tokens.colors.text.onGlass,
      'hover:' + tokens.colors.glass.cardPrimary
    ],
    outline: [
      'border-2', 'border-blue-600',
      'text-blue-600', 'hover:bg-blue-600', 'hover:text-white',
      'focus:ring-blue-500'
    ],
    ghost: [
      'text-gray-600', 'hover:text-gray-900',
      'hover:bg-gray-100',
      'focus:ring-gray-500'
    ],
    danger: [
      'bg-red-600', 'hover:bg-red-700',
      'text-white',
      'focus:ring-red-500'
    ]
  }
  
  return [...baseStyles, ...variantStyles[variant]].join(' ')
}

/**
 * Get status styling
 * @param variant - Status variant type
 * @param theme - Theme preference (optional, defaults to dark)
 * @returns Complete Tailwind class string
 */
export const getStatusStyle = (variant: 'success' | 'warning' | 'error' | 'info', theme: Theme = 'dark'): string => {
  const tokens = getThemeTokens(theme)
  
  const baseStyles = [
    'px-3', 'py-1',
    tokens.layout.rounded,
    tokens.typography.bodySmall,
    'border'
  ]
  
  return [...baseStyles, tokens.colors.status[variant]].join(' ')
}

// =============================================================================
// RESPONSIVE UTILITIES
// =============================================================================

/**
 * Get responsive class with breakpoint prefix
 * @param breakpoint - Responsive breakpoint
 * @param classes - Classes to apply at breakpoint
 * @returns Responsive class string
 */
export const getResponsiveClass = (breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl', classes: string): string => {
  return `${breakpoint}:${classes}`
}

/**
 * Get breakpoint value in pixels
 * @param breakpoint - Responsive breakpoint
 * @returns Breakpoint value in pixels
 */
export const getBreakpointValue = (breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'): number => {
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }
  
  return breakpoints[breakpoint]
}