'use client'

// Image Preview Modal Component
// Click delivery docket thumbnails to view full-size images

import { useEffect, useState } from 'react'
import { getDeliveryDocketPreview } from '@/lib/supabase'

interface ImagePreviewModalProps {
  imagePath: string | null
  imageUrl?: string  // Pre-generated signed URL
  onClose: () => void
}

export default function ImagePreviewModal({ imagePath, imageUrl, onClose }: ImagePreviewModalProps) {
  const [finalImageUrl, setFinalImageUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

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

  // Generate signed URL if not provided
  useEffect(() => {
    const generateSignedUrl = async () => {
      if (imageUrl) {
        // Use pre-generated signed URL
        setFinalImageUrl(imageUrl)
        setIsLoading(false)
      } else if (imagePath) {
        // Generate signed URL
        setIsLoading(true)
        try {
          const signedUrl = await getDeliveryDocketPreview(imagePath)
          setFinalImageUrl(signedUrl)
        } catch (error) {
          console.error('Failed to generate signed URL for preview:', error)
          setFinalImageUrl('')
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    generateSignedUrl()
  }, [imagePath, imageUrl])

  if (!imagePath && !imageUrl) return null

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
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-gray-600">Loading preview...</div>
            </div>
          ) : finalImageUrl ? (
            <img
              src={finalImageUrl}
              alt="Delivery docket preview"
              className="max-w-full max-h-[80vh] object-contain rounded"
              loading="lazy"
              onError={(e) => {
                console.error('Failed to load image:', imagePath)
              }}
            />
          ) : (
            <div className="flex items-center justify-center p-8">
              <div className="text-gray-600">Failed to load preview</div>
            </div>
          )}
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