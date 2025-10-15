'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { getVersionDisplay } from '@/lib/version'
import AppleSidebar from '@/app/components/AppleSidebar'
import { PlatformProvider } from '@/lib/platform-context'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      console.log('🔍 ADMIN LAYOUT: Getting session to avoid 403 errors...')
      
      // Use getSession() instead of getUser() to avoid 403 errors
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        console.log('❌ ADMIN LAYOUT: No authenticated user found in session')
        window.location.href = '/'
        return
      }

      const user = session.user
      console.log('✅ ADMIN LAYOUT: Authenticated user found:', user.email)
      
      // 2FA Route Protection - Check if user has 2FA enabled
      try {
        const { data: factors } = await supabase.auth.mfa.listFactors()
        const has2FA = factors?.totp && factors.totp.length > 0
        
        if (has2FA) {
          console.log('🔐 ADMIN LAYOUT: User has 2FA enabled, checking AAL level...')
          
          // If user has 2FA but is only at AAL1, redirect to verification
          const userAal = (user as any).aal
          if (userAal === 'aal1') {
            console.log('🔐 ADMIN LAYOUT: AAL1 detected - redirecting to 2FA verification')
            window.location.href = '/verify-2fa'
            return
          } else if (userAal === 'aal2') {
            console.log('✅ ADMIN LAYOUT: AAL2 confirmed - access granted')
          } else {
            console.log('⚠️ ADMIN LAYOUT: Unknown AAL level:', userAal)
          }
        } else {
          console.log('ℹ️ ADMIN LAYOUT: User does not have 2FA enabled - allowing access')
        }
      } catch (mfaError) {
        console.log('⚠️ ADMIN LAYOUT: MFA check failed (continuing):', mfaError)
      }
      
      setUser(user)
      
      // Load company info using reliable API
      console.log('🔍 ADMIN LAYOUT: Loading real company info via API')
      try {
        const response = await fetch(`/api/user-client?userId=${user.id}`)
        
        if (response.ok) {
          const data = await response.json()
          const clientInfo = data.userClient
          
          console.log('✅ ADMIN LAYOUT: Client info loaded via API:', {
            name: clientInfo.name,
            address: clientInfo.address,
            owner_name: clientInfo.owner_name,
            logo_url: clientInfo.logo_url,
            hasAddress: !!clientInfo.address,
            hasLogoUrl: !!clientInfo.logo_url
          })
          
          setUserClient(clientInfo)
          
          if (clientInfo.logo_url) {
            console.log('✅ ADMIN LAYOUT: Setting company logo URL from API:', clientInfo.logo_url)
            setCompanyLogoUrl(clientInfo.logo_url)
            // Update localStorage for consistency
            localStorage.setItem('companyLogoUrl', clientInfo.logo_url)
          } else {
            console.log('⚠️ ADMIN LAYOUT: No logo URL found in API response')
          }
        } else {
          console.error('❌ ADMIN LAYOUT: Failed to load client info via API:', response.status)
        }
      } catch (error) {
        console.error('❌ ADMIN LAYOUT: Error loading client info via API:', error)
      }
    }
    
    loadUserData()
  }, [])

  // Listen for company logo updates
  useEffect(() => {
    const handleLogoUpdate = (event: any) => {
      const { logoUrl } = event.detail
      setCompanyLogoUrl(logoUrl)
    }

    window.addEventListener('companyLogoUpdated', handleLogoUpdate)
    
    // Check localStorage for existing logo URL on mount
    const savedLogoUrl = localStorage.getItem('companyLogoUrl')
    if (savedLogoUrl) {
      setCompanyLogoUrl(savedLogoUrl)
    }

    return () => {
      window.removeEventListener('companyLogoUpdated', handleLogoUpdate)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <PlatformProvider>
      <div className="min-h-screen relative overflow-hidden ContentArea">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('/Home-Chef-Chicago-8.webp')`,
          backgroundPosition: '50% 50%',
          backgroundAttachment: 'fixed',
          filter: 'brightness(0.9)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/30" />

      {/* Apple-style Sidebar */}
      <AppleSidebar 
        user={user}
        userClient={userClient}
        onSignOut={handleSignOut}
        logoUrl={companyLogoUrl || "/JiGR_Logo-full_figma_circle.png"}
        activeSection="admin"
      />

      {/* Main content with fixed sidebar offset (only accounts for collapsed width) */}
      <div className="ml-[150px] min-h-screen transition-all duration-300">
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
      </div>
    </PlatformProvider>
  )
}