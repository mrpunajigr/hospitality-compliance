'use client'

import { useState, useRef } from 'react'

interface ImageUploaderProps {
  currentImageUrl?: string | null
  onUploadSuccess: (imageUrl: string) => void
  onUploadError: (error: string) => void
  uploadEndpoint: '/api/upload-avatar' | '/api/upload-client-logo'
  uploadData: Record<string, string> // userId for avatar, clientId + userId for logo
  acceptedTypes?: string[]
  maxSizeMB?: number
  shape?: 'circle' | 'square'
  size?: 'small' | 'medium' | 'large'
  title?: string
  description?: string
}

const sizeClasses = {
  small: 'w-16 h-16',
  medium: 'w-24 h-24', 
  large: 'w-32 h-32'
}

export default function ImageUploader({
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
  uploadEndpoint,
  uploadData,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxSizeMB = 5,
  shape = 'circle',
  size = 'medium',
  title = 'Upload Image',
  description = 'Click to upload or drag and drop'
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      onUploadError(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`)
      return
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      onUploadError(`File too large. Maximum size is ${maxSizeMB}MB`)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = () => setPreviewUrl(reader.result as string)
    reader.readAsDataURL(file)

    // Upload file
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Add upload data (userId, clientId, etc.)
      Object.entries(uploadData).forEach(([key, value]) => {
        formData.append(key, value)
      })

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Success
      onUploadSuccess(result.avatar_url || result.logo_url)
      setPreviewUrl(null) // Clear preview since we now have the real image
      
    } catch (error) {
      console.error('Upload error:', error)
      onUploadError(error instanceof Error ? error.message : 'Upload failed')
      setPreviewUrl(null) // Clear preview on error
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleDrag = (e: React.DragEvent, active: boolean) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(active)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const displayImage = previewUrl || currentImageUrl
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg'
  const sizeClass = sizeClasses[size]

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Image Preview */}
      <div 
        className={`${sizeClass} ${shapeClass} bg-white/20 backdrop-blur-sm border-2 border-dashed border-white/30 overflow-hidden cursor-pointer transition-all duration-200 hover:border-white/50 ${
          dragActive ? 'border-blue-400 bg-blue-50/20' : ''
        } ${isUploading ? 'opacity-50' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => handleDrag(e, true)}
        onDragEnter={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onClick={handleClick}
      >
        {displayImage ? (
          <img 
            src={displayImage}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white/60 text-center">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-xs">Upload</p>
            </div>
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-inherit">
            <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Upload Info */}
      <div className="text-center">
        <h4 className="text-sm font-medium text-white mb-1">{title}</h4>
        <p className="text-xs text-white/60">{description}</p>
        <p className="text-xs text-white/50 mt-1">
          {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} • Max {maxSizeMB}MB
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  )
}