'use client'

// Enhanced Touch Modal for iPad Air
// Optimized for touch interactions, gestures, and accessibility

import { useState, useEffect, useRef, ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface TouchModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'
  allowSwipeClose?: boolean
  showCloseButton?: boolean
  preventBackdropClose?: boolean
  className?: string
}

export default function TouchModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  allowSwipeClose = true,
  showCloseButton = true,
  preventBackdropClose = false,
  className = ''
}: TouchModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  // Size configurations optimized for iPad Air
  const sizeClasses = {
    sm: 'max-w-md mx-4',
    md: 'max-w-2xl mx-4', 
    lg: 'max-w-4xl mx-4',
    xl: 'max-w-6xl mx-4',
    fullscreen: 'w-full h-full'
  }

  // Handle modal open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = 'hidden'
      // Focus management for accessibility
      setTimeout(() => {
        modalRef.current?.focus()
      }, 100)
    } else {
      document.body.style.overflow = ''
      setCurrentY(0)
      setIsDragging(false)
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Touch event handlers for swipe-to-close
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!allowSwipeClose) return
    
    const touch = e.touches[0]
    setStartY(touch.clientY)
    setCurrentY(0)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!allowSwipeClose || !isDragging) return

    const touch = e.touches[0]
    const deltaY = touch.clientY - startY
    
    // Only allow downward swipes (positive deltaY)
    if (deltaY > 0) {
      setCurrentY(deltaY)
      
      // Add resistance at larger distances
      const resistance = Math.max(0, 1 - deltaY / 200)
      if (modalRef.current) {
        modalRef.current.style.transform = `translateY(${deltaY * resistance}px)`
        modalRef.current.style.opacity = `${Math.max(0.5, 1 - deltaY / 400)}`
      }
    }
  }

  const handleTouchEnd = () => {
    if (!allowSwipeClose || !isDragging) return

    setIsDragging(false)
    
    // Close if swiped down more than 100px
    if (currentY > 100) {
      handleClose()
    } else {
      // Snap back to original position
      if (modalRef.current) {
        modalRef.current.style.transform = 'translateY(0)'
        modalRef.current.style.opacity = '1'
      }
    }
    
    setCurrentY(0)
  }

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(onClose, 200) // Wait for animation
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current && !preventBackdropClose) {
      handleClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !preventBackdropClose) {
      handleClose()
    }
  }

  if (!isOpen) return null

  const modalContent = (
    <div
      ref={backdropRef}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={modalRef}
        className={`
          relative bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden 
          transform transition-all duration-300 ease-out
          ${sizeClasses[size]}
          ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          ${className}
        `}
        tabIndex={-1}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Swipe indicator */}
        {allowSwipeClose && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="p-2 -m-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`overflow-y-auto ${size === 'fullscreen' ? 'flex-1' : 'max-h-[70vh]'}`}>
          {children}
        </div>
      </div>
    </div>
  )

  // Render to portal for proper z-index handling
  return createPortal(modalContent, document.body)
}

// Enhanced Form Modal specifically for touch interactions
interface TouchFormModalProps extends TouchModalProps {
  onSubmit?: (e: React.FormEvent) => void
  isLoading?: boolean
  primaryButtonText?: string
  secondaryButtonText?: string
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
}

export function TouchFormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  isLoading = false,
  primaryButtonText = 'Submit',
  secondaryButtonText = 'Cancel',
  onPrimaryAction,
  onSecondaryAction,
  ...modalProps
}: TouchFormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(e)
    } else if (onPrimaryAction) {
      onPrimaryAction()
    }
  }

  const handleSecondary = () => {
    if (onSecondaryAction) {
      onSecondaryAction()
    } else {
      onClose()
    }
  }

  return (
    <TouchModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      {...modalProps}
    >
      <form onSubmit={handleSubmit} className="p-6">
        {children}
        
        {/* Touch-optimized action buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSecondary}
            disabled={isLoading}
            className="flex-1 min-h-[48px] px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {secondaryButtonText}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 min-h-[48px] px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center touch-manipulation"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              primaryButtonText
            )}
          </button>
        </div>
      </form>
    </TouchModal>
  )
}

// Enhanced Input Component for touch
interface TouchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
}

export function TouchInput({ 
  label, 
  error, 
  helpText, 
  className = '', 
  ...props 
}: TouchInputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`
          w-full min-h-[48px] px-4 py-3 border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          text-base transition-colors duration-200
          touch-manipulation
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

// Enhanced Textarea for touch
interface TouchTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helpText?: string
}

export function TouchTextarea({ 
  label, 
  error, 
  helpText, 
  className = '', 
  ...props 
}: TouchTextareaProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`
          w-full min-h-[96px] px-4 py-3 border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          text-base transition-colors duration-200 resize-y
          touch-manipulation
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}