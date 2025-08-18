'use client'

// Simple Results Card Component
// Clean rectangle design with Supplier | Delivery Date | Upload Date, User || Thumbnail with hover expansion

import { useState, useEffect } from 'react'
import { getCardStyle, getTextStyle } from '@/lib/design-system'
import { getDeliveryDocketThumbnail, getDeliveryDocketPreview } from '@/lib/supabase'
import ImagePreviewModal from '@/app/components/ImagePreviewModal'

interface SimpleResultsData {
  id: string
  supplier_name: string
  delivery_date: string
  created_at: string
  uploaded_by?: string
  image_path?: string
  user_name?: string
  confidence_score?: number
}

interface SimpleResultsCardProps {
  data: SimpleResultsData
  className?: string
}

export default function SimpleResultsCard({ data, className = '' }: SimpleResultsCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
  const [thumbnailLoading, setThumbnailLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [previewOpen, setPreviewOpen] = useState(false)

  // Load thumbnail and preview URLs
  useEffect(() => {
    const loadImages = async () => {
      if (!data.image_path) {
        setThumbnailLoading(false)
        return
      }

      try {
        setThumbnailLoading(true)
        
        // Generate both thumbnail and preview URLs
        const [thumbnailSignedUrl, previewSignedUrl] = await Promise.all([
          getDeliveryDocketThumbnail(data.image_path),
          getDeliveryDocketPreview(data.image_path)
        ])
        
        setThumbnailUrl(thumbnailSignedUrl)
        setPreviewUrl(previewSignedUrl)
        
      } catch (error) {
        console.error('Failed to load delivery docket images:', error)
      } finally {
        setThumbnailLoading(false)
      }
    }

    loadImages()
  }, [data.image_path])

  // Format dates for display
  const formatDeliveryDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const formatUploadDateTime = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <>
      <div className={`${getCardStyle('primary')} ${className}`}>
        <div className="flex items-center justify-between">
          
          {/* Left side: Content */}
          <div className="flex-1 space-y-2">
            
            {/* Supplier Name */}
            <div className="flex items-center space-x-3">
              <h3 className={`${getTextStyle('sectionTitle')} text-white font-medium`}>
                {data.supplier_name}
              </h3>
              {data.confidence_score && data.confidence_score > 0 && (
                <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                  {Math.round(data.confidence_score * 100)}% confidence
                </span>
              )}
            </div>
            
            {/* Delivery Date */}
            <div className={`${getTextStyle('body')} text-white/80`}>
              <span className="text-white/60">Delivery:</span> {formatDeliveryDate(data.delivery_date)}
            </div>
            
            {/* Upload Date and User */}
            <div className={`${getTextStyle('body')} text-white/70 text-sm`}>
              <span className="text-white/50">Uploaded:</span> {formatUploadDateTime(data.created_at)}
              {(data.user_name || data.uploaded_by) && (
                <span> by {data.user_name || data.uploaded_by}</span>
              )}
            </div>
          </div>
          
          {/* Right side: Thumbnail */}
          {data.image_path && (
            <div 
              className="thumbnail-container cursor-pointer flex-shrink-0 ml-6"
              onClick={() => previewUrl ? setPreviewOpen(true) : null}
              title={previewUrl ? "Click to preview full image" : "Loading image..."}
              style={{ 
                transition: 'all 0.3s ease',
                transformOrigin: 'center'
              }}
              onMouseEnter={(e) => {
                if (!thumbnailLoading && thumbnailUrl) {
                  e.currentTarget.style.transform = 'scale(2)'
                  e.currentTarget.style.zIndex = '10'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.zIndex = '1'
              }}
            >
              {thumbnailLoading ? (
                // Loading skeleton
                <div className="w-20 h-20 bg-white/10 rounded-xl border-2 border-white/20 flex items-center justify-center animate-pulse">
                  <div className="text-white/40 text-xs">Loading...</div>
                </div>
              ) : thumbnailUrl ? (
                // Signed URL image
                <img
                  src={thumbnailUrl}
                  alt="Delivery docket thumbnail"
                  className="w-20 h-20 object-cover rounded-xl border-2 border-white/20 hover:border-white/40 transition-colors shadow-lg"
                  loading="lazy"
                  onLoad={() => {
                    console.log('✅ SimpleResultsCard: Thumbnail loaded successfully')
                  }}
                  onError={(e) => {
                    console.log('❌ SimpleResultsCard: Thumbnail failed to load')
                    // Fallback to document icon
                    const target = e.currentTarget
                    target.style.display = 'none'
                    const fallback = document.createElement('div')
                    fallback.className = 'w-20 h-20 bg-white/10 rounded-xl border-2 border-white/20 flex items-center justify-center'
                    fallback.innerHTML = '<div class="text-white/60 text-2xl">📄</div>'
                    target.parentNode?.appendChild(fallback)
                  }}
                />
              ) : (
                // Fallback icon
                <div className="w-20 h-20 bg-white/10 rounded-xl border-2 border-white/20 flex items-center justify-center">
                  <div className="text-white/60 text-2xl">📄</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewOpen && previewUrl && (
        <ImagePreviewModal
          imageUrl={previewUrl}
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title={`Delivery Docket - ${data.supplier_name}`}
        />
      )}
    </>
  )
}