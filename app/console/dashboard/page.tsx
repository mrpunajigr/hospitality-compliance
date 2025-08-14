'use client'

// Demo Dashboard Page - Enhanced with intelligent insights
import { useState, useEffect } from 'react'
import SafariCompatibleUpload from '../../components/delivery/SafariCompatibleUpload'
import ComplianceDashboard from '../../components/compliance/ComplianceDashboard'
import EnhancedComplianceDashboard from '../../components/compliance/EnhancedComplianceDashboard'
import DeliveryTracker from '../../components/delivery/DeliveryTracker'
import { supabase } from '@/lib/supabase'
import { getVersionDisplay } from '@/lib/version'
import { DesignTokens, getCardStyle, getTextStyle } from '@/lib/design-system'
import { getUserClient, UserClient } from '@/lib/auth-utils'


export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'dashboard' | 'tracking'>('dashboard')
  const [lastUpload, setLastUpload] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        // Get user's client/company information
        try {
          const clientInfo = await getUserClient(user.id)
          if (clientInfo) {
            setUserClient(clientInfo)
          } else {
            console.log('ℹ️ User has no associated company - company setup needed')
          }
        } catch (error) {
          console.log('ℹ️ Company association not found - this is expected for new users')
          // Continue without client info - this is normal for users without companies
        }
      } else {
        // No user found - redirect to sign in
        window.location.href = '/signin'
      }
      setLoading(false)
    }
    
    checkAuth()
    
    // Listen for auth changes - but preserve demo user if no real session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        const clientInfo = await getUserClient(session.user.id)
        setUserClient(clientInfo)
      } else {
        setUser(null)
        setUserClient(null)
      }
    })

    return () => subscription.unsubscribe()
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

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className={`${getCardStyle('primary')} max-w-md w-full`}>
            <div className="text-center">
              <h1 className={`${getTextStyle('pageTitle')} text-white mb-2`}>
                Hospitality Compliance
              </h1>
              <p className={`${getTextStyle('bodySecondary')} text-white/80 mb-6`}>
                Please sign in to access the dashboard
              </p>
              
              <a
                href="/signin"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] mb-4 block text-center"
              >
                Sign In
              </a>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <p className="text-xs text-white/80">
                  Please sign in to access your dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleUploadSuccess = (deliveryRecord: any) => {
    console.log('Upload successful:', deliveryRecord)
    setLastUpload(deliveryRecord)
    
    // No alert - dashboard will show visual update with color-coded cards
    // Switch to dashboard to see results
    setTimeout(() => {
      setActiveTab('dashboard')
    }, 1000) // Reduced delay since no alert
  }

  const handleUploadError = (error: string) => {
    console.error('Upload failed:', error)
    // Error logged to console - no blocking alert
    // Dashboard will show failed status with red card tint
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Content - Takes up 3 columns */}
        <div className="lg:col-span-3">

          {/* Content */}
          {activeTab === 'dashboard' && (
            <>
              {userClient?.id ? (
                <EnhancedComplianceDashboard 
                  clientId={userClient.id}
                  userId={user.id}
                />
              ) : (
                <div className={getCardStyle('primary')}>
                  <div className="text-center py-12">
                    <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
                      Welcome to Your Dashboard
                    </h2>
                    <p className={`${getTextStyle('body')} text-white/80 mb-6`}>
                      Your account was created successfully. Company setup is in progress.
                    </p>
                    <div className="bg-blue-600/20 border border-blue-400/30 rounded-xl p-4">
                      <p className="text-blue-200 text-sm">
                        Please contact support to complete your company setup.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'tracking' && (
            <>
              {userClient?.id ? (
                <DeliveryTracker 
                  clientId={userClient.id}
                  userId={user.id}
                  onDeliveryEvent={(event) => {
                    console.log('Delivery event:', event)
                  }}
                />
              ) : (
                <div className={getCardStyle('primary')}>
                  <div className="text-center py-12">
                    <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
                      Delivery Tracking
                    </h2>
                    <p className={`${getTextStyle('body')} text-white/80 mb-6`}>
                      Real-time delivery tracking requires company setup completion.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'upload' && (
            <div className={getCardStyle('primary')}>
                <h2 className={`${getTextStyle('sectionTitle')} text-white mb-6 text-center`}>
                  Upload Delivery Docket Photo
                </h2>
                
                <div className="mb-8">
                  {userClient?.id ? (
                    <SafariCompatibleUpload
                      clientId={userClient.id}
                      userId={user.id}
                      onUploadSuccess={handleUploadSuccess}
                      onUploadError={handleUploadError}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className={`${getTextStyle('body')} text-white/80`}>
                        Upload feature requires company setup completion.
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Instructions */}
                <div className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-white mb-4">
                    How It Works
                  </h3>
                  <ul className="text-sm text-white/80 space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Take a photo of your delivery docket
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      AI will automatically extract temperature data
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      System checks compliance against NZ food safety rules
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Get instant alerts for any violations
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      View results in the Compliance Dashboard
                    </li>
                  </ul>
                </div>

                {lastUpload && (
                  <div className="mt-6 bg-green-600/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-4">
                    <h4 className="font-medium text-green-200 mb-2">Last Upload</h4>
                    <p className="text-sm text-green-300">
                      Record ID: {lastUpload.id}<br/>
                      Status: Processing with AI...
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
                  <h3 className="font-semibold text-lg">Compliance Dashboard</h3>
                  <p className="text-sm mt-1 opacity-90">View metrics and alerts</p>
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
                  <h3 className="font-semibold text-lg">Delivery Tracking</h3>
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
                  <h3 className="font-semibold text-lg">Quick Upload</h3>
                  <p className="text-sm mt-1 opacity-90">Upload delivery documents</p>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  )
}