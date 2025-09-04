'use client'

// Simple Results Card Component
// Clean rectangle design with Supplier | Delivery Date | Upload Date, User || Thumbnail with hover expansion

import { useState, useEffect } from 'react'
import { getCardStyle, getTextStyle } from '@/lib/design-system'
import { getDeliveryDocketThumbnail, getDeliveryDocketPreview } from '@/lib/supabase'
import ImagePreviewModal from '@/app/components/ImagePreviewModal'
import { ResultsCardConfig, DEFAULT_CONFIG } from '@/app/components/upload/ResultsCardConfig'

interface SimpleResultsData {
  id: string
  supplier_name: string
  delivery_date: string
  created_at: string
  uploaded_by?: string
  image_path?: string
  user_name?: string
  confidence_score?: number
  client_id?: string // For demo mode detection
  item_count?: number // Simple item count
  // Required fields for Results Card
  line_items?: any[] | string // Array of line items or stringified JSON
  temperature_reading?: string // Handwritten temperature
  analysis?: any // Full analysis data
  extraction_data?: any // OCR extraction data
  // Module 2 AI Processing - Optional fields for Results Card configuration
  item_code?: string
  item_description?: string
  quantity?: number
  unit_price?: number
  total_amount?: number
}

interface SimpleResultsCardProps {
  data: SimpleResultsData
  className?: string
  userId?: string // For demo mode detection
  config?: ResultsCardConfig // Module 2 field configuration
}

export default function SimpleResultsCard({ data, className = '', userId, config = DEFAULT_CONFIG }: SimpleResultsCardProps) {
  
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
  const [thumbnailLoading, setThumbnailLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [previewOpen, setPreviewOpen] = useState(false)

  // Load thumbnail - MUST work for client needs
  useEffect(() => {
    if (!data.image_path || !userId) {
      setThumbnailLoading(false)
      return
    }

    const loadThumbnail = async () => {
      try {
        console.log('🔍 Loading thumbnail for:', data.image_path)
        const response = await fetch(`/api/get-upload-url?fileName=${encodeURIComponent(data.image_path || '')}&userId=${userId || ''}`)
        
        if (!response.ok) {
          console.error('❌ API response not ok:', response.status, response.statusText)
          return
        }
        
        const result = await response.json()
        console.log('📊 API response:', result)
        
        if (result.success && result.signedUrl) {
          // Test if the image actually exists before setting
          const img = new Image()
          img.onload = () => {
            setThumbnailUrl(result.signedUrl)
            setPreviewUrl(result.signedUrl)
            console.log('✅ Thumbnail loaded successfully:', result.signedUrl)
          }
          img.onerror = () => {
            console.error('❌ Image does not exist at URL:', result.signedUrl)
            // Keep loading false so we show the document icon fallback
          }
          img.src = result.signedUrl
        } else {
          console.error('❌ No signed URL in response:', result)
        }
      } catch (error) {
        console.error('❌ Thumbnail loading error:', error)
      } finally {
        setThumbnailLoading(false)
      }
    }

    loadThumbnail()
  }, [data.image_path, userId])

  // Format dates for display
  const formatDeliveryDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-NZ', {
        day: 'numeric',
        month: 'short', 
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
                {data.supplier_name || 'SERVICE FOODS - AUCKLAND FOODSERVICE'}
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

            {/* Item Count */}
            {data.item_count !== undefined && data.item_count > 0 && (
              <div className={`${getTextStyle('body')} text-white/80 text-sm`}>
                <span className="text-white/60">Items:</span> {data.item_count} products
              </div>
            )}

            {/* Individual Line Items and Temperature */}
            <div className="space-y-2 text-sm">
              {/* Temperature Reading - Simplified */}
              {data.temperature_reading && (
                <div className="text-white/70">
                  <span className="text-white/50">Temperature:</span> {data.temperature_reading}
                </div>
              )}


            </div>

            {/* Module 2 Optional Fields - Dynamic based on configuration */}
            {(config.itemCode || config.itemDescription || config.quantity || config.unitPrice || config.totalAmount) && (
              <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
                {/* Item Code and Description */}
                {config.itemCode && data.item_code && (
                  <div className={`${getTextStyle('bodySmall')} text-white/70`}>
                    <span className="text-white/50">Code:</span> {data.item_code}
                  </div>
                )}
                
                {config.itemDescription && data.item_description && (
                  <div className={`${getTextStyle('bodySmall')} text-white/70`}>
                    <span className="text-white/50">Item:</span> {data.item_description}
                  </div>
                )}
                
                {/* Quantity, Price, and Total in a row */}
                {(config.quantity || config.unitPrice || config.totalAmount) && (
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex space-x-4">
                      {config.quantity && data.quantity && (
                        <span className="text-white/70">
                          <span className="text-white/50">Qty:</span> {data.quantity}
                        </span>
                      )}
                      
                      {config.unitPrice && data.unit_price && (
                        <span className="text-white/70">
                          <span className="text-white/50">Price:</span> ${data.unit_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    {config.totalAmount && data.total_amount && (
                      <span className="text-white font-medium">
                        Total: ${data.total_amount.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
            
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
                  e.currentTarget.style.transform = 'scale(1.3)'
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
                // Use signed URL when available
                <img
                  src={thumbnailUrl}
                  alt="Delivery docket thumbnail"
                  className="w-20 h-20 object-cover rounded-xl border-2 border-white/20 hover:border-white/40 transition-colors shadow-lg"
                  loading="lazy"
                  onLoad={() => {
                    console.log('✅ Signed URL thumbnail loaded:', thumbnailUrl)
                  }}
                  onError={(e) => {
                    console.error('❌ Signed URL thumbnail failed to load:', thumbnailUrl)
                    console.error('❌ Image path in data:', data.image_path)
                    console.error('❌ Image error event:', e)
                    
                    // Test the URL directly
                    fetch(thumbnailUrl, { method: 'HEAD' })
                      .then(response => {
                        console.log('🔍 Direct fetch response status:', response.status)
                        console.log('🔍 Direct fetch response headers:', Object.fromEntries(response.headers.entries()))
                      })
                      .catch(fetchError => {
                        console.error('❌ Direct fetch failed:', fetchError)
                      })
                    
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
          imagePath={null}
          imageUrl={previewUrl}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  )
}