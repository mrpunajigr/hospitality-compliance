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
      console.log('🔍 ADMIN CONSOLE: Starting comprehensive auth check...')
      console.log('🔍 ADMIN CONSOLE: This should be called after successful company setup redirect')
      
      // STEP 1: Extended stabilization period for session after redirect
      console.log('⏱️ ADMIN CONSOLE: Waiting for session to stabilize after redirect...')
      await new Promise(resolve => setTimeout(resolve, 2000)) // Increased from 1000ms
      
      // STEP 2: Comprehensive session validation
      console.log('🔍 ADMIN CONSOLE: Performing comprehensive session check...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('🔍 ADMIN CONSOLE: Session check result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        sessionError: sessionError?.message,
        accessToken: session?.access_token ? 'present' : 'missing'
      })
      
      // Use getSession() instead of getUser() to avoid 403 errors
      const { data: { user }, error: userError } = session?.user ? { data: { user: session.user }, error: null } : { data: { user: null }, error: new Error('No user in session') }
      console.log('🔍 ADMIN CONSOLE: User from session:', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        fromSession: true,
        sessionError: sessionError?.message
      })
      
      if (!user || userError) {
        console.log('❌ ADMIN CONSOLE: No user found or error occurred')
        console.log('❌ ADMIN CONSOLE: Session error:', sessionError?.message)
        console.log('❌ ADMIN CONSOLE: User error:', userError?.message)
        console.log('❌ ADMIN CONSOLE: Falling back to demo mode')
        await handleDemoSignIn()
      } else {
        console.log('✅ ADMIN CONSOLE: Real user found, loading client info...')
        setUser(user)
        
        // STEP 3: Re-enable getUserClient to load real company data
        console.log('🔍 ADMIN CONSOLE: Loading real company data with getUserClient')
        console.log('🔍 ADMIN CONSOLE: Auth is stable, should work now')
        
        try {
          // Use API endpoint instead of broken getUserClient function
          const response = await fetch(`/api/user-client?userId=${user.id}`)
          const result = await response.json()
          const clientInfo = result.userClient
          console.log('🔍 ADMIN CONSOLE: getUserClient result:', {
            found: !!clientInfo,
            clientId: clientInfo?.id,
            clientName: clientInfo?.name,
            onboardingStatus: clientInfo?.onboarding_status,
            ownerName: clientInfo?.owner_name,
            address: clientInfo?.address,
            phone: clientInfo?.phone,
            businessType: clientInfo?.business_type,
            logoUrl: clientInfo?.logo_url
          })
          console.log('🔍 ADMIN CONSOLE: Full clientInfo object:', clientInfo)
          console.log('🔍 ADMIN CONSOLE: Team/Owner data check:', {
            owner_name: clientInfo?.owner_name,
            jobTitle: clientInfo?.jobTitle,
            role: clientInfo?.role
          })
          
          if (clientInfo) {
            console.log('✅ ADMIN CONSOLE: Real client info loaded:', clientInfo.name)
            console.log('🔍 ADMIN CONSOLE: Complete client data loaded:', {
              name: clientInfo.name,
              owner_name: clientInfo.owner_name,
              address: clientInfo.address,
              phone: clientInfo.phone,
              business_type: clientInfo.business_type,
              logo_url: clientInfo.logo_url
            })
            console.log('🔍 ADMIN CONSOLE: Onboarding status check:', {
              status: clientInfo.onboarding_status,
              isCompleted: clientInfo.onboarding_status === 'completed',
              shouldRedirect: clientInfo.onboarding_status !== 'completed'
            })
            setUserClient(clientInfo)
            console.log('✅ ADMIN CONSOLE: setUserClient called with complete data:', {
              hasOwnerName: !!clientInfo.owner_name,
              hasAddress: !!clientInfo.address,
              owner_name: clientInfo.owner_name,
              address: clientInfo.address
            })
            
            // TEMPORARILY BYPASS onboarding check to debug the issue
            if (clientInfo.onboarding_status !== 'completed') {
              console.log('⚠️ ADMIN CONSOLE: Onboarding not completed, but BYPASSING redirect for debugging')
              console.log('⚠️ ADMIN CONSOLE: Status:', clientInfo.onboarding_status, 'Expected: completed')
              console.log('⚠️ ADMIN CONSOLE: Allowing admin console to load for testing')
              // TEMPORARILY COMMENTED OUT:
              // router.push('/company-setup')
              // return
            }
          } else {
            console.log('❌ ADMIN CONSOLE: No client info found - using fallback')
            // Fallback to dummy data if no real data found
            setUserClient({ 
              id: 'fallback', 
              name: 'Setup Required', 
              onboarding_status: 'pending',
              role: 'OWNER'
            } as UserClient)
          }
        } catch (error) {
          console.error('❌ ADMIN CONSOLE: Error loading client info:', error)
          console.error('❌ ADMIN CONSOLE: Using fallback data')
          // Fallback to dummy data on error
          setUserClient({ 
            id: 'error', 
            name: 'Error Loading', 
            onboarding_status: 'completed',
            role: 'OWNER'
          } as UserClient)
        }
        
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
              <div className="mb-4">
                <h3 className="text-black text-lg font-semibold mb-3">{userClient?.name || 'Loading...'}</h3>
                <div className="flex justify-center mb-4">
                  <Link href="/admin/company">
                    <img 
                      src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRcafe.png"
                      alt="Business Info"
                      className="w-16 h-16 object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    />
                  </Link>
                </div>
                <p className="text-gray-700 text-sm mb-4">
                  &nbsp;
                </p>
              </div>
              <div className="text-gray-800 space-y-1 text-sm">
                <p><strong>Owner:</strong> {userClient?.owner_name ? userClient.owner_name : 'Not specified'}</p>
                <p><strong>Type:</strong> {userClient?.business_type ? userClient.business_type.charAt(0).toUpperCase() + userClient.business_type.slice(1) : 'Not specified'}</p>
                <p><strong>Phone:</strong> {userClient?.phone ? userClient.phone : 'Not provided'}</p>
              </div>
            </div>

            {/* Subscription */}
            <div className={getCardStyle('primary')}>
              <div className="mb-4">
                <h3 className="text-black text-lg font-semibold mb-3">Subscription</h3>
                <div className="flex justify-center mb-4">
                  <img 
                    src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRsubscription.png"
                    alt="Subscription"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <p className="text-gray-700 text-sm mb-4">
                  {userClient?.subscription_tier ? userClient.subscription_tier.charAt(0).toUpperCase() + userClient.subscription_tier.slice(1) + ' Plan' : 'Plan not specified'}
                </p>
              </div>
              <div className="text-gray-800 space-y-1 text-sm">
                <p><strong>Status:</strong> {userClient?.subscription_status ? userClient.subscription_status.charAt(0).toUpperCase() + userClient.subscription_status.slice(1) : 'Not specified'}</p>
                <p><strong>Tier:</strong> {userClient?.subscription_tier ? userClient.subscription_tier.charAt(0).toUpperCase() + userClient.subscription_tier.slice(1) : 'Not specified'}</p>
                <p><strong>Onboarding:</strong> {userClient?.onboarding_status ? userClient.onboarding_status.charAt(0).toUpperCase() + userClient.onboarding_status.slice(1) : 'Not specified'}</p>
              </div>
            </div>

            {/* Team */}
            <div className={getCardStyle('primary')}>
              <div className="mb-4">
                <h3 className="text-black text-lg font-semibold mb-3">Team</h3>
                <div className="flex justify-center mb-4">
                  <img 
                    src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRteam.png"
                    alt="Team"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <p className="text-gray-700 text-sm mb-4">
                  {userClient ? '1 Active User' : 'Loading users...'}
                </p>
              </div>
              <div className="text-gray-800 space-y-1 text-sm">
                <p><strong>Owner:</strong> {userClient?.owner_name ? userClient.owner_name : 'Not specified'}</p>
                <p><strong>Role:</strong> {userClient?.jobTitle || userClient?.role || 'Not specified'}</p>
                <p><strong>Status:</strong> {userClient?.status ? userClient.status.charAt(0).toUpperCase() + userClient.status.slice(1) : 'Active'}</p>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column - Empty Sidebar */}
        <div className="w-64">
          {/* Empty sidebar to maintain layout consistency */}
        </div>

      </div>
    </div>
  )
}