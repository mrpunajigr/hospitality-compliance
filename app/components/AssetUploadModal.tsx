'use client'

import { useState, useCallback, useRef } from 'react'
import { getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'

interface AssetUploadModalProps {
  isOpen: boolean
  onClose: () => void
  uploadType: 'background' | 'logo'
  onUploadSuccess?: (asset: any) => void
  theme?: 'light' | 'dark'
}

interface UploadFile {
  file: File
  preview: string
  id: string
}

export default function AssetUploadModal({
  isOpen,
  onClose,
  uploadType,
  onUploadSuccess,
  theme = 'dark'
}: AssetUploadModalProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [formData, setFormData] = useState({
    name: '',
    category: uploadType === 'background' ? 'neutral' : 'brand',
    difficulty: 'medium',
    altText: '',
    tags: ''
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }, [])

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      if (!validTypes.includes(file.type)) {
        alert(`${file.name}: Invalid file type. Please use JPEG, PNG, WebP, or GIF.`)
        return false
      }
      
      if (file.size > maxSize) {
        alert(`${file.name}: File too large. Please use files under 5MB.`)
        return false
      }
      
      return true
    })

    const uploadFiles: UploadFile[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }))

    setFiles(prev => [...prev, ...uploadFiles])
    
    // Auto-set name from first file if empty
    if (validFiles.length > 0 && !formData.name) {
      const firstName = validFiles[0].name.replace(/\.[^/.]+$/, "")
      setFormData(prev => ({ ...prev, name: firstName }))
    }
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  const handleUpload = async () => {
    if (files.length === 0 || !formData.name) {
      alert('Please select files and provide a name.')
      return
    }

    setUploading(true)

    try {
      for (const uploadFile of files) {
        const formDataToSend = new FormData()
        formDataToSend.append('file', uploadFile.file)
        formDataToSend.append('type', uploadType)
        formDataToSend.append('name', formData.name)
        formDataToSend.append('category', formData.category)
        formDataToSend.append('difficulty', formData.difficulty)
        formDataToSend.append('altText', formData.altText)
        
        // Process tags
        if (formData.tags) {
          const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          formDataToSend.append('tags', JSON.stringify(tags))
        }

        const response = await fetch('/api/assets/upload', {
          method: 'POST',
          body: formDataToSend,
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Upload failed')
        }

        if (onUploadSuccess) {
          onUploadSuccess(result.asset)
        }
      }

      // Success - close modal and reset
      handleClose()
      alert(`Successfully uploaded ${files.length} ${uploadType}(s)!`)
      
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    // Clean up previews
    files.forEach(f => URL.revokeObjectURL(f.preview))
    setFiles([])
    setFormData({
      name: '',
      category: uploadType === 'background' ? 'neutral' : 'brand',
      difficulty: 'medium',
      altText: '',
      tags: ''
    })
    onClose()
  }

  if (!isOpen) return null

  const backgroundCategories = ['kitchen', 'restaurant', 'hotel', 'office', 'neutral']
  const logoCategories = ['brand', 'neutral']
  const categories = uploadType === 'background' ? backgroundCategories : logoCategories

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto ${getCardStyle('primary', theme)} border-2 ${
        theme === 'dark' ? 'border-white/30' : 'border-gray-300'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className={`${getTextStyle('sectionTitle', theme)} text-gray-900 font-bold`}>
              Upload {uploadType === 'background' ? 'Background' : 'Logo'}
            </h2>
            <p className={`${getTextStyle('caption', theme)} text-gray-700`}>
              Drag and drop files or click to browse
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className="p-2 rounded-full transition-colors hover:bg-gray-100 text-gray-600 hover:text-gray-900"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-6 space-y-6">
          {/* Drag & Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
              dragActive 
                ? 'border-blue-400 bg-blue-400/10' 
                : theme === 'dark' 
                  ? 'border-white/30 hover:border-white/50 bg-white/5 hover:bg-white/10' 
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="space-y-4">
              <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-600">
                  JPEG, PNG, WebP, GIF up to 5MB each
                </p>
              </div>
            </div>
          </div>

          {/* File Previews */}
          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">
                Selected Files ({files.length})
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {files.map((uploadFile) => (
                  <div key={uploadFile.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-black/20">
                      <img
                        src={uploadFile.preview}
                        alt={uploadFile.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <button
                      onClick={() => removeFile(uploadFile.id)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    <p className="mt-2 text-xs truncate text-gray-700">
                      {uploadFile.file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Asset Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={getFormFieldStyle()}
                placeholder="Enter asset name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={getFormFieldStyle()}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {uploadType === 'background' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                  className={getFormFieldStyle()}
                >
                  <option value="easy">Easy (High Contrast)</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard (Low Contrast)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Alt Text
              </label>
              <input
                type="text"
                value={formData.altText}
                onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
                className={getFormFieldStyle()}
                placeholder="Accessibility description"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-900">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className={getFormFieldStyle()}
                placeholder="modern, dark, professional (comma separated)"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between p-6 border-t ${
          theme === 'dark' ? 'border-white/20' : 'border-gray-200'
        }`}>
          <div className="text-sm text-gray-600">
            {files.length} file{files.length !== 1 ? 's' : ''} selected
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200"
              disabled={uploading}
            >
              Cancel
            </button>
            
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0 || !formData.name}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                uploading || files.length === 0 || !formData.name
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Uploading...</span>
                </div>
              ) : (
                `Upload ${files.length} ${uploadType}${files.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}