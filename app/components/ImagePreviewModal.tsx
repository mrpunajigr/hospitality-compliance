'use client'

// Image Preview Modal Component
// Click delivery docket thumbnails to view full-size images

import { useEffect } from 'react'
import { getDeliveryDocketPreview } from '@/lib/supabase'

interface ImagePreviewModalProps {
  imagePath: string | null
  onClose: () => void
}

export default function ImagePreviewModal({ imagePath, onClose }: ImagePreviewModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!imagePath) return null

  const imageUrl = getDeliveryDocketPreview(imagePath)

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold"
          aria-label="Close preview"
        >
          ✕
        </button>
        
        {/* Image container */}
        <div 
          className="bg-white rounded-lg p-2 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageUrl}
            alt="Delivery docket preview"
            className="max-w-full max-h-[80vh] object-contain rounded"
            loading="lazy"
            onError={(e) => {
              console.error('Failed to load image:', imagePath)
            }}
          />
        </div>
        
        {/* Image info */}
        <div className="text-center mt-2">
          <span className="text-white text-sm opacity-75">
            Click outside to close • Press Escape
          </span>
        </div>
      </div>
    </div>
  )
}