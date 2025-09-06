'use client'

// Upload Capture - Document Upload Interface
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

export default function UploadCapturePage() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingComplete, setProcessingComplete] = useState(false)
  const [processingResults, setProcessingResults] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Simple authentication (matching console pattern)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUser(user)
          
          try {
            const clientInfo = await getUserClient(user.id)
            if (clientInfo) {
              setUserClient(clientInfo)
            }
          } catch (error) {
            console.error('Error loading client info:', error)
          }
        } else {
          // Demo mode fallback
          const demoUser = {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
            email: 'demo@example.com',
            app_metadata: {},
            user_metadata: { full_name: 'Demo User - Upload Capture' },
            aud: 'authenticated',
            role: 'authenticated',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setUser(demoUser)
        }
      } catch (error) {
        console.error('Authentication error:', error)
      }
      
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, etc.)')
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      
      setSelectedFile(file)
      setError('')
      setProcessingComplete(false)
      setProcessingResults(null)
    }
  }

  // Handle file upload and processing
  const handleUpload = async () => {
    if (!selectedFile || !user) return

    setIsProcessing(true)
    setError('')
    setUploadProgress(0)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('userId', user.id)
      
      if (userClient?.id) {
        formData.append('clientId', userClient.id)
      }

      // Upload with progress tracking
      const response = await fetch('/api/upload-docket', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      setUploadProgress(100)
      setProcessingResults(result)
      setProcessingComplete(true)
      
      // Clear the file input
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      console.log('✅ Upload successful:', result)

    } catch (error) {
      console.error('❌ Upload failed:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null)
    setError('')
    setProcessingComplete(false)
    setProcessingResults(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className={getCardStyle('primary')}>
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className={`${getTextStyle('body')} font-medium`}>Loading Upload Interface...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      
      {/* Capture Header */}
      <div className="mb-16">
        <div className="grid grid-cols-4 gap-6 items-center">
          <div className="flex items-center space-x-4 col-span-2">
            <div 
              className="w-24 h-24 bg-blue-600 rounded-lg flex items-center justify-center text-white text-4xl"
            >
              📤
            </div>
            <div>
              <h1 className={`${getTextStyle('pageTitle')} text-white drop-shadow-lg text-4xl font-bold`}>
                CAPTURE
              </h1>
              <p className="text-white/80 drop-shadow-md italic text-xs">
                Upload delivery dockets for processing with 4 core features
              </p>
              {userClient && (
                <p className="text-blue-300 text-sm mt-1">
                  {userClient.name} • {userClient.role}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex space-x-1 bg-black/20 p-0.5 rounded-full backdrop-blur-md border border-white/20">
              <a 
                href="/upload/console" 
                className="px-4 py-2 font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 text-sm TouchTarget"
              >
                Console
              </a>
              <a 
                href="/upload/capture" 
                className="px-4 py-2 font-semibold text-black bg-white rounded-full transition-all duration-300 text-sm TouchTarget"
              >
                Capture
              </a>
              <a 
                href="/upload/reports" 
                className="px-4 py-2 font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 text-sm TouchTarget"
              >
                Reports
              </a>
            </div>
          </div>
          <div></div>
        </div>
      </div>

      {/* Main Upload Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upload Card */}
        <div>
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              
              <h2 className={`${getTextStyle('sectionTitle')} text-white mb-6`}>Upload Document</h2>
              
              {!selectedFile ? (
                // File Selection Area
                <div 
                  className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-white/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-white text-lg font-semibold mb-2">Select Delivery Docket</h3>
                  <p className="text-white/70 text-sm mb-4">
                    Click to browse or drag and drop your delivery document
                  </p>
                  <p className="text-white/50 text-xs">
                    Supports: JPG, PNG, PDF (max 10MB)
                  </p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                // Selected File Preview
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">📄</div>
                      <div>
                        <p className="text-white font-medium">{selectedFile.name}</p>
                        <p className="text-white/70 text-sm">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-300 hover:text-red-200 p-2 rounded-full hover:bg-red-500/20 transition-colors"
                      title="Remove file"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Upload Progress */}
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-white/70 text-sm text-center">
                        Processing document... {uploadProgress}%
                      </p>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <button
                    onClick={handleUpload}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isProcessing ? 'Processing...' : 'Process Document'}
                  </button>
                </div>
              )}
              
              {/* Error Display */}
              {error && (
                <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results/Features Card */}
        <div>
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              
              <h2 className={`${getTextStyle('sectionTitle')} text-white mb-6`}>Processing Results</h2>
              
              {processingComplete && processingResults ? (
                // Success Results
                <div className="space-y-4">
                  <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="text-green-300 text-lg">✅</div>
                      <h3 className="text-green-200 font-semibold">Processing Complete</h3>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      {processingResults.supplier_name && (
                        <div>
                          <span className="text-green-200">Supplier:</span>
                          <span className="text-white ml-2">{processingResults.supplier_name}</span>
                        </div>
                      )}
                      {processingResults.delivery_date && (
                        <div>
                          <span className="text-green-200">Date:</span>
                          <span className="text-white ml-2">{processingResults.delivery_date}</span>
                        </div>
                      )}
                      {processingResults.item_count && (
                        <div>
                          <span className="text-green-200">Items:</span>
                          <span className="text-white ml-2">{processingResults.item_count} products</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => router.push('/upload/console')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    View in Console →
                  </button>
                </div>
              ) : (
                // 4 Core Features Display
                <div className="space-y-4">
                  <p className="text-white/70 text-sm mb-6">
                    Your document will be processed with these 4 core features:
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <div className="text-blue-300 text-lg">🏢</div>
                      <div>
                        <h4 className="text-white font-medium">Supplier Name</h4>
                        <p className="text-white/60 text-xs">Extract company/supplier information</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <div className="text-green-300 text-lg">📅</div>
                      <div>
                        <h4 className="text-white font-medium">Delivery Date</h4>
                        <p className="text-white/60 text-xs">Identify delivery date and time</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <div className="text-purple-300 text-lg">🖼️</div>
                      <div>
                        <h4 className="text-white font-medium">Thumbnail</h4>
                        <p className="text-white/60 text-xs">Generate document preview</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <div className="text-orange-300 text-lg">🔢</div>
                      <div>
                        <h4 className="text-white font-medium">Item Count</h4>
                        <p className="text-white/60 text-xs">Count products in delivery</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}