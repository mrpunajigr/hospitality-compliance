'use client'

// Upload Action - Core Module Functionality (Document Upload & Processing)
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EnhancedUpload from '../../components/delivery/EnhancedUpload'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { DesignTokens, getCardStyle, getTextStyle } from '@/lib/design-system'

export default function UploadActionPage() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpload, setLastUpload] = useState<any>(null)
  const [showNotification, setShowNotification] = useState(false)
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Module Action Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <span className="text-2xl">📤</span>
          </div>
          <div>
            <h1 className={`${getTextStyle('pageTitle')} text-white drop-shadow-lg`}>
              Upload Action
            </h1>
            <p className={`${getTextStyle('bodySmall')} text-white/90 drop-shadow-md`}>
              Upload and process delivery documents with AI compliance checking
            </p>
          </div>
        </div>

        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm mb-4">
          <a href="/upload/console" className="text-blue-300 hover:text-white transition-colors">
            Console
          </a>
          <span className="text-white/60">›</span>
          <span className="text-white">Action</span>
        </div>

        {/* User Context */}
        {userClient && (
          <p className="text-blue-300 text-sm">
            {userClient.name} • {userClient.role}
          </p>
        )}
        {user && !userClient && (
          <p className="text-blue-300 text-sm">
            {user.user_metadata?.full_name || user.email} • Demo Mode
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Action Interface - 3 columns */}
        <div className="lg:col-span-3">
          
          <div className={getCardStyle('primary')}>
            <div className="text-center mb-8">
              <h2 className={`${getTextStyle('sectionTitle')} text-white mb-2`}>
                Document Processing Interface
              </h2>
              <p className={`${getTextStyle('bodySmall')} text-white/80`}>
                Upload delivery dockets for AI-powered compliance analysis and violation detection
              </p>
            </div>

            {/* Action Interface - Enhanced Upload Component */}
            <div className="mb-8">
              <EnhancedUpload
                clientId={userClient?.id || ''}
                userId={user?.id || ''}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                onProgressUpdate={handleProgressUpdate}
                maxFiles={10}
                maxSizeMB={8}
              />
            </div>

            {/* Processing Information */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Processing Status */}
              <div className={getCardStyle('secondary')}>
                <h3 className={`${getTextStyle('cardTitle')} text-white mb-4`}>
                  Real-time Processing
                </h3>
                <ul className={`${getTextStyle('bodySmall')} text-white space-y-2`}>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    Document upload & validation
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    Google Cloud AI text extraction
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    NZ compliance rule checking
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    Violation detection & alerts
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    Dashboard data integration
                  </li>
                </ul>
              </div>

              {/* Action Settings */}
              <div className={getCardStyle('secondary')}>
                <h3 className={`${getTextStyle('cardTitle')} text-white mb-4`}>
                  Batch Settings
                </h3>
                <ul className={`${getTextStyle('bodySmall')} text-white space-y-2`}>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Maximum: 10 files per batch
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    File size limit: 8MB each
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Supported: PNG, JPG, PDF, HEIC
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Processing time: 5-10 seconds
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Auto-retry on network errors
                  </li>
                </ul>
              </div>
            </div>

            {/* Success Notification */}
            {lastUpload && showNotification && (
              <div 
                className="mt-8 bg-green-600/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-6 transition-all duration-500"
                style={{ 
                  opacity: showNotification ? 1 : 0,
                  transform: showNotification ? 'translateY(0)' : 'translateY(-10px)'
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-green-200">Processing Complete!</h4>
                  <button 
                    onClick={() => setShowNotification(false)}
                    className="text-green-300 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-green-300 mb-4">
                  Document successfully processed and compliance data updated.
                </p>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-white/80">
                    <strong>Record ID:</strong> {lastUpload.id}<br/>
                    <strong>Status:</strong> AI processing complete<br/>
                    <strong>Next:</strong> View results in Console or Reports
                  </p>
                </div>
              </div>
            )}

          </div>
          
        </div>

        {/* Action Sidebar - 1 column */}
        <div className="lg:col-span-1">
          <div className={getCardStyle('primary')}>
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-6`}>Quick Actions</h2>
            
            <div className="space-y-4">
              <button 
                onClick={() => router.push('/upload/console')}
                className="block w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 text-white py-4 px-6 rounded-xl transition-all duration-200 text-left"
              >
                <div>
                  <h3 className="font-semibold">📊 View Console</h3>
                  <p className="text-sm mt-1 opacity-90">Check dashboard overview</p>
                </div>
              </button>
              
              <button 
                onClick={() => router.push('/upload/reports')}
                className="block w-full bg-green-600/20 hover:bg-green-600/30 border border-green-400/30 text-white py-4 px-6 rounded-xl transition-all duration-200 text-left"
              >
                <div>
                  <h3 className="font-semibold">📋 View Reports</h3>
                  <p className="text-sm mt-1 opacity-90">Export compliance data</p>
                </div>
              </button>

              {/* Processing History */}
              <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/20">
                <h3 className="text-white font-semibold text-sm mb-2">Processing History</h3>
                <p className="text-white/70 text-xs">
                  Recent uploads and their processing status will appear here.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  )
}