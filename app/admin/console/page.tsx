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


  useEffect(() => {
    const loadUserData = async () => {
      // Use getSession() instead of getUser() to avoid 403 errors
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        // No authenticated user - redirect to home/login
        window.location.href = '/'
        return
      }

      const user = session.user
      setUser(user)
      
      // Load company info using reliable API
      try {
        const response = await fetch(`/api/user-client?userId=${user.id}`)
        
        if (response.ok) {
          const data = await response.json()
          const clientInfo = data.userClient
          
          setUserClient(clientInfo)
          
          if (clientInfo.logo_url) {
            setCompanyLogoUrl(clientInfo.logo_url)
            // Update localStorage for consistency
            localStorage.setItem('companyLogoUrl', clientInfo.logo_url)
          }
        } else {
          console.error('Failed to load client info via API:', response.status)
        }
      } catch (error) {
        console.error('Error loading client info via API:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadUserData()
    
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
              Redirecting to login...
            </p>
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-y-auto">
      <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:max-w-7xl pt-16 pb-8">
      
      {/* Standardized Module Header */}
      <ModuleHeader 
        module={moduleConfig}
        currentPage="console"
      />
      

      {/* Main Content */}
      <div className="flex gap-6">
        
        {/* Left Column - Main Content */}
        <div className="flex-1">
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Business Info */}
            <div 
              style={{
                borderRadius: '38px',
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="p-6"
            >
              <div className="mb-4">
                <h3 className={getTextStyle('cardTitle')}>{userClient?.name || 'Business Info'}</h3>
                <div className="flex justify-center mb-4">
                  <Link href="/admin/company">
                    <img 
                      src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRcafe.png"
                      alt="Business Info"
                      className="w-16 h-16 object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    />
                  </Link>
                </div>
              </div>
              <div className="text-gray-800 space-y-1 text-sm">
                <p><strong>Owner:</strong> {userClient?.owner_name || 'Not specified'}</p>
                <p><strong>Type:</strong> {userClient?.business_type ? userClient.business_type.charAt(0).toUpperCase() + userClient.business_type.slice(1) : 'Not specified'}</p>
                <p><strong>Phone:</strong> {userClient?.phone || 'Not provided'}</p>
              </div>
            </div>

            {/* Subscription */}
            <div 
              style={{
                borderRadius: '38px',
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="p-6"
            >
              <div className="mb-4">
                <h3 className={getTextStyle('cardTitle')}>Subscription</h3>
                <div className="flex justify-center mb-4">
                  <img 
                    src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRsubscription.png"
                    alt="Subscription"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <p className="text-gray-600 text-sm mb-4">
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
            <div 
              style={{
                borderRadius: '38px',
                backgroundColor: 'rgba(255, 255, 255, 0.35)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              className="p-6"
            >
              <div className="mb-4">
                <h3 className={getTextStyle('cardTitle')}>Team</h3>
                <div className="flex justify-center mb-4">
                  <img 
                    src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRteam.png"
                    alt="Team"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {userClient ? '1 Active User' : 'Loading users...'}
                </p>
              </div>
              <div className="text-gray-800 space-y-1 text-sm">
                <p><strong>Owner:</strong> {userClient?.owner_name || 'Not specified'}</p>
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
    </div>
  )
}