'use client'

// Demo Dashboard Page - For testing the compliance platform functionality
import { useState, useEffect } from 'react'
import SafariCompatibleUpload from '../../components/delivery/SafariCompatibleUpload'
import ComplianceDashboard from '../../components/compliance/ComplianceDashboard'
import { supabase } from '@/lib/supabase'

// Demo data for testing (since we don't have auth yet)
const DEMO_CLIENT_ID = '550e8400-e29b-41d4-a716-446655440001' // From our seed data
const DEMO_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01' // From our seed data

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'dashboard'>('dashboard')
  const [lastUpload, setLastUpload] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
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
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Demo sign in function - create anonymous session for demo
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
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white font-medium">Loading Dashboard...</p>
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
                Hospitality Compliance
              </h1>
              <p className="text-white/80 text-sm mb-6">
                Please sign in to access the dashboard
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
      
      {/* Page Header - Exact Admin Portal Style */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Dashboard
        </h1>
        <p className="text-white/70 text-sm">
          AI-powered delivery tracking and compliance monitoring
        </p>
        <p className="text-blue-300 text-xs mt-1">
          Demo Mode
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Main Content - Takes up 3 columns */}
        <div className="lg:col-span-3">

          {/* Content */}
          {activeTab === 'dashboard' && (
            <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
              <ComplianceDashboard 
                clientId={DEMO_CLIENT_ID}
                userId={user.id}
              />
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-6 text-center">
                  Upload Delivery Docket Photo
                </h2>
                
                <div className="mb-8">
                  <SafariCompatibleUpload
                    clientId={DEMO_CLIENT_ID}
                    userId={user.id}
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                  />
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
                  <span className="text-white/60 text-sm">v1.8.6</span>
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