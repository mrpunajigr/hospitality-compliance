/**
 * Design System Core Module - Type Definitions
 * Centralized type definitions for design system
 * 
 * SAFETY: This creates NEW type definitions - ZERO RISK to existing code
 */

// =============================================================================
// THEME SYSTEM
// =============================================================================

export type Theme = 'light' | 'dark'
export type ResponsiveBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// =============================================================================
// DESIGN TOKENS
// =============================================================================

export interface ColorTokens {
  glass: {
    cardPrimary: string
    cardSecondary: string
    cardSolid: string
    cardSidebar: string
    borderLight: string
    borderMedium: string
    borderStrong: string
    overlayLight: string
    overlayMedium: string
    overlayStrong: string
  }
  text: {
    onGlass: string
    onGlassSecondary: string
    onGlassMuted: string
    onSolid: string
    onSolidSecondary: string
    onSolidMuted: string
    navActive: string
    navInactive: string
    navHover: string
    formLabel: string
    formInput: string
    formPlaceholder: string
  }
  status: {
    success: string
    warning: string
    error: string
    info: string
  }
}

export interface TypographyTokens {
  pageTitle: string
  cardTitle: string
  sectionTitle: string
  body: string
  bodyLarge: string
  bodySmall: string
  label: string
  input: string
  meta: string
  version: string
}

export interface SpacingTokens {
  cardPadding: string
  cardPaddingLarge: string
  formSpacing: string
  gridGap: string
  sectionMargin: string
}

export interface EffectsTokens {
  blur: string
  blurLight: string
  shadow: string
  shadowStrong: string
  transition: string
  textShadow: string
  textShadowLight: string
}

export interface LayoutTokens {
  rounded: string
  roundedLarge: string
  roundedPill: string
  maxWidth: string
  container: string
}

export interface DesignTokens {
  colors: ColorTokens
  typography: TypographyTokens
  spacing: SpacingTokens
  effects: EffectsTokens
  layout: LayoutTokens
}

// =============================================================================
// COMPONENT VARIANTS
// =============================================================================

export type CardVariant = 'primary' | 'secondary' | 'form' | 'sidebar' | 'solid'
export type TextVariant = 'pageTitle' | 'cardTitle' | 'sectionTitle' | 'body' | 'bodyLarge' | 'bodySmall' | 'label' | 'meta' | 'version'
export type StatusVariant = 'success' | 'warning' | 'error' | 'info'
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type FormFieldVariant = 'default' | 'error' | 'success'

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

export interface DesignSystemCoreConfig {
  // Theme settings
  defaultTheme: Theme
  enableThemeSwitching: boolean
  persistTheme: boolean
  
  // Responsive settings
  enableResponsiveDesign: boolean
  breakpoints: Record<ResponsiveBreakpoint, number>
  
  // Animation settings
  enableAnimations: boolean
  defaultTransitionDuration: number
  enableReducedMotion: boolean
  
  // Typography settings
  fontLoadingStrategy: 'swap' | 'block' | 'fallback'
  enableCustomFonts: boolean
  baseFontSize: number
  
  // Accessibility settings
  enableHighContrast: boolean
  enableLargeText: boolean
  enableFocusRing: boolean
  
  // Performance settings
  enableCSSOptimization: boolean
  enableComponentLazyLoad: boolean
  purgeUnusedStyles: boolean
}

// =============================================================================
// COMPONENT INTERFACES
// =============================================================================

export interface ComponentStyleProps {
  variant?: string
  size?: 'sm' | 'md' | 'lg'
  theme?: Theme
  className?: string
  disabled?: boolean
  loading?: boolean
}

export interface CardStyleProps extends ComponentStyleProps {
  variant?: CardVariant
  interactive?: boolean
  elevated?: boolean
}

export interface TextStyleProps extends ComponentStyleProps {
  variant?: TextVariant
  color?: 'default' | 'muted' | 'emphasis'
  align?: 'left' | 'center' | 'right'
}

export interface ButtonStyleProps extends ComponentStyleProps {
  variant?: ButtonVariant
  fullWidth?: boolean
  icon?: boolean
}

export interface FormFieldStyleProps extends ComponentStyleProps {
  variant?: FormFieldVariant
  required?: boolean
  multiline?: boolean
}

// =============================================================================
// CAPABILITY INTERFACES
// =============================================================================

export interface DesignTokenCapability {
  // Token access
  getTokens(theme?: Theme): DesignTokens
  getColorTokens(theme?: Theme): ColorTokens
  getTypographyTokens(): TypographyTokens
  getSpacingTokens(): SpacingTokens
  getEffectsTokens(theme?: Theme): EffectsTokens
  getLayoutTokens(): LayoutTokens
  
  // Theme management
  setTheme(theme: Theme): void
  getTheme(): Theme
  toggleTheme(): void
  
  // Custom tokens
  registerCustomTokens(tokens: Partial<DesignTokens>): void
  getCustomTokens(): Partial<DesignTokens>
}

export interface ComponentStyleCapability {
  // Component styling
  getCardStyle(variant: CardVariant, props?: CardStyleProps): string
  getTextStyle(variant: TextVariant, props?: TextStyleProps): string
  getButtonStyle(variant: ButtonVariant, props?: ButtonStyleProps): string
  getFormFieldStyle(variant?: FormFieldVariant, props?: FormFieldStyleProps): string
  
  // Layout patterns
  getLayoutPattern(pattern: 'container' | 'grid' | 'stack' | 'cluster'): string
  getSpacingPattern(pattern: 'form' | 'card' | 'section'): string
  
  // Responsive utilities
  getResponsiveClass(breakpoint: ResponsiveBreakpoint, classes: string): string
  getBreakpointValue(breakpoint: ResponsiveBreakpoint): number
}

export interface ThemeManagerCapability {
  // Theme operations
  getCurrentTheme(): Theme
  setTheme(theme: Theme): Promise<void>
  getAvailableThemes(): Theme[]
  
  // Theme persistence
  saveThemePreference(theme: Theme): Promise<void>
  loadThemePreference(): Promise<Theme | null>
  
  // Theme switching
  enableAutoTheme(): void
  disableAutoTheme(): void
  isAutoThemeEnabled(): boolean
  
  // System theme detection
  getSystemTheme(): Theme
  watchSystemTheme(callback: (theme: Theme) => void): () => void
}

export interface AccessibilityCapability {
  // Accessibility features
  enableHighContrast(): void
  disableHighContrast(): void
  isHighContrastEnabled(): boolean
  
  // Text scaling
  setTextScale(scale: number): void
  getTextScale(): number
  resetTextScale(): void
  
  // Motion preferences
  enableReducedMotion(): void
  disableReducedMotion(): void
  isReducedMotionEnabled(): boolean
  
  // Focus management
  enableFocusRing(): void
  disableFocusRing(): void
  isFocusRingEnabled(): boolean
  
  // Color contrast validation
  validateColorContrast(foreground: string, background: string): boolean
  getContrastRatio(foreground: string, background: string): number
}

// =============================================================================
// MODULE EVENTS
// =============================================================================

export interface DesignSystemEvents {
  // Theme events
  'theme:changed': { theme: Theme; previousTheme: Theme }
  'theme:system-changed': { theme: Theme }
  'theme:preference-saved': { theme: Theme }
  
  // Component events
  'component:style-generated': { component: string; variant: string; classes: string }
  'component:style-cached': { component: string; variant: string; cacheKey: string }
  
  // Token events
  'tokens:custom-registered': { tokens: Partial<DesignTokens> }
  'tokens:theme-switched': { theme: Theme; tokens: DesignTokens }
  
  // Accessibility events
  'accessibility:high-contrast-toggled': { enabled: boolean }
  'accessibility:text-scale-changed': { scale: number }
  'accessibility:reduced-motion-toggled': { enabled: boolean }
  'accessibility:focus-ring-toggled': { enabled: boolean }
  
  // Performance events
  'performance:style-cache-hit': { component: string; cacheKey: string }
  'performance:style-cache-miss': { component: string; cacheKey: string }
  'performance:css-optimized': { originalSize: number; optimizedSize: number }
}

// =============================================================================
// STYLE GENERATION
// =============================================================================

export interface StyleGenerationOptions {
  theme?: Theme
  responsive?: boolean
  optimize?: boolean
  cacheKey?: string
}

export interface GeneratedStyle {
  classes: string
  css?: string
  tokens: Partial<DesignTokens>
  theme: Theme
  cached: boolean
}

export interface StyleCache {
  get(key: string): GeneratedStyle | null
  set(key: string, style: GeneratedStyle): void
  clear(): void
  size(): number
  keys(): string[]
}