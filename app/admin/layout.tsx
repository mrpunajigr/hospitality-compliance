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
        return
      }

      const user = session.user
      console.log('✅ ADMIN LAYOUT: Authenticated user found:', user.email)
      setUser(user)
      
      // Re-enable getUserClient now that auth is stable
      console.log('🔍 ADMIN LAYOUT: Loading real company info with getUserClient')
      try {
        const clientInfo = await getUserClient(user.id)
        if (clientInfo) {
          console.log('✅ ADMIN LAYOUT: Client info loaded:', clientInfo.name)
          console.log('🔍 ADMIN LAYOUT: Logo URL check:', {
            hasLogoUrl: !!clientInfo.logo_url,
            logoUrl: clientInfo.logo_url,
            logoUrlType: typeof clientInfo.logo_url
          })
          setUserClient(clientInfo)
          if (clientInfo.logo_url) {
            console.log('✅ ADMIN LAYOUT: Setting company logo URL:', clientInfo.logo_url)
            setCompanyLogoUrl(clientInfo.logo_url)
          } else {
            console.log('⚠️ ADMIN LAYOUT: No logo URL found in client info')
          }
        } else {
          console.log('⚠️ ADMIN LAYOUT: No client info found')
        }
      } catch (error) {
        console.error('❌ ADMIN LAYOUT: Error loading client info:', error)
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