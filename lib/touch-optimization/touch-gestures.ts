// Touch Gestures and Accessibility for iPad Air
// Advanced touch interactions and gesture recognition

export interface TouchGestureConfig {
  swipeThreshold: number // Minimum distance for swipe detection
  swipeVelocity: number // Minimum velocity for swipe
  longPressDelay: number // Delay for long press detection
  doubleTapDelay: number // Delay between taps for double tap
  pinchThreshold: number // Minimum scale change for pinch
}

export const GESTURE_CONFIG: TouchGestureConfig = {
  swipeThreshold: 50, // pixels
  swipeVelocity: 0.3, // pixels per ms
  longPressDelay: 500, // ms
  doubleTapDelay: 300, // ms
  pinchThreshold: 0.1 // scale difference
}

export type SwipeDirection = 'up' | 'down' | 'left' | 'right'
export type GestureEvent = 'swipe' | 'longpress' | 'doubletap' | 'pinch'

export interface TouchEventData {
  startX: number
  startY: number
  endX: number
  endY: number
  startTime: number
  endTime: number
  distance: number
  velocity: number
  direction?: SwipeDirection
  scale?: number
}

export interface GestureCallbacks {
  onSwipe?: (direction: SwipeDirection, data: TouchEventData) => void
  onLongPress?: (data: TouchEventData) => void
  onDoubleTap?: (data: TouchEventData) => void
  onPinch?: (scale: number, data: TouchEventData) => void
  onTouchStart?: (data: TouchEventData) => void
  onTouchEnd?: (data: TouchEventData) => void
}

export class TouchGestureRecognizer {
  private element: HTMLElement
  private callbacks: GestureCallbacks
  private config: TouchGestureConfig
  
  // Touch tracking state
  private touchStart: { x: number; y: number; time: number } | null = null
  private longPressTimer: NodeJS.Timeout | null = null
  private lastTap: number = 0
  private tapCount: number = 0
  
  // Multi-touch tracking
  private initialDistance: number = 0
  private initialScale: number = 1
  
  constructor(
    element: HTMLElement, 
    callbacks: GestureCallbacks, 
    config: Partial<TouchGestureConfig> = {}
  ) {
    this.element = element
    this.callbacks = callbacks
    this.config = { ...GESTURE_CONFIG, ...config }
    
    this.attachEventListeners()
  }

  private attachEventListeners(): void {
    // Single touch events
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false })
    
    // Prevent default behaviors that interfere with gestures
    this.element.style.touchAction = 'none'
  }

  private handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0]
    const now = Date.now()
    
    this.touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: now
    }
    
    // Handle multi-touch for pinch gestures
    if (e.touches.length === 2) {
      this.handlePinchStart(e)
    }
    
    // Start long press timer
    this.longPressTimer = setTimeout(() => {
      if (this.touchStart) {
        const data: TouchEventData = {
          startX: this.touchStart.x,
          startY: this.touchStart.y,
          endX: this.touchStart.x,
          endY: this.touchStart.y,
          startTime: this.touchStart.time,
          endTime: now,
          distance: 0,
          velocity: 0
        }
        
        this.callbacks.onLongPress?.(data)
        this.clearLongPressTimer()
      }
    }, this.config.longPressDelay)
    
    // Track for double tap
    const timeSinceLastTap = now - this.lastTap
    if (timeSinceLastTap < this.config.doubleTapDelay) {
      this.tapCount++
    } else {
      this.tapCount = 1
    }
    
    // Call touch start callback
    if (this.callbacks.onTouchStart && this.touchStart) {
      const data: TouchEventData = {
        startX: this.touchStart.x,
        startY: this.touchStart.y,
        endX: this.touchStart.x,
        endY: this.touchStart.y,
        startTime: this.touchStart.time,
        endTime: now,
        distance: 0,
        velocity: 0
      }
      this.callbacks.onTouchStart(data)
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    // Clear long press if finger moves
    if (this.longPressTimer) {
      this.clearLongPressTimer()
    }
    
    // Handle pinch gesture
    if (e.touches.length === 2) {
      this.handlePinchMove(e)
      e.preventDefault()
      return
    }
    
    // Regular touch move - we don't prevent default here to allow scrolling
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (!this.touchStart) return
    
    const touch = e.changedTouches[0]
    const endTime = Date.now()
    const deltaX = touch.clientX - this.touchStart.x
    const deltaY = touch.clientY - this.touchStart.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const duration = endTime - this.touchStart.time
    const velocity = duration > 0 ? distance / duration : 0
    
    const data: TouchEventData = {
      startX: this.touchStart.x,
      startY: this.touchStart.y,
      endX: touch.clientX,
      endY: touch.clientY,
      startTime: this.touchStart.time,
      endTime: endTime,
      distance,
      velocity
    }
    
    // Clear long press timer
    this.clearLongPressTimer()
    
    // Detect swipe gesture
    if (distance > this.config.swipeThreshold && velocity > this.config.swipeVelocity) {
      const direction = this.getSwipeDirection(deltaX, deltaY)
      data.direction = direction
      this.callbacks.onSwipe?.(direction, data)
    }
    // Detect tap/double tap
    else if (distance < 10) { // Small movement tolerance for taps
      this.lastTap = endTime
      
      if (this.tapCount >= 2) {
        this.callbacks.onDoubleTap?.(data)
        this.tapCount = 0
      }
    }
    
    // Call touch end callback
    this.callbacks.onTouchEnd?.(data)
    
    // Reset state
    this.touchStart = null
  }

  private handleTouchCancel(): void {
    this.clearLongPressTimer()
    this.touchStart = null
  }

  private handlePinchStart(e: TouchEvent): void {
    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    
    this.initialDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }

  private handlePinchMove(e: TouchEvent): void {
    if (this.initialDistance === 0) return
    
    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    
    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
    
    const scale = currentDistance / this.initialDistance
    const scaleChange = Math.abs(scale - this.initialScale)
    
    if (scaleChange > this.config.pinchThreshold && this.touchStart) {
      const data: TouchEventData = {
        startX: this.touchStart.x,
        startY: this.touchStart.y,
        endX: (touch1.clientX + touch2.clientX) / 2,
        endY: (touch1.clientY + touch2.clientY) / 2,
        startTime: this.touchStart.time,
        endTime: Date.now(),
        distance: 0,
        velocity: 0,
        scale
      }
      
      this.callbacks.onPinch?.(scale, data)
      this.initialScale = scale
    }
  }

  private getSwipeDirection(deltaX: number, deltaY: number): SwipeDirection {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left'
    } else {
      return deltaY > 0 ? 'down' : 'up'
    }
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
  }

  public updateCallbacks(newCallbacks: Partial<GestureCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...newCallbacks }
  }

  public destroy(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this))
    this.clearLongPressTimer()
  }
}

// React hook for touch gestures
export function useTouchGestures(
  ref: { current: HTMLElement | null },
  callbacks: GestureCallbacks,
  config?: Partial<TouchGestureConfig>
) {
  // Use useEffect equivalent for client-side
  const { useEffect } = require('react')
  
  useEffect(() => {
    if (typeof window === 'undefined') return // SSR guard
    if (!ref.current) return
    
    const recognizer = new TouchGestureRecognizer(ref.current, callbacks, config)
    
    return () => recognizer.destroy()
  }, [ref, callbacks, config])
}

// Accessibility enhancements for touch interactions
export class TouchAccessibility {
  
  /**
   * Add voice control support for touch elements
   */
  static enhanceForVoiceControl(element: HTMLElement, label: string): void {
    // Add ARIA labels for screen readers
    element.setAttribute('aria-label', label)
    element.setAttribute('role', element.tagName === 'BUTTON' ? 'button' : 'application')
    
    // Add voice command data attributes
    element.setAttribute('data-voice-command', label.toLowerCase())
    
    // Ensure proper focus management
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0')
    }
  }
  
  /**
   * Add haptic feedback for supported devices
   */
  static addHapticFeedback(element: HTMLElement, intensity: 'light' | 'medium' | 'heavy' = 'light'): void {
    element.addEventListener('touchstart', () => {
      // Check if device supports haptic feedback
      if ('vibrate' in navigator) {
        const duration = intensity === 'light' ? 10 : intensity === 'medium' ? 20 : 50
        navigator.vibrate(duration)
      }
    })
  }
  
  /**
   * Add keyboard navigation support for touch elements
   */
  static addKeyboardSupport(element: HTMLElement, callback: () => void): void {
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        callback()
      }
    })
  }
  
  /**
   * Announce changes to screen readers
   */
  static announceToScreenReader(message: string): void {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.style.position = 'absolute'
    announcement.style.left = '-10000px'
    announcement.style.width = '1px'
    announcement.style.height = '1px'
    announcement.style.overflow = 'hidden'
    
    document.body.appendChild(announcement)
    announcement.textContent = message
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }
  
  /**
   * Add focus indicators optimized for touch and keyboard users
   */
  static addAccessibleFocus(element: HTMLElement): void {
    element.classList.add('touch-focus')
    
    // Add custom focus styles
    const style = document.createElement('style')
    style.textContent = `
      .touch-focus:focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
        border-radius: 4px;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
      }
    `
    document.head.appendChild(style)
  }
}

// Utility functions for common gestures
export const GestureUtilities = {
  
  /**
   * Add swipe-to-dismiss functionality
   */
  addSwipeToDismiss(
    element: HTMLElement, 
    onDismiss: () => void,
    direction: SwipeDirection = 'up'
  ): () => void {
    const recognizer = new TouchGestureRecognizer(element, {
      onSwipe: (swipeDirection) => {
        if (swipeDirection === direction) {
          onDismiss()
        }
      }
    })
    
    return () => recognizer.destroy()
  },
  
  /**
   * Add pull-to-refresh functionality
   */
  addPullToRefresh(
    element: HTMLElement,
    onRefresh: () => void,
    threshold: number = 100
  ): () => void {
    let startY = 0
    let currentY = 0
    let isRefreshing = false
    
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshing) return
      
      currentY = e.touches[0].clientY
      const deltaY = currentY - startY
      
      if (deltaY > 0 && element.scrollTop === 0) {
        e.preventDefault()
        
        // Visual feedback
        element.style.transform = `translateY(${Math.min(deltaY * 0.5, threshold)}px)`
        element.style.opacity = `${Math.max(0.7, 1 - deltaY / 200)}`
      }
    }
    
    const handleTouchEnd = () => {
      const deltaY = currentY - startY
      
      if (deltaY > threshold && !isRefreshing) {
        isRefreshing = true
        onRefresh()
        
        // Reset after refresh
        setTimeout(() => {
          isRefreshing = false
          element.style.transform = ''
          element.style.opacity = ''
        }, 1000)
      } else {
        // Snap back
        element.style.transform = ''
        element.style.opacity = ''
      }
    }
    
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  },
  
  /**
   * Add pinch-to-zoom for images
   */
  addPinchToZoom(
    element: HTMLElement,
    options: { minScale?: number; maxScale?: number } = {}
  ): () => void {
    const { minScale = 0.5, maxScale = 3 } = options
    let currentScale = 1
    
    const recognizer = new TouchGestureRecognizer(element, {
      onPinch: (scale) => {
        const newScale = Math.min(Math.max(scale, minScale), maxScale)
        element.style.transform = `scale(${newScale})`
        currentScale = newScale
      }
    })
    
    // Double tap to reset zoom
    recognizer.updateCallbacks({
      onDoubleTap: () => {
        element.style.transform = 'scale(1)'
        currentScale = 1
      }
    })
    
    return () => recognizer.destroy()
  }
}