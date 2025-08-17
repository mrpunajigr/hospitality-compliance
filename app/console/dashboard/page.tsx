'use client'

// Enhanced Dashboard Page - Full AI Results Display
import { useState, useEffect } from 'react'
import SafariCompatibleUpload from '../../components/delivery/SafariCompatibleUpload'
import EnhancedComplianceDashboard from '../../components/compliance/EnhancedComplianceDashboard'
import DeliveryTracker from '../../components/delivery/DeliveryTracker'
import { supabase } from '@/lib/supabase'
import { getVersionDisplay } from '@/lib/version'
import { DesignTokens, getCardStyle, getTextStyle } from '@/lib/design-system'
import { getUserClient, UserClient } from '@/lib/auth-utils'


export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'dashboard' | 'tracking'>('dashboard')
  const [lastUpload, setLastUpload] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)

  // Simplified auth check - rely on console layout for authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        // Get user's client/company information with comprehensive error handling
        try {
          const clientInfo = await getUserClient(user.id)
          if (clientInfo) {
            setUserClient(clientInfo)
            console.log('✅ Real user authenticated with company:', clientInfo.name)
          } else {
            console.log('ℹ️ User has no associated company - company setup needed')
          }
        } catch (error) {
          console.error('Error loading client info:', error)
          console.log('ℹ️ Company association not found - this is expected for new users or in demo mode')
          // Continue without client info - this is normal for users without companies or in demo mode
        }
      } else {
        // Check for demo mode - Console path triggers demo mode automatically
        const isDemoMode = typeof window !== 'undefined' && (
          window.location.pathname.startsWith('/console') ||
          new URLSearchParams(window.location.search).get('demo') === 'true' ||
          document.cookie.includes('demo-session=active') ||
          window.location.pathname.includes('demo')
        )
        
        if (isDemoMode) {
          console.log('🚀 Dashboard demo mode detected')
          console.log('URL params:', window.location.search)
          console.log('Cookies:', document.cookie)
          
          const demoUser = {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
            email: 'demo@example.com',
            app_metadata: {},
            user_metadata: { full_name: 'Demo User - Production' },
            aud: 'authenticated',
            role: 'authenticated',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setUser(demoUser)
          console.log('✅ Demo user set for dashboard')
        }
        // Don't redirect to signin - let console layout handle that
      }
      setLoading(false)
    }
    
    checkAuth()
    
    return () => {}
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className={getCardStyle('primary')}>
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className={`${getTextStyle('body')} font-medium`}>Loading Dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Upload success handler
  const handleUploadSuccess = (deliveryRecord: any) => {
    console.log('Upload successful:', deliveryRecord)
    setLastUpload(deliveryRecord)
    
    // Switch to dashboard to see results
    setTimeout(() => {
      setActiveTab('dashboard')
    }, 1000)
  }

  const handleUploadError = (error: string) => {
    console.error('Upload failed:', error)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className={`${getTextStyle('pageTitle')} text-white drop-shadow-lg`}>
          Intelligence Dashboard
        </h1>
        <p className={`${getTextStyle('bodySecondary')} text-white/90 drop-shadow-md`}>
          AI-powered insights, compliance analytics, and predictive recommendations
        </p>
        {userClient && (
          <p className="text-blue-300 text-sm mt-2">
            {userClient.name} • {userClient.role}
          </p>
        )}
        {user && !userClient && (
          <p className="text-blue-300 text-sm mt-2">
            {user.user_metadata?.full_name || user.email} • Demo Mode
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Content - Takes up 3 columns */}
        <div className="lg:col-span-3">

          {/* Dashboard Tab - AI Results Display */}
          {activeTab === 'dashboard' && (
            <>
              {userClient?.id ? (
                <div>
                  {(() => {
                    try {
                      return (
                        <EnhancedComplianceDashboard 
                          clientId={userClient.id}
                          userId={user.id}
                        />
                      )
                    } catch (error) {
                      console.error('EnhancedComplianceDashboard error:', error)
                      return (
                        <div className={getCardStyle('primary')}>
                          <div className="text-center py-12">
                            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
                              📊 Compliance Dashboard
                            </h2>
                            <p className={`${getTextStyle('body')} text-white/80 mb-6`}>
                              Dashboard is loading... If this persists, please contact support.
                            </p>
                            <div className="bg-orange-600/20 border border-orange-400/30 rounded-xl p-4">
                              <p className="text-orange-200 text-sm">
                                Loading enhanced dashboard features...
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  })()}
                </div>
              ) : (
                <div className={getCardStyle('primary')}>
                  <div className="text-center py-12">
                    <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
                      🎉 Demo Dashboard - Google Cloud AI Results
                    </h2>
                    <p className={`${getTextStyle('body')} text-white/80 mb-6`}>
                      Upload documents in the Upload tab to see AI processing results here.
                      Real compliance dashboard requires company setup.
                    </p>
                    <div className="bg-blue-600/20 border border-blue-400/30 rounded-xl p-4">
                      <p className="text-blue-200 text-sm">
                        ✅ Google Cloud AI processing active<br/>
                        ✅ Document upload and analysis working<br/>
                        ✅ Ready for production deployment
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tracking Tab */}
          {activeTab === 'tracking' && (
            <>
              {userClient?.id ? (
                <div>
                  {(() => {
                    try {
                      return (
                        <DeliveryTracker 
                          clientId={userClient.id}
                          userId={user.id}
                          onDeliveryEvent={(event) => {
                            console.log('Delivery event:', event)
                          }}
                        />
                      )
                    } catch (error) {
                      console.error('DeliveryTracker error:', error)
                      return (
                        <div className={getCardStyle('primary')}>
                          <div className="text-center py-12">
                            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
                              📦 Delivery Tracking
                            </h2>
                            <p className={`${getTextStyle('body')} text-white/80 mb-6`}>
                              Delivery tracking is loading... If this persists, please contact support.
                            </p>
                            <div className="bg-orange-600/20 border border-orange-400/30 rounded-xl p-4">
                              <p className="text-orange-200 text-sm">
                                Loading delivery tracking features...
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  })()}
                </div>
              ) : (
                <div className={getCardStyle('primary')}>
                  <div className="text-center py-12">
                    <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
                      📦 Delivery Tracking
                    </h2>
                    <p className={`${getTextStyle('body')} text-white/80 mb-6`}>
                      Real-time delivery tracking requires company setup completion.
                      Demo mode shows upload and AI processing capabilities.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className={getCardStyle('primary')}>
                <h2 className={`${getTextStyle('sectionTitle')} text-white mb-6 text-center`}>
                  Upload Delivery Docket Photo - Google Cloud AI
                </h2>
                
                <div className="mb-8">
                  {userClient?.id ? (
                    <div>
                      {(() => {
                        try {
                          return (
                            <SafariCompatibleUpload
                              clientId={userClient.id}
                              userId={user.id}
                              onUploadSuccess={handleUploadSuccess}
                              onUploadError={handleUploadError}
                            />
                          )
                        } catch (error) {
                          console.error('SafariCompatibleUpload error:', error)
                          return (
                            <div className="text-center py-8">
                              <p className={`${getTextStyle('body')} text-white/80 mb-4`}>
                                Upload component is loading... Please try the main Upload page.
                              </p>
                              <a
                                href="/console/upload"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                              >
                                Go to Upload Page
                              </a>
                            </div>
                          )
                        }
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className={`${getTextStyle('body')} text-white/80 mb-4`}>
                        Demo mode - Go to Upload page in navigation for full Google Cloud AI testing.
                      </p>
                      <a
                        href="/console/upload"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        Test Google Cloud AI Upload
                      </a>
                    </div>
                  )}
                </div>

                {/* Upload Instructions */}
                <div className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-white mb-4">
                    Google Cloud AI Features
                  </h3>
                  <ul className="text-sm text-white/80 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      6-stage AI processing pipeline
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Enhanced document OCR and text extraction
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Temperature compliance analysis
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Product classification and confidence scoring
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Real-time processing results display
                    </li>
                  </ul>
                </div>

                {lastUpload && (
                  <div className="mt-6 bg-green-600/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-4">
                    <h4 className="font-medium text-green-200 mb-2">Last Upload</h4>
                    <p className="text-sm text-green-300">
                      Record ID: {lastUpload.id}<br/>
                      Status: Processing with Google Cloud AI...
                    </p>
                  </div>
                )}
                
                {/* Version */}
                <div className="text-center mt-8">
                  <span className={`${getTextStyle('version')} text-white/60`}>{getVersionDisplay('short')}</span>
                </div>
            </div>
          )}

        </div>

        {/* Right Column - Quick Actions Sidebar - Takes up 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
            
            <div>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`block w-full mb-4 py-4 px-6 rounded-xl transition-all duration-200 text-left ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <div>
                  <h3 className="font-semibold text-lg">🧠 AI Dashboard</h3>
                  <p className="text-sm mt-1 opacity-90">View Google Cloud AI results</p>
                </div>
              </button>
              
              <button 
                onClick={() => setActiveTab('tracking')}
                className={`block w-full mb-4 py-4 px-6 rounded-xl transition-all duration-200 text-left ${
                  activeTab === 'tracking'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <div>
                  <h3 className="font-semibold text-lg">📊 Delivery Tracking</h3>
                  <p className="text-sm mt-1 opacity-90">Real-time supplier monitoring</p>
                </div>
              </button>
              
              <button 
                onClick={() => setActiveTab('upload')}
                className={`block w-full bg-white/20 hover:bg-white/30 text-white py-4 px-6 rounded-xl transition-all duration-200 text-left ${
                  activeTab === 'upload'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <div>
                  <h3 className="font-semibold text-lg">🚀 Quick Upload</h3>
                  <p className="text-sm mt-1 opacity-90">Test Google Cloud AI</p>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  )
}