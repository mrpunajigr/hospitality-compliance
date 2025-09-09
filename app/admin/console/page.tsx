'use client'

// Admin Console - Business information and dashboard
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'
import { getModuleConfig } from '@/lib/module-config'
import { ModuleHeader } from '@/app/components/ModuleHeader'

export default function AdminConsolePage() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const handleDemoSignIn = async () => {
    try {
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
      
      if (!anonError && anonData.user) {
        console.log('Anonymous demo user signed in successfully')
        setUser(anonData.user)
        setLoading(false)
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
      setLoading(false)
      
    } catch (error) {
      console.error('Demo sign-in failed:', error)
      // Fallback demo user
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
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Auto sign-in as demo user for development
        await handleDemoSignIn()
      } else {
        setUser(user)
        
        // Get user's company information
        try {
          const clientInfo = await getUserClient(user.id)
          if (clientInfo) {
            setUserClient(clientInfo)
          }
        } catch (error) {
          console.error('Error loading client info:', error)
        }
        
        setLoading(false)
      }
    }
    
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const moduleConfig = getModuleConfig('admin')
  
  if (!moduleConfig) {
    return <div>Module configuration not found</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={getCardStyle('primary')}>
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className={getTextStyle('body')}>Loading Console...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className={`${getCardStyle('primary')} max-w-md w-full`}>
          <div className="text-center">
            <h1 className={`${getTextStyle('pageTitle')} mb-2`}>
              Admin Console
            </h1>
            <p className={`${getTextStyle('bodySmall')} mb-6`}>
              Please sign in to manage settings
            </p>
            
            <button
              onClick={handleDemoSignIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] mb-4"
            >
              Sign In as Demo User
            </button>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <p className="text-xs text-white/70">
                Demo mode with test company data
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-16 pb-8">
      
      {/* Standardized Module Header */}
      <ModuleHeader 
        module={moduleConfig}
        currentPage="console"
      />
      
      {/* User Info Display */}
      {userClient && (
        <div className="mb-4 text-center">
          <p className="text-blue-300 text-sm">
            {userClient.name} • {userClient.role}
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-6">
        
        {/* Left Column - Main Content */}
        <div className="flex-1">
          
          {/* Overview Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            
            {/* Business Info */}
            <div className={getCardStyle('primary')}>
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🏢</span>
                </div>
                <h3 className={getTextStyle('cardTitle')}>Business Info</h3>
                <p className={`${getTextStyle('bodySmall')} mt-2`}>
                  Demo Restaurant Ltd
                </p>
              </div>
              <div className={`${getTextStyle('body')} space-y-1`}>
                <p><strong>Type:</strong> Restaurant</p>
                <p><strong>License:</strong> AL123456</p>
                <p><strong>Phone:</strong> +64 9 123 4567</p>
              </div>
            </div>

            {/* Subscription */}
            <div className={getCardStyle('primary')}>
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">💎</span>
                </div>
                <h3 className={getTextStyle('cardTitle')}>Subscription</h3>
                <p className={`${getTextStyle('bodySmall')} mt-2`}>
                  Professional Plan
                </p>
              </div>
              <div className={`${getTextStyle('body')} space-y-1`}>
                <p><strong>Status:</strong> Active</p>
                <p><strong>Usage:</strong> 127/2000</p>
                <p><strong>Billing:</strong> $99/month</p>
              </div>
            </div>

            {/* Team */}
            <div className={getCardStyle('primary')}>
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className={getTextStyle('cardTitle')}>Team</h3>
                <p className={`${getTextStyle('bodySmall')} mt-2`}>
                  4 Active Users
                </p>
              </div>
              <div className={`${getTextStyle('body')} space-y-1`}>
                <p><strong>Admins:</strong> 2</p>
                <p><strong>Staff:</strong> 2</p>
                <p><strong>Pending:</strong> 0</p>
              </div>
            </div>

          </div>

          {/* Business Information Form */}
          <div className={getCardStyle('primary')}>
            <h2 className={`${getTextStyle('sectionTitle')} mb-6`}>Business Information</h2>
            
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={`block ${getTextStyle('label')} mb-2`}>Business Name</label>
                  <input
                    type="text"
                    defaultValue="Demo Restaurant Ltd"
                    className={getFormFieldStyle()}
                  />
                </div>
                
                <div>
                  <label className={`block ${getTextStyle('label')} mb-2`}>Business Type</label>
                  <select className={getFormFieldStyle()}>
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Café</option>
                    <option value="hotel">Hotel</option>
                    <option value="catering">Catering</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={`block ${getTextStyle('label')} mb-2`}>Contact Email</label>
                  <input
                    type="email"
                    defaultValue="admin@demorestaurant.co.nz"
                    className={getFormFieldStyle()}
                  />
                </div>
                
                <div>
                  <label className={`block ${getTextStyle('label')} mb-2`}>Phone Number</label>
                  <input
                    type="tel"
                    defaultValue="+64 9 123 4567"
                    className={getFormFieldStyle()}
                  />
                </div>
              </div>

              <div>
                <label className={`block ${getTextStyle('label')} mb-2`}>Address</label>
                <textarea
                  rows={3}
                  defaultValue="123 Queen Street, Auckland CBD, Auckland 1010"
                  className={getFormFieldStyle()}
                />
              </div>

              <div>
                <label className={`block ${getTextStyle('label')} mb-2`}>Alcohol License Number</label>
                <input
                  type="text"
                  defaultValue="AL123456789"
                  className={getFormFieldStyle()}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-white/30 backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column - Quick Actions Sidebar */}
        <div className="w-64">
          <div className={`${getCardStyle('sidebar')} sticky top-8`}>
            <h2 className={`${getTextStyle('sectionTitle')} mb-6`}>Quick Actions</h2>
            
            <div>
              <Link href="/admin/configure" className="block mb-4">
                <div className={getCardStyle('secondary')}>
                  <div>
                    <h3 className={getTextStyle('cardTitle')}>Configure</h3>
                    <p className={`${getTextStyle('bodySmall')} mt-2`}>Compliance rules & preferences</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/admin/team" className="block mb-4">
                <div className={getCardStyle('secondary')}>
                  <div>
                    <h3 className={getTextStyle('cardTitle')}>Team</h3>
                    <p className={`${getTextStyle('bodySmall')} mt-2`}>Manage users & permissions</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/admin/company/billing" className="block mb-4">
                <div className={getCardStyle('secondary')}>
                  <div>
                    <h3 className={getTextStyle('cardTitle')}>Billing</h3>
                    <p className={`${getTextStyle('bodySmall')} mt-2`}>Subscription & payment</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/upload/reports" className="block">
                <div className={getCardStyle('secondary')}>
                  <div>
                    <h3 className={getTextStyle('cardTitle')}>Reports</h3>
                    <p className={`${getTextStyle('bodySmall')} mt-2`}>Export compliance data</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}