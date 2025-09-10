// Touch Target Optimization for iPad Air
// Ensures all interactive elements meet Apple Human Interface Guidelines

export interface TouchTargetConfig {
  minSize: number // Minimum touch target size (44px for iOS)
  spacing: number // Minimum spacing between targets
  feedbackDuration: number // Touch feedback animation duration
}

export const TOUCH_CONFIG: TouchTargetConfig = {
  minSize: 44, // Apple HIG minimum
  spacing: 8, // Minimum 8px between targets
  feedbackDuration: 150 // 150ms touch feedback
}

// Touch target size classes
export const TOUCH_CLASSES = {
  // Primary actions - large and prominent
  primary: {
    base: 'min-h-[48px] min-w-[120px] px-6 py-3 touch-manipulation',
    mobile: 'min-h-[52px] min-w-[140px] px-8 py-4',
    tablet: 'min-h-[44px] min-w-[120px] px-6 py-3'
  },
  
  // Secondary actions - standard size
  secondary: {
    base: 'min-h-[44px] min-w-[44px] p-3 touch-manipulation',
    mobile: 'min-h-[48px] min-w-[48px] p-4',
    tablet: 'min-h-[44px] min-w-[44px] p-3'
  },
  
  // Icon buttons - square targets
  icon: {
    base: 'min-h-[44px] min-w-[44px] p-2 touch-manipulation',
    mobile: 'min-h-[48px] min-w-[48px] p-3',
    tablet: 'min-h-[44px] min-w-[44px] p-2'
  },
  
  // List items - full width targets
  listItem: {
    base: 'min-h-[44px] w-full p-3 touch-manipulation',
    mobile: 'min-h-[52px] w-full p-4',
    tablet: 'min-h-[48px] w-full p-3'
  },

  // Form inputs - comfortable for typing
  input: {
    base: 'min-h-[44px] px-4 py-3 touch-manipulation',
    mobile: 'min-h-[52px] px-4 py-4',
    tablet: 'min-h-[48px] px-4 py-3'
  }
}

// Touch feedback animations
export const TOUCH_ANIMATIONS = {
  // Scale feedback for buttons
  scale: 'active:scale-95 transition-transform duration-150 ease-out',
  
  // Brightness feedback for cards/items
  brightness: 'active:brightness-95 transition-all duration-150 ease-out',
  
  // Background feedback for transparent elements
  background: 'active:bg-black/10 transition-colors duration-150 ease-out',
  
  // Combined feedback for primary buttons
  primary: 'active:scale-95 active:brightness-110 transition-all duration-150 ease-out',
  
  // Subtle feedback for navigation items
  nav: 'active:bg-white/10 active:scale-98 transition-all duration-100 ease-out'
}

// Device detection utilities
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export function isIPad(): boolean {
  if (typeof window === 'undefined') return false
  const userAgent = navigator.userAgent.toLowerCase()
  const isIPadUA = userAgent.includes('ipad') || 
                   (userAgent.includes('macintosh') && navigator.maxTouchPoints > 1)
  
  // Also check screen dimensions for iPad Air
  const screenWidth = window.screen.width
  const screenHeight = window.screen.height
  const isIPadDimensions = (screenWidth === 768 && screenHeight === 1024) ||
                          (screenWidth === 1024 && screenHeight === 768)
  
  return isIPadUA || isIPadDimensions
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024 || isIPad()) return 'tablet'
  return 'desktop'
}

// Touch target validation
export function validateTouchTarget(element: HTMLElement): {
  isValid: boolean
  issues: string[]
  recommendations: string[]
} {
  const rect = element.getBoundingClientRect()
  const issues: string[] = []
  const recommendations: string[] = []
  
  // Check minimum size
  if (rect.width < TOUCH_CONFIG.minSize) {
    issues.push(`Width ${Math.round(rect.width)}px is below minimum ${TOUCH_CONFIG.minSize}px`)
    recommendations.push('Increase width to meet touch target guidelines')
  }
  
  if (rect.height < TOUCH_CONFIG.minSize) {
    issues.push(`Height ${Math.round(rect.height)}px is below minimum ${TOUCH_CONFIG.minSize}px`)
    recommendations.push('Increase height to meet touch target guidelines')
  }
  
  // Check for touch-manipulation CSS
  const style = window.getComputedStyle(element)
  if (!style.touchAction.includes('manipulation')) {
    issues.push('Missing touch-action: manipulation for better touch response')
    recommendations.push('Add touch-manipulation class or CSS property')
  }
  
  // Check spacing from nearby interactive elements
  const interactiveSelector = 'button, a, input, [role="button"], [tabindex]'
  const nearbyElements = Array.from(document.querySelectorAll(interactiveSelector))
    .filter(el => el !== element && el.getBoundingClientRect().width > 0)
  
  for (const nearby of nearbyElements) {
    const nearbyRect = nearby.getBoundingClientRect()
    const distance = Math.min(
      Math.abs(rect.left - nearbyRect.right),
      Math.abs(rect.right - nearbyRect.left),
      Math.abs(rect.top - nearbyRect.bottom),
      Math.abs(rect.bottom - nearbyRect.top)
    )
    
    if (distance < TOUCH_CONFIG.spacing) {
      issues.push(`Too close to nearby interactive element (${Math.round(distance)}px)`)
      recommendations.push('Increase spacing between interactive elements')
      break // Only report first spacing issue
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  }
}

// Touch target enhancement utilities
export function enhanceElementForTouch(element: HTMLElement, type: keyof typeof TOUCH_CLASSES) {
  const deviceType = getDeviceType()
  const classes = TOUCH_CLASSES[type]
  
  // Apply appropriate size classes
  element.className += ` ${classes.base}`
  
  if (deviceType === 'mobile') {
    element.className += ` ${classes.mobile}`
  } else if (deviceType === 'tablet') {
    element.className += ` ${classes.tablet}`
  }
  
  // Add touch feedback
  if (type === 'primary') {
    element.className += ` ${TOUCH_ANIMATIONS.primary}`
  } else if (type === 'icon' || type === 'secondary') {
    element.className += ` ${TOUCH_ANIMATIONS.scale}`
  } else if (type === 'listItem') {
    element.className += ` ${TOUCH_ANIMATIONS.brightness}`
  }
  
  // Ensure proper touch-action
  element.style.touchAction = 'manipulation'
  
  // Add accessibility enhancements
  if (!element.getAttribute('role') && element.tagName !== 'BUTTON' && element.tagName !== 'A') {
    element.setAttribute('role', 'button')
  }
  
  if (!element.getAttribute('tabindex')) {
    element.setAttribute('tabindex', '0')
  }
}

// Automatic touch target scanning and enhancement
export function scanAndEnhanceTouchTargets() {
  if (!isTouchDevice()) return
  
  console.log('🔍 Scanning for touch target improvements...')
  
  const selectors = [
    'button:not([data-touch-enhanced])',
    'a:not([data-touch-enhanced])', 
    '[role="button"]:not([data-touch-enhanced])',
    'input[type="submit"]:not([data-touch-enhanced])',
    'input[type="button"]:not([data-touch-enhanced])'
  ]
  
  const elements = document.querySelectorAll(selectors.join(', ')) as NodeListOf<HTMLElement>
  let enhancedCount = 0
  
  elements.forEach(element => {
    const validation = validateTouchTarget(element)
    
    if (!validation.isValid) {
      // Determine appropriate enhancement type
      let enhancementType: keyof typeof TOUCH_CLASSES = 'secondary'
      
      if (element.classList.contains('primary') || element.getAttribute('data-primary')) {
        enhancementType = 'primary'
      } else if (element.tagName === 'INPUT') {
        enhancementType = 'input'
      } else if (element.getAttribute('role') === 'listitem' || element.closest('li')) {
        enhancementType = 'listItem'
      } else if (element.querySelector('svg') || element.classList.contains('icon')) {
        enhancementType = 'icon'
      }
      
      enhanceElementForTouch(element, enhancementType)
      element.setAttribute('data-touch-enhanced', 'true')
      enhancedCount++
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✨ Enhanced ${element.tagName.toLowerCase()}:`, validation.issues)
      }
    }
  })
  
  if (enhancedCount > 0) {
    console.log(`✅ Enhanced ${enhancedCount} touch targets for better accessibility`)
  }
}

// React hook for touch optimization
export function useTouchOptimization() {
  const deviceType = getDeviceType()
  const isTouchEnabled = isTouchDevice()
  const isTablet = deviceType === 'tablet'
  
  // Auto-enhance on mount
  if (typeof window !== 'undefined') {
    setTimeout(() => scanAndEnhanceTouchTargets(), 100)
  }
  
  return {
    deviceType,
    isTouchEnabled,
    isTablet,
    isIPad: isIPad(),
    touchClasses: TOUCH_CLASSES,
    touchAnimations: TOUCH_ANIMATIONS,
    enhanceElement: enhanceElementForTouch,
    validateTarget: validateTouchTarget
  }
}

// CSS custom properties for dynamic sizing
export const TOUCH_CSS_VARS = `
  :root {
    --touch-target-min: ${TOUCH_CONFIG.minSize}px;
    --touch-spacing: ${TOUCH_CONFIG.spacing}px;
    --touch-feedback-duration: ${TOUCH_CONFIG.feedbackDuration}ms;
  }
  
  @media (max-width: 768px) {
    :root {
      --touch-target-min: 48px;
      --touch-spacing: 12px;
    }
  }
  
  .touch-target {
    min-height: var(--touch-target-min);
    min-width: var(--touch-target-min);
    touch-action: manipulation;
  }
  
  .touch-feedback {
    transition: all var(--touch-feedback-duration) ease-out;
  }
  
  .touch-feedback:active {
    transform: scale(0.95);
    filter: brightness(1.1);
  }
`