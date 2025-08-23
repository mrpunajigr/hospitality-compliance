'use client'

// Upload Action - Core Module Functionality (Document Upload & Processing)
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EnhancedUpload from '../../components/delivery/EnhancedUpload'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { DesignTokens, getCardStyle, getTextStyle } from '@/lib/design-system'
import { getModuleAsset, getMappedIcon } from '@/lib/image-storage'
import Image from 'next/image'
import EnhancedFileUpload from '@/lib/ImageProcessing/Components/EnhancedFileUpload'
import { QualityReport } from '@/lib/ImageProcessing/Utils/ImageQualityValidator'

export default function UploadActionPage() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpload, setLastUpload] = useState<any>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [showQualityUpload, setShowQualityUpload] = useState(false)
  const [queuedFiles, setQueuedFiles] = useState<Array<{file: File, qualityReport: QualityReport}>>([])
  const router = useRouter()

  // Authentication handled by upload layout
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        try {
          const clientInfo = await getUserClient(user.id)
          if (clientInfo) {
            setUserClient(clientInfo)
          }
        } catch (error) {
          console.error('Error loading client info in compliance action:', error)
        }
      } else {
        // Check for demo mode - Compliance path triggers demo mode automatically
        const isDemoMode = typeof window !== 'undefined' && (
          window.location.pathname.startsWith('/compliance') ||
          new URLSearchParams(window.location.search).get('demo') === 'true' ||
          document.cookie.includes('demo-session=active')
        )
        
        if (isDemoMode) {
          console.log('🚀 Upload Action demo mode detected')
          const demoUser = {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
            email: 'demo@example.com',
            app_metadata: {},
            user_metadata: { full_name: 'Demo User - Upload Action' },
            aud: 'authenticated',
            role: 'authenticated',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setUser(demoUser)
        }
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className={getCardStyle('primary')}>
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white font-medium">Loading Upload Action...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleUploadSuccess = (deliveryRecords: any[]) => {
    console.log('Compliance batch upload successful:', deliveryRecords)
    setLastUpload(deliveryRecords[deliveryRecords.length - 1])
    setShowNotification(true)
    
    // Auto-dismiss notification after 6 seconds
    setTimeout(() => {
      setShowNotification(false)
    }, 6000)
  }

  const handleUploadError = (error: string) => {
    console.error('Compliance batch upload failed:', error)
  }

  const handleProgressUpdate = (completedCount: number, totalCount: number) => {
    console.log(`Compliance upload progress: ${completedCount}/${totalCount} files completed`)
  }

  const handleFileValidated = (file: File, qualityReport: QualityReport) => {
    console.log('File validated for OCR:', file.name, 'Quality score:', qualityReport.score)
    setQueuedFiles(prev => [...prev, { file, qualityReport }])
  }

  const handleFileRejected = (file: File, qualityReport: QualityReport) => {
    console.log('File rejected due to poor quality:', file.name, 'Quality score:', qualityReport.score)
    // Still allow manual override via the quality indicator buttons
  }

  // Camera capture function
  const handleCameraCapture = () => {
    // Create a file input element for camera capture
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' // Use back camera on mobile devices
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log('📸 Camera capture file selected:', file.name)
        // Trigger the enhanced upload component's file processing
        const fileUploadComponent = document.querySelector('[data-file-upload]') as any
        if (fileUploadComponent && fileUploadComponent._handleFileSelect) {
          fileUploadComponent._handleFileSelect([file])
        } else {
          // Fallback: trigger file validation directly
          handleFileValidated(file, { score: 0.8, issues: [], suggestions: [] })
        }
      }
    }
    
    // Trigger the file picker
    input.click()
  }

  const processQueuedFiles = async () => {
    if (queuedFiles.length === 0) return

    console.log(`Processing ${queuedFiles.length} files with quality validation`)
    // Here you would integrate with the existing EnhancedUpload component
    // For now, we'll just simulate processing
    
    setLastUpload({
      id: Date.now(),
      supplier_name: 'Quality Enhanced Upload',
      created_at: new Date().toISOString(),
      image_path: URL.createObjectURL(queuedFiles[0].file)
    })
    
    setQueuedFiles([])
    setShowNotification(true)
    
    setTimeout(() => {
      setShowNotification(false)
    }, 6000)
  }

  const removeFromQueue = (index: number) => {
    setQueuedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      
      {/* Console Header */}
      <div className="mb-16">
        <div className="grid grid-cols-4 gap-6 items-center">
          <div className="flex items-center space-x-4 col-span-2">
            <Image 
              src={getModuleAsset('icons/JiGRupload', { width: 96, height: 96 })} 
              alt="Upload Module" 
              width={96} 
              height={96}
              className="object-contain"
            />
            <div>
              <h1 className={`${getTextStyle('pageTitle')} text-white drop-shadow-lg text-4xl font-bold`}>
                UPLOAD
              </h1>
              <p className="text-white/80 drop-shadow-md italic text-xs">
                Document upload, processing, and compliance management
              </p>
              {userClient && (
                <p className="text-blue-300 text-sm mt-1">
                  {userClient.name} • {userClient.role}
                </p>
              )}
              {user && !userClient && (
                <p className="text-blue-300 text-sm mt-1">
                  {user.user_metadata?.full_name || user.email} • Demo Mode
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex space-x-1 bg-black/20 p-0.5 rounded-full backdrop-blur-md border border-white/20">
              <a 
                href="/upload/console" 
                className="px-4 py-2 font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 text-sm"
              >
                Console
              </a>
              <a 
                href="/upload/capture" 
                className="px-4 py-2 font-semibold text-black bg-white rounded-full transition-all duration-300 text-sm"
              >
                Capture
              </a>
              <a 
                href="/upload/reports" 
                className="px-4 py-2 font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 text-sm"
              >
                Reports
              </a>
            </div>
          </div>
          <div></div>
        </div>
      </div>

      {/* Capture Interface Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Quick Capture Card */}
        <div 
          className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-white text-lg font-semibold text-center w-full">Quick Capture</h2>
            </div>
            <div className="text-center mb-6">
              <img 
                src={getMappedIcon('JiGRcamera', 64)} 
                alt="Camera" 
                className="w-16 h-16 object-contain mx-auto mb-4"
              />
            </div>
            <div 
              className="w-full rounded-xl relative overflow-hidden"
            >
              <button 
                data-camera-trigger
                onClick={handleCameraCapture}
                className="w-full text-white py-3 px-4 transition-all duration-300 text-sm font-semibold bg-white/5 hover:bg-white/15 border border-white/20 rounded-xl hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98]"
              >
                Camera Capture
              </button>
            </div>
            <p className="text-blue-200 text-xs mt-2 text-center">
              Single document capture
            </p>
          </div>
        </div>

        {/* Bulk Upload Card */}
        <div 
          className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-white text-lg font-semibold text-center w-full">Bulk Upload</h2>
            </div>
            <div className="text-center mb-6">
              <img 
                src={getMappedIcon('JiGRbulk', 64)} 
                alt="Bulk Upload" 
                className="w-16 h-16 object-contain mx-auto mb-4"
              />
            </div>
            <div 
              className="w-full rounded-xl relative overflow-hidden"
            >
              <button 
                onClick={() => setShowQualityUpload(true)}
                className="w-full text-white py-3 px-4 transition-all duration-300 text-sm font-semibold bg-white/5 hover:bg-white/15 border border-white/20 rounded-xl hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02] active:scale-[0.98]"
              >
                Select Files
              </button>
            </div>
            <p className="text-purple-200 text-xs mt-2 text-center">
              Multiple file upload with quality validation
            </p>
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-purple-200/70 text-xs text-center">
                PNG, JPG, PDF, HEIC
              </p>
              <p className="text-purple-200/70 text-xs text-center">
                Max 8MB each • OCR optimized
              </p>
            </div>
          </div>
        </div>

        {/* Ready Queue Card */}
        <div 
          className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-white text-lg font-semibold text-center w-full">Ready Queue</h2>
            </div>
            <div className="text-center mb-6">
              <img 
                src={getMappedIcon('JiGRqueue', 64)} 
                alt="Queue" 
                className="w-16 h-16 object-contain mx-auto mb-4"
              />
            </div>
            <div 
              className={`w-full rounded-xl relative overflow-hidden mb-4 ${queuedFiles.length === 0 ? 'opacity-50' : ''}`}
            >
              <button 
                disabled={queuedFiles.length === 0}
                onClick={processQueuedFiles}
                className={`w-full py-3 px-4 text-sm font-semibold transition-all duration-300 border rounded-xl ${
                  queuedFiles.length === 0 
                    ? 'text-green-300/50 cursor-not-allowed bg-white/5 border-white/10' 
                    : 'text-green-300 bg-white/5 hover:bg-white/15 border-white/20 hover:shadow-lg hover:shadow-green-500/10 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                Process Queue
              </button>
            </div>
            <p className="text-green-200 text-xs text-center">
              {queuedFiles.length} Images ready
            </p>
          </div>
        </div>

      </div>

      {/* Quality Upload Interface */}
      {showQualityUpload && (
        <div className="mb-8">
          <div 
            className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 relative overflow-hidden"
            style={{
              backgroundImage: 'url(/LiquidGlassAssets/Container.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-lg font-bold">Quality-Enhanced Upload</h3>
                <button
                  onClick={() => setShowQualityUpload(false)}
                  className="text-white/70 hover:text-white transition-colors duration-200 p-1 hover:bg-white/10 rounded-md"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div data-file-upload>
                <EnhancedFileUpload
                  onFileValidated={handleFileValidated}
                  onFileRejected={handleFileRejected}
                  allowPoorQuality={true}
                  className="mb-6"
                />
              </div>

              {/* Queued Files List */}
              {queuedFiles.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <h4 className="text-white text-sm font-medium mb-4">Quality Validated Files ({queuedFiles.length})</h4>
                  <div className="space-y-3">
                    {queuedFiles.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{item.file.name}</p>
                            <p className="text-white/60 text-xs">
                              Quality: {item.qualityReport.score}% • {(item.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromQueue(index)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200 p-1 hover:bg-red-500/10 rounded-md"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Upload Results */}
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            {lastUpload ? (
          <div 
            className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-6 relative overflow-hidden"
            style={{
              backgroundImage: 'url(/LiquidGlassAssets/Container.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-green-300 text-sm font-medium">Latest Upload</span>
              </div>
              <div className="flex items-center space-x-4">
                {/* Thumbnail */}
                {lastUpload.image_path && (
                  <div className="w-16 h-16 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={lastUpload.image_path} 
                      alt="Upload thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {/* Supplier Info */}
                <div className="flex-1">
                  <div className="text-lg font-bold text-white mb-1">
                    {lastUpload.supplier_name || lastUpload.supplier_info || lastUpload.supplier || lastUpload.company_name || 'Processing...'}
                  </div>
                  <div className="text-green-200 text-sm">
                    {new Date(lastUpload.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-6 relative overflow-hidden"
            style={{
              backgroundImage: 'url(/LiquidGlassAssets/Container.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-center mb-2">
                <h2 className="text-white text-lg font-semibold text-center w-full">No Uploads Today</h2>
              </div>
            </div>
          </div>
            )}
          </div>
          
          {/* Tips Card - 3rd Column */}
          <div>
            <div 
              className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-6 relative overflow-hidden"
              style={{
                backgroundImage: 'url(/LiquidGlassAssets/Container.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-center mb-4">
                  <h2 className="text-white text-lg font-semibold text-center w-full">Capture Tips</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-black/60 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-black text-sm">
                      Ensure good lighting for clear text
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-black/60 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-black text-sm">
                      Keep document flat and straight
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-black/60 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-black text-sm">
                      Include full document in frame
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-black/60 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-black text-sm">
                      Avoid shadows and glare
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  )
}