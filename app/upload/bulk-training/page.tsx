'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'
import TrainingNavigation from '@/components/training/TrainingNavigation'

interface BulkProcessingStats {
  total: number
  processed: number
  uploaded: number
  failed: number
  errors: string[]
  deliveryRecords: string[]
}

export default function BulkTrainingUploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<BulkProcessingStats | null>(null)
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null)
  const [processingPriority, setProcessingPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [batchSize, setBatchSize] = useState(10)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter for image files only
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/') || file.name.toLowerCase().match(/\.(jpg|jpeg|png|heic|heif)$/i)
    )
    
    setFiles(prev => [...prev, ...imageFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.heic', '.heif']
    },
    multiple: true
  })

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const clearAll = () => {
    setFiles([])
    setResults(null)
    setProgress(null)
  }

  const startBulkProcessing = async () => {
    if (files.length === 0) return

    setProcessing(true)
    setProgress({ current: 0, total: files.length })

    try {
      const formData = new FormData()
      
      // Add configuration
      formData.append('clientId', 'demo-client-id') // You'll want to get this from auth context
      formData.append('userId', 'demo-user-id') // You'll want to get this from auth context
      formData.append('processingPriority', processingPriority)
      formData.append('batchSize', batchSize.toString())

      // Add all files
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })

      console.log(`🚀 Starting bulk upload of ${files.length} files...`)

      const response = await fetch('/api/bulk-process-dockets', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Bulk processing failed')
      }

      const data = await response.json()
      console.log('✅ Bulk processing completed:', data)

      setResults(data.results)
      
      // Clear files on success
      if (data.results.processed > 0) {
        setFiles([])
      }

    } catch (error) {
      console.error('❌ Bulk processing error:', error)
      // Handle error - you might want to show an error message to the user
    } finally {
      setProcessing(false)
      setProgress(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const estimatedProcessingTime = files.length * 15 // Rough estimate: 15 seconds per file

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation */}
        <TrainingNavigation />
        
        {/* Header */}
        <div className={getCardStyle('primary')}>
          <div className="p-6">
            <h1 className={`${getTextStyle('pageTitle')} text-white mb-2`}>
              Bulk Training Upload
            </h1>
            <p className={`${getTextStyle('body')} text-slate-300`}>
              Upload large collections of delivery dockets for AI training data
            </p>
          </div>
        </div>

        {/* Configuration */}
        <div className={getCardStyle('secondary')} style={{ marginTop: '1.5rem' }}>
          <div className="p-6">
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
              Processing Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Processing Priority
                </label>
                <select
                  value={processingPriority}
                  onChange={(e) => setProcessingPriority(e.target.value as any)}
                  className={getFormFieldStyle()}
                  disabled={processing}
                >
                  <option value="high">High - Process immediately</option>
                  <option value="medium">Medium - Standard processing</option>
                  <option value="low">Low - Background processing</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Batch Size (files processed simultaneously)
                </label>
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  className={getFormFieldStyle()}
                  disabled={processing}
                >
                  <option value={5}>5 files (Conservative)</option>
                  <option value={10}>10 files (Recommended)</option>
                  <option value={20}>20 files (Fast)</option>
                  <option value={50}>50 files (Aggressive)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Area */}
        <div className={getCardStyle('secondary')} style={{ marginTop: '1.5rem' }}>
          <div className="p-6">
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
              Upload Delivery Dockets
            </h2>
            
            {/* Drop Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                isDragActive 
                  ? 'border-blue-400 bg-blue-500/10' 
                  : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
              }`}
            >
              <input {...getInputProps()} />
              
              <div className="space-y-3">
                <div className="text-4xl">📁</div>
                {isDragActive ? (
                  <p className="text-blue-400 font-medium">Drop files here...</p>
                ) : (
                  <div>
                    <p className="text-white font-medium mb-2">
                      Drag & drop delivery dockets here, or click to select
                    </p>
                    <p className="text-sm text-slate-400">
                      Supports: JPG, PNG, HEIC, HEIF • Multiple files accepted
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">
                    Selected Files ({files.length})
                  </h3>
                  <button
                    onClick={clearAll}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    disabled={processing}
                  >
                    Clear All
                  </button>
                </div>

                {/* File Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{files.length}</div>
                    <div className="text-sm text-slate-400">Files</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{formatFileSize(totalSize)}</div>
                    <div className="text-sm text-slate-400">Total Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      ~{Math.ceil(estimatedProcessingTime / 60)}m
                    </div>
                    <div className="text-sm text-slate-400">Est. Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.ceil(files.length / batchSize)}
                    </div>
                    <div className="text-sm text-slate-400">Batches</div>
                  </div>
                </div>

                {/* File List (show first 10, then summary) */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {files.slice(0, 10).map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-blue-400">📄</div>
                        <div>
                          <div className="text-sm font-medium text-white truncate max-w-xs">
                            {file.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                        disabled={processing}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  {files.length > 10 && (
                    <div className="text-center text-slate-400 text-sm py-2">
                      ... and {files.length - 10} more files
                    </div>
                  )}
                </div>

                {/* Processing Button */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={startBulkProcessing}
                    disabled={processing || files.length === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    {processing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                        {progress && (
                          <span>({progress.current}/{progress.total})</span>
                        )}
                      </div>
                    ) : (
                      `Process ${files.length} Files`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className={getCardStyle('primary')} style={{ marginTop: '1.5rem' }}>
            <div className="p-6">
              <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
                Processing Results
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-white">{results.total}</div>
                  <div className="text-sm text-slate-400">Total Files</div>
                </div>
                <div className="text-center p-4 bg-green-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{results.processed}</div>
                  <div className="text-sm text-slate-400">Processed</div>
                </div>
                <div className="text-center p-4 bg-blue-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{results.uploaded}</div>
                  <div className="text-sm text-slate-400">Uploaded</div>
                </div>
                <div className="text-center p-4 bg-red-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-red-400">{results.failed}</div>
                  <div className="text-sm text-slate-400">Failed</div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-white">Errors</h3>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {results.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-400 p-2 bg-red-900/20 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.processed > 0 && (
                <div className="mt-6 flex gap-4">
                  <a
                    href="/upload/training"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Start Training Review ({results.processed} records)
                  </a>
                  <a
                    href="/console/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    View in Dashboard
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}