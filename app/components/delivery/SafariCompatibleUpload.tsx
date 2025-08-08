'use client'

// Hospitality Compliance SaaS - Safari 12 Compatible Upload Component
// Optimized for iPad Air (2013) with memory and performance considerations

import { useCallback, useRef, useState } from 'react'
import { supabase, supabaseAdmin, DELIVERY_DOCKETS_BUCKET, createDeliveryRecord, createAuditLog } from '@/lib/supabase'

interface UploadProps {
  clientId: string
  userId: string
  onUploadSuccess?: (deliveryRecord: any) => void
  onUploadError?: (error: string) => void
  accept?: string
  maxSizeMB?: number
}

export default function SafariCompatibleUpload({ 
  clientId,
  userId,
  onUploadSuccess,
  onUploadError,
  accept = "image/*",
  maxSizeMB = 8 
}: UploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<string>('')

  // Avoid drag-and-drop - not reliable on Safari 12
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setProgress('Validating file...')

    try {
      // Validate file size for Safari 12 memory constraints
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`File too large. Maximum size: ${maxSizeMB}MB`)
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file (JPG, PNG)')
      }

      setProgress('Compressing image...')
      
      // Compress image before upload for Safari 12 performance
      const compressedFile = await compressImageForSafari12(file)
      const finalFile = new File([compressedFile], file.name, { type: 'image/jpeg' })

      setProgress('Uploading to storage...')

      // Upload via server-side API endpoint
      const formData = new FormData()
      formData.append('file', finalFile)
      formData.append('clientId', clientId)
      formData.append('userId', userId)

      const uploadResponse = await fetch('/api/upload-docket', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const uploadResult = await uploadResponse.json()
      const deliveryRecord = uploadResult.deliveryRecord

      setProgress('Creating delivery record...')

      if (!deliveryRecord) {
        throw new Error('Failed to create delivery record')
      }

      setProgress('Processing with AI (Demo Mode)...')

      // For demo purposes, simulate AI processing with mock data
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing time
      
      const result = {
        success: true,
        deliveryRecordId: deliveryRecord.id,
        extractedData: {
          supplierName: 'Demo Supplier Co.',
          docketNumber: `DEMO-${Date.now()}`,
          deliveryDate: new Date().toISOString(),
          temperatures: [
            { value: 3.2, unit: 'C', context: 'Dairy products temperature: 3.2°C' },
            { value: -18.5, unit: 'C', context: 'Frozen goods temperature: -18.5°C' }
          ],
          products: ['milk', 'cheese', 'frozen vegetables'],
          confidence: 0.92
        },
        alertsGenerated: 0,
        processingTime: 2000
      }

      // Audit log is already created by the server-side endpoint
      setProgress('Complete!')
      
      if (onUploadSuccess) {
        onUploadSuccess({
          ...deliveryRecord,
          processingResult: result
        })
      }

    } catch (error) {
      console.error('Upload failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.'
      
      if (onUploadError) {
        onUploadError(errorMessage)
      }
    } finally {
      setUploading(false)
      setProgress('')
      
      // Reset input for consecutive uploads
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [clientId, userId, maxSizeMB, onUploadSuccess, onUploadError])

  return (
    <div className="upload-container p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />
      
      <div className="text-center">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="upload-button inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            minHeight: '44px', 
            minWidth: '200px' // iOS touch targets
          }}
        >
          {uploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="-ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Take Photo of Delivery Docket
            </>
          )}
        </button>
        
        <p className="mt-2 text-sm text-gray-600">
          JPG, PNG up to {maxSizeMB}MB
        </p>
      </div>
      
      {uploading && progress && (
        <div className="mt-4 text-center">
          <div className="text-sm text-blue-600 font-medium">
            {progress}
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      )}
    </div>
  )
}

// =====================================================
// IMAGE COMPRESSION FOR SAFARI 12
// =====================================================

async function compressImageForSafari12(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      try {
        // Scale down for memory constraints on iPad Air (2013)
        const maxWidth = 1200
        const maxHeight = 900
        
        let { width, height } = img
        
        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        // Compress more aggressively for Safari 12 (lower quality but better performance)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Compression failed'))
            }
            
            // Cleanup for memory management on Safari 12
            canvas.remove()
          },
          'image/jpeg',
          0.7 // 70% quality for good balance of size and quality
        )
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    // Create object URL for the image
    const objectUrl = URL.createObjectURL(file)
    img.src = objectUrl
    
    // Cleanup object URL after a delay to prevent memory leaks
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl)
    }, 1000)
  })
}

// =====================================================
// USAGE INSTRUCTIONS COMPONENT
// =====================================================

export function UploadInstructions() {
  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
      <h3 className="text-sm font-medium text-blue-900 mb-2">
        📱 Tips for Best Results
      </h3>
      <ul className="text-sm text-blue-800 space-y-1">
        <li>• Ensure good lighting when taking photos</li>
        <li>• Keep the delivery docket flat and fully visible</li>
        <li>• Make sure temperature readings are clearly visible</li>
        <li>• Avoid shadows or reflections on the document</li>
        <li>• Photos will be automatically processed with AI</li>
      </ul>
    </div>
  )
}