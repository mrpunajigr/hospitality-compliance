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
import { StatCard } from '@/app/components/ModuleCard'
import ImageUploader from '@/app/components/ImageUploader'
import { getThemedCardStyles, getModuleTheme } from '@/lib/theme-utils'

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
  
  // Get theme-aware styling
  const theme = getModuleTheme('admin')
  const { cardStyle, textColors, getInlineStyles } = getThemedCardStyles(theme)
  
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
    <div className="px-2 sm:px-4 lg:px-6 pt-16 pb-8">
      
      {/* Standardized Module Header */}
      <ModuleHeader 
        module={moduleConfig}
        currentPage="console"
      />
      
      {/* Admin Overview Cards - 3 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 AdaptiveLayout">
        
        {/* Business Info */}
        <StatCard accentColor="blue" theme="admin">
          <div>
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-gray-900 text-lg font-semibold text-center w-full">{userClient?.name || 'Business Info'}</h2>
            </div>
            <div className="text-center mb-6">
              <Link href="/admin/company">
                <img 
                  src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRcafe.png"
                  alt="Business Info"
                  className="w-16 h-16 object-contain mx-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                />
              </Link>
            </div>
            <div className="space-y-1 text-sm text-gray-800">
              <p><strong>Owner:</strong> {userClient?.owner_name || 'Not specified'}</p>
              <p><strong>Type:</strong> {userClient?.business_type ? userClient.business_type.charAt(0).toUpperCase() + userClient.business_type.slice(1) : 'Not specified'}</p>
              <p><strong>Phone:</strong> {userClient?.phone || 'Not provided'}</p>
            </div>
          </div>
        </StatCard>

        {/* Subscription */}
        <StatCard accentColor="purple" theme="admin">
          <div>
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-gray-900 text-lg font-semibold text-center w-full">Subscription</h2>
            </div>
            <div className="text-center mb-6">
              <img 
                src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRsubscription.png"
                alt="Subscription"
                className="w-16 h-16 object-contain mx-auto mb-4"
              />
            </div>
            <div className="space-y-1 text-sm text-gray-800">
              <p><strong>Status:</strong> {userClient?.subscription_status ? userClient.subscription_status.charAt(0).toUpperCase() + userClient.subscription_status.slice(1) : 'Not specified'}</p>
              <p><strong>Tier:</strong> {userClient?.subscription_tier ? userClient.subscription_tier.charAt(0).toUpperCase() + userClient.subscription_tier.slice(1) : 'Not specified'}</p>
              <p><strong>Onboarding:</strong> {userClient?.onboarding_status ? userClient.onboarding_status.charAt(0).toUpperCase() + userClient.onboarding_status.slice(1) : 'Not specified'}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-800/10">
              <p className="text-purple-600 text-xs text-center">
                {userClient?.subscription_tier ? userClient.subscription_tier.charAt(0).toUpperCase() + userClient.subscription_tier.slice(1) + ' Plan' : 'Plan not specified'}
              </p>
            </div>
          </div>
        </StatCard>

        {/* Team */}
        <StatCard accentColor="green" theme="admin">
          <div>
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-gray-900 text-lg font-semibold text-center w-full">Team</h2>
            </div>
            <div className="text-center mb-6">
              <img 
                src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRteam.png"
                alt="Team"
                className="w-16 h-16 object-contain mx-auto mb-4"
              />
            </div>
            <div className="space-y-1 text-sm text-gray-800">
              <p><strong>Owner:</strong> {userClient?.owner_name || 'Not specified'}</p>
              <p><strong>Role:</strong> {userClient?.jobTitle || userClient?.role || 'Not specified'}</p>
              <p><strong>Status:</strong> {userClient?.status ? userClient.status.charAt(0).toUpperCase() + userClient.status.slice(1) : 'Active'}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-800/10">
              <p className="text-green-600 text-xs text-center">
                {userClient ? '1 Active User' : 'Loading users...'}
              </p>
            </div>
          </div>
        </StatCard>

      </div>
      
    </div>
  )
}