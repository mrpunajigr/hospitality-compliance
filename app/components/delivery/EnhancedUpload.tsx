'use client'

// Enhanced Upload Component - Batch Processing for Restaurant Operations
// Optimized for iPad Air (2013) with Safari 12 compatibility

import { useCallback, useRef, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

interface EnhancedExtractionResult {
  deliveryRecordId: string
  enhancedExtraction: {
    supplier: {
      value: string
      confidence: number
      extractionMethod: string
    }
    deliveryDate: {
      value: string
      confidence: number
      format: string
    }
    temperatureData: {
      readings: Array<{
        value: number
        unit: string
        confidence: number
        complianceStatus: string
      }>
      overallCompliance: string
    }
    lineItems: Array<{
      description: string
      quantity: number
      productCategory: string
      confidence: number
    }>
    productClassification: {
      primaryCategory: string
      summary: {
        confidence: number
      }
    }
    analysis: {
      overallConfidence: number
      estimatedValue: number
      itemCount: number
      processingTime: number
    }
  }
}

interface UploadFile {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  result?: EnhancedExtractionResult
  preview?: string
}

interface EnhancedUploadProps {
  clientId: string
  userId: string
  onUploadSuccess?: (results: any[]) => void
  onUploadError?: (error: string) => void
  onProgressUpdate?: (completedCount: number, totalCount: number) => void
  accept?: string
  maxSizeMB?: number
  maxFiles?: number
}

// Raw Textract Display Component
interface RawTextractDisplayProps {
  recordId: string
}

function RawTextractDisplay({ recordId }: RawTextractDisplayProps) {
  const [rawText, setRawText] = useState<string>('Loading AWS Textract results...')
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    let isCancelled = false
    
    const fetchRawText = async () => {
      if (!recordId || loading) return
      
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('delivery_records')
          .select('raw_extracted_text, processing_metadata')
          .eq('id', recordId)
          .single()
        
        if (isCancelled) return
        
        if (error) throw error
        
        if (data?.raw_extracted_text) {
          setRawText(data.raw_extracted_text)
        } else {
          setRawText('No raw text available - processing may have failed')
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Error fetching raw text:', error)
          setRawText('Error loading AWS Textract results')
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }
    
    fetchRawText()
    
    return () => {
      isCancelled = true
    }
  }, [recordId])
  
  return <span>{rawText}</span>
}

export default function EnhancedUpload({ 
  clientId,
  userId,
  onUploadSuccess,
  onUploadError,
  onProgressUpdate,
  accept = "image/*",
  maxSizeMB = 8,
  maxFiles = 10
}: EnhancedUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)

  // Generate unique ID for file tracking
  const generateFileId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  // Create file preview (for images)
  const createFilePreview = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve('') // No preview for non-images
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string || '')
      reader.onerror = () => resolve('')
      reader.readAsDataURL(file)
    })
  }

  // Validate individual file
  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSizeMB}MB`
    }
    
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (JPG, PNG)'
    }
    
    return null
  }

  // Handle multiple file selection
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Check total file limit
    if (uploadFiles.length + files.length > maxFiles) {
      if (onUploadError) {
        onUploadError(`Maximum ${maxFiles} files allowed. Please select fewer files.`)
      }
      return
    }

    const newUploadFiles: UploadFile[] = []

    // Process each selected file
    for (const file of files) {
      const validation = validateFile(file)
      
      if (validation) {
        // Add as error file
        newUploadFiles.push({
          id: generateFileId(),
          file,
          status: 'error',
          progress: 0,
          error: validation
        })
      } else {
        // Create preview and add as pending
        const preview = await createFilePreview(file)
        newUploadFiles.push({
          id: generateFileId(),
          file,
          status: 'pending',
          progress: 0,
          preview
        })
      }
    }

    setUploadFiles(prev => [...prev, ...newUploadFiles])
    
    // Reset input for consecutive selections
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [uploadFiles.length, maxFiles, maxSizeMB, onUploadError])

  // Remove file from queue
  const removeFile = useCallback((fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  // Retry failed file
  const retryFile = useCallback(async (fileId: string) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: 'pending', error: undefined, progress: 0 }
        : f
    ))
  }, [])

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  // Handle drop
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      // Process dropped files directly without synthetic event
      const validFiles: File[] = []
      
      for (const file of files) {
        if (uploadFiles.length + validFiles.length >= maxFiles) {
          onUploadError?.(`Maximum ${maxFiles} files allowed`)
          break
        }
        
        if (file.size > maxSizeMB * 1024 * 1024) {
          onUploadError?.(`File ${file.name} is too large (max ${maxSizeMB}MB)`)
          continue
        }
        
        validFiles.push(file)
      }
      
      if (validFiles.length > 0) {
        const newUploadFiles: UploadFile[] = []
        
        for (const file of validFiles) {
          const preview = await createFilePreview(file)
          newUploadFiles.push({
            id: generateFileId(),
            file,
            status: 'pending',
            progress: 0,
            preview
          })
        }
        
        setUploadFiles(prev => [...prev, ...newUploadFiles])
      }
    }
  }, [uploadFiles.length, maxFiles, maxSizeMB, onUploadError, createFilePreview, generateFileId])

  // Upload single file
  const uploadSingleFile = async (uploadFile: UploadFile): Promise<any> => {
    const { file } = uploadFile

    // Validate required fields (allow demo mode with fallback clientId)
    const effectiveClientId = clientId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' // Demo client UUID
    if (!file || !userId) {
      throw new Error('Missing required fields: file or userId')
    }

    // Update status to uploading
    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFile.id 
        ? { ...f, status: 'uploading', progress: 10 }
        : f
    ))

    try {
      // Upload to storage
      const formData = new FormData()
      formData.append('file', file)
      formData.append('clientId', effectiveClientId)
      formData.append('userId', userId)

      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, progress: 30 }
          : f
      ))

      const uploadResponse = await fetch('/api/upload-docket', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const uploadResult = await uploadResponse.json()

      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'processing', progress: 60 }
          : f
      ))

      // Process with OCR
      const ocrResponse = await fetch('/api/process-docket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketId: 'delivery-dockets',
          fileName: file.name,
          filePath: uploadResult.filePath,
          userId: userId,
          clientId: effectiveClientId
        })
      })

      if (!ocrResponse.ok) {
        const errorText = await ocrResponse.text()
        throw new Error(`OCR processing failed: ${errorText}`)
      }

      const enhancedResult: EnhancedExtractionResult = await ocrResponse.json()

      // Mark as completed with enhanced extraction data
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'completed', 
              progress: 100, 
              result: enhancedResult
            }
          : f
      ))

      return {
        ...uploadResult.deliveryRecord,
        enhancedProcessingResult: enhancedResult
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', progress: 0, error: errorMessage }
          : f
      ))
      
      throw error
    }
  }

  // Process all pending uploads
  const processUploads = useCallback(async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsProcessing(true)
    const results: any[] = []
    let completedCount = 0

    for (const uploadFile of pendingFiles) {
      try {
        const result = await uploadSingleFile(uploadFile)
        results.push(result)
        completedCount++
        
        if (onProgressUpdate) {
          onProgressUpdate(completedCount, pendingFiles.length)
        }
        
        // Update overall progress
        setOverallProgress((completedCount / pendingFiles.length) * 100)
        
      } catch (error) {
        console.error(`Failed to upload ${uploadFile.file.name}:`, error)
        // Continue with other files
      }
    }

    setIsProcessing(false)
    
    if (results.length > 0 && onUploadSuccess) {
      onUploadSuccess(results)
    }
    
    // Check for any errors
    const hasErrors = uploadFiles.some(f => f.status === 'error')
    if (hasErrors && results.length === 0 && onUploadError) {
      onUploadError('All uploads failed. Please check the files and try again.')
    }
  }, [uploadFiles, clientId, userId, onUploadSuccess, onUploadError, onProgressUpdate])

  // Clear all files
  const clearAll = useCallback(() => {
    setUploadFiles([])
    setOverallProgress(0)
  }, [])

  // Emergency clear all states (for stuck processing issues)
  const emergencyClear = useCallback(() => {
    setUploadFiles([])
    setIsProcessing(false)
    setOverallProgress(0)
    // Clear any browser storage that might be persisting state
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('uploadFiles')
        localStorage.removeItem('processingState')
        localStorage.removeItem('enhancedUploadState')
      } catch (error) {
        console.log('Could not clear localStorage:', error)
      }
    }
    console.log('🚨 Emergency clear executed - all upload states reset')
  }, [])

  // Get status counts
  const statusCounts = {
    pending: uploadFiles.filter(f => f.status === 'pending').length,
    uploading: uploadFiles.filter(f => f.status === 'uploading').length,
    processing: uploadFiles.filter(f => f.status === 'processing').length,
    completed: uploadFiles.filter(f => f.status === 'completed').length,
    error: uploadFiles.filter(f => f.status === 'error').length
  }

  return (
    <div className="space-y-6">
      
      {/* Upload Area */}
      <div className={getCardStyle('form')}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📤</span>
          </div>
          
          <h3 className={`${getTextStyle('sectionTitle')} text-gray-900 mb-2`}>
            Upload Delivery Dockets
          </h3>
          
          <p className={`${getTextStyle('body')} text-gray-600 mb-4`}>
            Select multiple delivery docket images to process (max {maxFiles} files, {maxSizeMB}MB each)
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleFileSelect}
            disabled={isProcessing}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing || uploadFiles.length >= maxFiles}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors"
          >
            {uploadFiles.length === 0 ? 'Select Files' : 'Add More Files'}
          </button>
          
          {uploadFiles.length > 0 && (
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={processUploads}
                disabled={isProcessing || statusCounts.pending === 0}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                {isProcessing ? 'Processing...' : `Upload ${statusCounts.pending} Files`}
              </button>
              
              <button
                onClick={clearAll}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                Clear All
              </button>
              
              <button
                onClick={emergencyClear}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                title="Emergency clear - use if processing gets stuck"
              >
                🚨 Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File Queue */}
      {uploadFiles.length > 0 && (
        <div className={getCardStyle('primary')}>
          <div className="p-6">
            
            {/* Overall Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className={`${getTextStyle('sectionTitle')} text-white`}>
                  Upload Queue ({uploadFiles.length} files)
                </h4>
                {isProcessing && (
                  <span className="text-white/80 text-sm">
                    {Math.round(overallProgress)}% Complete
                  </span>
                )}
              </div>
              
              {/* Status Summary */}
              <div className="flex flex-wrap gap-2 mb-4">
                {statusCounts.pending > 0 && (
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
                    {statusCounts.pending} Pending
                  </span>
                )}
                {statusCounts.uploading > 0 && (
                  <span className="px-2 py-1 bg-yellow-600/20 text-yellow-300 rounded text-xs">
                    {statusCounts.uploading} Uploading
                  </span>
                )}
                {statusCounts.processing > 0 && (
                  <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                    {statusCounts.processing} Processing
                  </span>
                )}
                {statusCounts.completed > 0 && (
                  <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-xs">
                    {statusCounts.completed} Completed
                  </span>
                )}
                {statusCounts.error > 0 && (
                  <span className="px-2 py-1 bg-red-600/20 text-red-300 rounded text-xs">
                    {statusCounts.error} Failed
                  </span>
                )}
              </div>

              {/* Overall Progress Bar */}
              {isProcessing && (
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Individual Files */}
            <div className="space-y-3">
              {uploadFiles.map((uploadFile) => (
                <div 
                  key={uploadFile.id}
                  className="flex items-center space-x-4 p-3 bg-white/10 rounded-xl"
                >
                  {/* File Preview */}
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {uploadFile.preview ? (
                      <img 
                        src={uploadFile.preview} 
                        alt={uploadFile.file.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-white text-xl">📄</span>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className={`${getTextStyle('body')} text-white font-medium truncate`}>
                      {uploadFile.file.name}
                    </div>
                    <div className="text-white/60 text-sm">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(1)}MB
                    </div>
                  </div>

                  {/* Status & Progress */}
                  <div className="flex items-center space-x-3">
                    {uploadFile.status === 'pending' && (
                      <span className="text-blue-300 text-sm">Ready</span>
                    )}
                    
                    {(uploadFile.status === 'uploading' || uploadFile.status === 'processing') && (
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-white/20 rounded-full h-1.5">
                          <div 
                            className="bg-yellow-400 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          />
                        </div>
                        <span className="text-yellow-300 text-sm w-8">
                          {uploadFile.progress}%
                        </span>
                      </div>
                    )}
                    
                    {uploadFile.status === 'completed' && uploadFile.result && uploadFile.result.enhancedExtraction && (
                      <div className="flex flex-col items-end">
                        <span className="text-green-300 text-sm">✓ Done</span>
                        <div className="text-xs text-green-400">
                          {((uploadFile.result.enhancedExtraction?.analysis?.overallConfidence || 0) * 100).toFixed(1)}% confidence
                        </div>
                        {(uploadFile.result.enhancedExtraction?.lineItems?.length || 0) > 0 && (
                          <div className="text-xs text-green-400">
                            {uploadFile.result.enhancedExtraction?.lineItems?.length || 0} items
                          </div>
                        )}
                      </div>
                    )}
                    
                    {uploadFile.status === 'error' && (
                      <div className="flex items-center space-x-2">
                        <span className="text-red-300 text-sm">✗ Failed</span>
                        <button
                          onClick={() => retryFile(uploadFile.id)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={uploadFile.status === 'uploading' || uploadFile.status === 'processing'}
                      className="text-white/60 hover:text-white disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Results Preview with Raw AWS Textract Text */}
      {statusCounts.completed > 0 && (
        <div className={getCardStyle('primary')}>
          <div className="p-6">
            <h3 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
              Processing Results ({statusCounts.completed} completed)
            </h3>
            
            <div className="space-y-6">
              {uploadFiles
                .filter(f => f.status === 'completed' && f.result)
                .map((uploadFile) => {
                  const result = uploadFile.result
                  if (!result) return null
                  const extraction = result.enhancedExtraction
                  if (!extraction) return null
                  
                  return (
                    <div key={uploadFile.id} className="bg-white/10 rounded-xl p-6">
                      
                      {/* Header with Thumbnail and Basic Info */}
                      <div className="flex items-start space-x-4 mb-6">
                        {/* Large Thumbnail */}
                        <div className="w-32 h-32 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          {uploadFile.preview ? (
                            <img 
                              src={uploadFile.preview} 
                              alt={uploadFile.file.name}
                              className="w-32 h-32 object-cover rounded-lg border border-white/30"
                            />
                          ) : (
                            <span className="text-white text-4xl">📄</span>
                          )}
                        </div>
                        
                        {/* File Info and Stats */}
                        <div className="flex-1">
                          <h4 className="text-white font-semibold text-lg mb-2">
                            {uploadFile.file.name}
                          </h4>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="text-white/70 text-xs mb-1">Confidence</div>
                              <div className="text-green-300 text-lg font-bold">
                                {((extraction.analysis?.overallConfidence || 0) * 100).toFixed(1)}%
                              </div>
                            </div>
                            
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="text-white/70 text-xs mb-1">Items Found</div>
                              <div className="text-blue-300 text-lg font-bold">
                                {extraction.lineItems?.length || 0}
                              </div>
                            </div>
                            
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="text-white/70 text-xs mb-1">Supplier</div>
                              <div className="text-white text-sm font-medium truncate">
                                {extraction.supplier?.value || 'Unknown'}
                              </div>
                            </div>
                            
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="text-white/70 text-xs mb-1">Process Time</div>
                              <div className="text-purple-300 text-sm font-medium">
                                {extraction.analysis?.processingTime || 0}ms
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Raw AWS Textract Text Display */}
                      <div className="border-t border-white/20 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-white font-medium">🤖 AWS Textract Raw Extraction</h5>
                          <button
                            onClick={() => {
                              // Copy record ID to clipboard
                              navigator.clipboard.writeText(result.deliveryRecordId)
                              alert('Record ID copied to clipboard')
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg"
                          >
                            Copy Record ID
                          </button>
                        </div>
                        
                        {/* Raw Text Container */}
                        <div className="bg-black/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                          <pre className="text-green-300 text-sm font-mono whitespace-pre-wrap break-words">
                            <RawTextractDisplay recordId={result.deliveryRecordId} />
                          </pre>
                        </div>
                      </div>
                      
                      {/* Structured Data Display */}
                      <div className="border-t border-white/20 pt-4 mt-4">
                        <h5 className="text-white font-medium mb-3">📊 Structured Analysis</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Line Items */}
                          {extraction.lineItems && extraction.lineItems.length > 0 && (
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="text-white/70 text-xs mb-2">Line Items ({extraction.lineItems.length})</div>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {extraction.lineItems.slice(0, 5).map((item: any, index: number) => (
                                  <div key={index} className="text-white text-sm flex justify-between">
                                    <span className="truncate flex-1">{item.description}</span>
                                    <span className="text-blue-300 ml-2">{item.quantity}</span>
                                  </div>
                                ))}
                                {extraction.lineItems.length > 5 && (
                                  <div className="text-white/60 text-xs">
                                    +{extraction.lineItems.length - 5} more items...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Temperature Data */}
                          {extraction.temperatureData && extraction.temperatureData.readings && (
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="text-white/70 text-xs mb-2">Temperature Readings</div>
                              <div className="space-y-1">
                                {extraction.temperatureData.readings.slice(0, 3).map((reading: any, index: number) => (
                                  <div key={index} className="text-white text-sm flex justify-between">
                                    <span>{reading.value}°{reading.unit}</span>
                                    <span className={`${reading.complianceStatus === 'pass' ? 'text-green-300' : 'text-red-300'}`}>
                                      {reading.complianceStatus}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}