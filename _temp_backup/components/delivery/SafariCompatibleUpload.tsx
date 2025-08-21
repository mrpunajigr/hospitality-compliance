'use client'

// Hospitality Compliance SaaS - Safari 12 Compatible Upload Component  
// Optimized for iPad Air (2013) with memory and performance considerations
// Enhanced for Safari 12 memory management and performance

// Safari 12 compatibility declarations
declare global {
  interface Window {
    gc?: () => void
  }
}

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

      setProgress('Preparing upload...')
      
      // Skip compression for now to avoid image loading errors
      const finalFile = file

      setProgress('Getting upload URL...')

      // Step 1: Get signed URL for direct Supabase upload (bypasses Vercel 4.5MB limit)
      const signedUrlResponse = await fetch('/api/get-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: finalFile.name,
          fileType: finalFile.type,
          clientId: clientId,
          userId: userId
        })
      })

      if (!signedUrlResponse.ok) {
        const errorData = await signedUrlResponse.json()
        throw new Error(errorData.error || 'Failed to get upload URL')
      }

      const { signedUrl, filePath, fileName } = await signedUrlResponse.json()
      console.log('✅ Got signed URL for direct upload:', filePath)

      setProgress('Uploading to storage...')

      // Step 2: Upload directly to Supabase storage using signed URL
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: finalFile,
        headers: {
          'Content-Type': finalFile.type,
          'Cache-Control': '3600',
          'x-upsert': 'false'
        }
      })

      if (!uploadResponse.ok) {
        console.error('Direct upload failed:', uploadResponse.status, uploadResponse.statusText)
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`)
      }

      console.log('✅ File uploaded directly to Supabase storage')

      setProgress('Creating delivery record...')

      // Step 3: Create delivery record with file path (not file content)
      const recordResponse = await fetch('/api/create-delivery-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filePath: filePath,
          fileName: fileName,
          fileSize: finalFile.size,
          fileType: finalFile.type,
          clientId: clientId,
          userId: userId
        })
      })

      if (!recordResponse.ok) {
        const errorData = await recordResponse.json()
        throw new Error(errorData.error || 'Failed to create delivery record')
      }

      const recordResult = await recordResponse.json()
      const deliveryRecord = recordResult.deliveryRecord

      if (!deliveryRecord) {
        throw new Error('Failed to create delivery record')
      }

      setProgress('Processing with AI OCR...')

      // Call the Google Cloud AI processing function with file path
      const ocrResponse = await fetch('/api/process-docket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketId: 'delivery-dockets',
          fileName: fileName,
          filePath: filePath,
          deliveryRecordId: deliveryRecord.id,
          userId: userId,
          clientId: clientId
        })
      })

      if (!ocrResponse.ok) {
        const errorText = await ocrResponse.text()
        console.error('OCR Response Status:', ocrResponse.status)
        console.error('OCR Response Body:', errorText)
        
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || `OCR processing failed (${ocrResponse.status})`)
        } catch {
          throw new Error(`OCR processing failed (${ocrResponse.status}): ${errorText}`)
        }
      }

      const result = await ocrResponse.json()

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
          data-testid="upload-button"
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
    // Monitor memory usage for Safari 12 performance
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0
    console.log('🍎 Safari 12 compression starting, memory:', Math.round(startMemory / 1024 / 1024), 'MB')
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    // Enhanced error handling for Safari 12
    img.onerror = () => {
      canvas.remove()
      reject(new Error('Image failed to load in Safari 12'))
    }
    
    img.onload = () => {
      try {
        // Scale down aggressively for Safari 12 memory constraints on iPad Air (2013)
        // Reduced from 1200x900 to optimize for 1GB RAM limitation
        const maxWidth = 800
        const maxHeight = 600
        
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
            
            // Enhanced memory cleanup for Safari 12
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            canvas.width = 1
            canvas.height = 1
            canvas.remove()
            
            // Monitor memory after compression
            const endMemory = (performance as any).memory?.usedJSHeapSize || 0
            console.log('🍎 Safari 12 compression completed, memory:', Math.round(endMemory / 1024 / 1024), 'MB')
            
            // Force garbage collection hint for Safari 12
            if ((window as any).gc) {
              setTimeout(() => (window as any).gc(), 100)
            }
          },
          'image/jpeg',
          0.5 // Reduced to 50% quality for Safari 12 memory efficiency
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