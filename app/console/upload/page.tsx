'use client'

// Upload Page - Enhanced batch upload functionality  
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EnhancedUpload from '../../components/delivery/EnhancedUpload'
import SafariCompatibleUpload from '../../components/delivery/SafariCompatibleUpload'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { DesignTokens, getCardStyle, getTextStyle } from '@/lib/design-system'

export default function UploadPage() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpload, setLastUpload] = useState<any>(null)
  const [showNotification, setShowNotification] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        // Get user's company information
        try {
          const clientInfo = await getUserClient(user.id)
          if (clientInfo) {
            setUserClient(clientInfo)
          }
        } catch (error) {
          console.error('Error loading client info in upload page:', error)
        }
      } else {
        // Auto sign-in with demo user for smoother development experience
        const demoUser = {
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
          email: 'demo@example.com',
          app_metadata: {},
          user_metadata: { full_name: 'Demo User' },
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setUser(demoUser)
      }
      setLoading(false)
    }
    
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        setUser(session.user)
      }
      // Don't set user to null if session is null - preserve demo user
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleDemoSignIn = async () => {
    try {
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
      
      if (!anonError && anonData.user) {
        console.log('Anonymous demo user signed in successfully')
        return
      }

      // Fallback to demo user
      const demoUser = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
        email: 'demo@example.com',
        app_metadata: {},
        user_metadata: { full_name: 'Demo User' },
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setUser(demoUser)
    } catch (error) {
      console.error('Demo sign in failed:', error)
      
      // Fallback to demo user
      const demoUser = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
        email: 'demo@example.com',
        app_metadata: {},
        user_metadata: { full_name: 'Demo User' },
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setUser(demoUser)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className={getCardStyle('primary')}>
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white font-medium">Loading Upload...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg max-w-md w-full">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-2">
                Upload Delivery Docket
              </h1>
              <p className="text-white/80 text-sm mb-6">
                Please sign in to upload documents
              </p>
              
              <button
                onClick={handleDemoSignIn}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] mb-4"
              >
                Sign In as Demo User
              </button>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <p className="text-xs text-white/80">
                  Demo mode with test compliance data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleUploadSuccess = (deliveryRecords: any[]) => {
    console.log('Batch upload successful:', deliveryRecords)
    setLastUpload(deliveryRecords[deliveryRecords.length - 1]) // Show last uploaded record
    setShowNotification(true)
    
    // Auto-dismiss notification after 6 seconds for batch uploads
    setTimeout(() => {
      setShowNotification(false)
    }, 6000)
    
    // Stay on upload page for additional batch uploads
  }

  const handleUploadError = (error: string) => {
    console.error('Batch upload failed:', error)
    // TODO: Show error notification to user
  }

  const handleProgressUpdate = (completedCount: number, totalCount: number) => {
    console.log(`Upload progress: ${completedCount}/${totalCount} files completed`)
    // Could add progress state here if needed
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header - Exact Dashboard Style */}
      <div className="mb-8">
        <h1 className={`${getTextStyle('pageTitle')} text-white drop-shadow-lg`}>
          Upload Delivery Dockets
        </h1>
        <p className={`${getTextStyle('bodySmall')} text-white/90 drop-shadow-md`}>
          Upload multiple delivery documents for batch processing with AI
        </p>
        {userClient && (
          <p className="text-blue-300 text-sm mt-2">
            {userClient.name} • {userClient.role}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Content - Takes up 3 columns */}
        <div className="lg:col-span-3">
          
          <div className={getCardStyle('primary')}>
            <div className="text-center mb-8">
              <h2 className={`${getTextStyle('sectionTitle')} text-white mb-2`}>
                Batch Upload Delivery Documents
              </h2>
              <p className={`${getTextStyle('bodySmall')} text-white/80`}>
                Upload multiple delivery dockets simultaneously for efficient processing
              </p>
            </div>

            {/* Enhanced Batch Upload Component */}
            <div className="mb-8">
              <EnhancedUpload
                clientId={userClient?.id || ''}
                userId={user.id}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                onProgressUpdate={handleProgressUpdate}
                maxFiles={10}
                maxSizeMB={8}
              />
            </div>

            {/* Instructions */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Batch Upload Tips */}
              <div className={getCardStyle('secondary')}>
                <h3 className={`${getTextStyle('cardTitle')} text-white mb-4`}>
                  Batch Upload Tips
                </h3>
                <ul className={`${getTextStyle('bodySmall')} text-white space-y-2`}>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Select up to 10 delivery dockets at once
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Each file must be under 8MB
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Preview files before uploading
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Monitor progress for each document
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Retry individual failed uploads
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    Ensure good lighting and clarity
                  </li>
                </ul>
              </div>

              {/* AI Processing */}
              <div className={getCardStyle('secondary')}>
                <h3 className={`${getTextStyle('cardTitle')} text-white mb-4`}>
                  AI Processing
                </h3>
                <ul className={`${getTextStyle('bodySmall')} text-white space-y-2`}>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Extracts delivery information
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Identifies supplier information
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Checks NZ compliance rules
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Generates violation alerts
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Updates dashboard metrics
                  </li>
                </ul>
              </div>
            </div>

            {/* Success notification with auto-dismiss */}
            {lastUpload && showNotification && (
              <div 
                className="mt-8 bg-green-600/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-6 transition-opacity duration-500"
                style={{ 
                  opacity: showNotification ? 1 : 0,
                  transform: showNotification ? 'translateY(0)' : 'translateY(-10px)'
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-green-200">Upload Successful!</h4>
                  <button 
                    onClick={() => setShowNotification(false)}
                    className="text-green-300 hover:text-white transition-colors"
                    aria-label="Dismiss notification"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-green-300 mb-4">
                  Your delivery docket has been uploaded and is being processed.
                </p>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-white/80">
                    <strong>Record ID:</strong> {lastUpload.id}<br/>
                    <strong>Status:</strong> Processing with AI...<br/>
                    <strong>Next:</strong> Results will appear in your dashboard
                  </p>
                </div>
                <div className="mt-3 text-xs text-green-400">
                  This notification will auto-dismiss in 4 seconds
                </div>
              </div>
            )}

          </div>
          
        </div>

        {/* Right Column - Upload Actions Sidebar - Takes up 1 column */}
        <div className="lg:col-span-1">
          <div className={getCardStyle('primary')}>
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-6`}>Upload Actions</h2>
            
            <div>
              <button 
                onClick={() => router.push('/console/dashboard')}
                className="block w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl transition-all duration-200 text-left"
              >
                <div>
                  <h3 className="font-semibold text-lg">View Dashboard</h3>
                  <p className="text-sm mt-1 opacity-90">Check compliance metrics</p>
                </div>
              </button>
              
              <button 
                onClick={() => router.push('/workspace/reports')}
                className="block w-full bg-white/20 hover:bg-white/30 text-white py-4 px-6 rounded-xl transition-all duration-200 text-left"
              >
                <div>
                  <h3 className="font-semibold text-lg">Generate Report</h3>
                  <p className="text-sm mt-1 opacity-90">Export compliance data</p>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  )
}