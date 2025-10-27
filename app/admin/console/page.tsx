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
import ImageUploader from '@/app/components/ImageUploader'

export default function AdminConsolePage() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const handleLogoUploadSuccess = (logoUrl: string) => {
    setCompanyLogoUrl(logoUrl)
    console.log('Company logo uploaded successfully:', logoUrl)
    
    // Notify the layout about the logo update
    localStorage.setItem('companyLogoUrl', logoUrl)
    window.dispatchEvent(new CustomEvent('companyLogoUpdated', { detail: { logoUrl } }))
  }

  // Debug userClient state changes
  useEffect(() => {
    console.log('🔍 STATE UPDATE: userClient changed:', userClient ? {
      id: userClient.id,
      name: userClient.name,
      owner_name: userClient.owner_name,
      address: userClient.address,
      hasOwnerName: !!userClient.owner_name,
      hasAddress: !!userClient.address,
      isComplete: !!(userClient.owner_name && userClient.address)
    } : 'null')
  }, [userClient])

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
      try {
        // Simple demo user setup for testing
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
        // Sidebar handles its own demo client data now
        
      } catch (error) {
        console.error('Error in admin auth:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
    
    // TEMPORARILY DISABLED: Auth state change listener to prevent session refresh issues
    // const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
    //   console.log('🔍 ADMIN CONSOLE: Auth state changed:', { event, hasUser: !!session?.user })
    //   setUser(session?.user ?? null)
    // })

    // return () => subscription.unsubscribe()
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
              LOGIN as Demo User
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
    <div className="min-h-screen p-6">
      <ModuleHeader 
        module={moduleConfig}
        currentPage="console"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Business Information Card */}
        <div 
          style={{
            borderRadius: '38px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="p-6"
        >
          <h3 className={getTextStyle('cardTitle')}>Business Information</h3>
          <div className="space-y-4 mt-4">
            <div>
              <label className={getTextStyle('bodySmall')}>Business Name</label>
              <p className={getTextStyle('body')}>{userClient?.name || 'Not specified'}</p>
            </div>
            <div>
              <label className={getTextStyle('bodySmall')}>Owner</label>
              <p className={getTextStyle('body')}>{userClient?.owner_name || 'Not specified'}</p>
            </div>
            <div>
              <label className={getTextStyle('bodySmall')}>Business Type</label>
              <p className={getTextStyle('body')}>{userClient?.business_type || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Company Logo Upload Card */}
        <div 
          style={{
            borderRadius: '38px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="p-6"
        >
          <h3 className={getTextStyle('cardTitle')}>Company Logo</h3>
          <div className="mt-4">
            <ImageUploader
              onUploadSuccess={handleLogoUploadSuccess}
              onUploadError={(error) => console.error('Logo upload error:', error)}
              uploadEndpoint="/api/upload-client-logo"
              uploadData={{ userId: user?.id || 'demo', clientId: userClient?.id || 'demo-client' }}
              acceptedTypes={['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']}
              maxSizeMB={5}
              shape="square"
              size="large"
              title="Upload Company Logo"
            />
            {companyLogoUrl && (
              <div className="mt-4 text-center">
                <img 
                  src={companyLogoUrl} 
                  alt="Company Logo" 
                  className="max-w-32 max-h-32 mx-auto rounded-lg border border-white/20"
                />
              </div>
            )}
          </div>
        </div>

        {/* System Status Card */}
        <div 
          style={{
            borderRadius: '38px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="p-6"
        >
          <h3 className={getTextStyle('cardTitle')}>System Status</h3>
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <span className={getTextStyle('body')}>Database</span>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <span className={getTextStyle('bodySmall')}>Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={getTextStyle('body')}>Authentication</span>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                <span className={getTextStyle('bodySmall')}>Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}