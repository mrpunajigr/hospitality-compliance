'use client'

import { useState } from 'react'

export default function SimpleBulkTrainingUploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles(selectedFiles)
    setResult(null)
  }

  const startBulkProcessing = async () => {
    if (files.length === 0) {
      setResult('No files selected')
      return
    }

    setProcessing(true)
    setResult('Processing...')

    try {
      const formData = new FormData()
      
      // Add configuration
      formData.append('clientId', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
      formData.append('userId', 'demo-user-id')
      formData.append('processingPriority', 'medium')
      formData.append('batchSize', '10')

      // Add all files
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })

      console.log(`🚀 Starting bulk upload of ${files.length} files...`)

      const response = await fetch('/api/debug-upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Bulk processing failed')
      }

      const data = await response.json()
      console.log('✅ Bulk processing completed:', data)
      
      setResult(`Success! Processed ${data.results.processed} of ${data.results.total} files`)
      
      // Clear files on success
      if (data.results.processed > 0) {
        setFiles([])
      }

    } catch (error) {
      console.error('❌ Bulk processing error:', error)
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto bg-white/10 rounded-lg p-8">
        
        <h1 className="text-2xl font-bold text-white mb-6">
          Simple Bulk Upload Test
        </h1>
        
        <div className="space-y-6">
          
          {/* File Input */}
          <div>
            <label className="block text-white mb-2">
              Select Files:
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="block w-full text-white bg-gray-800 rounded p-2"
            />
          </div>
          
          {/* Selected Files */}
          {files.length > 0 && (
            <div>
              <p className="text-white mb-2">Selected Files ({files.length}):</p>
              <ul className="text-gray-300 text-sm">
                {files.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Process Button */}
          <button
            onClick={startBulkProcessing}
            disabled={files.length === 0 || processing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            {processing ? 'Processing...' : `Process ${files.length} Files`}
          </button>
          
          {/* Result */}
          {result && (
            <div className="p-4 bg-gray-800 rounded text-white">
              {result}
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}