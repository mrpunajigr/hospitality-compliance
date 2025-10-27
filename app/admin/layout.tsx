'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { getVersionDisplay } from '@/lib/version'
import { getAdminBackground } from '@/lib/image-storage'
import AppleSidebar from '@/app/components/AppleSidebar'
import { PlatformProvider } from '@/lib/platform-context'
import ConsoleToggle from '@/app/components/ConsoleToggle'

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
        // TEMPORARILY DISABLED FOR DEBUGGING: window.location.href = '/'
        console.log('⚠️ ADMIN LAYOUT: Redirect disabled for debugging')
        return
      }

      const user = session.user
      console.log('✅ ADMIN LAYOUT: Authenticated user found:', user.email)
      
      // Authentication verified - proceed with admin access
      console.log('✅ ADMIN LAYOUT: User authenticated, proceeding to admin dashboard')
      
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
    <div>
      <div className="min-h-screen relative" style={{background: 'transparent'}}>
        {/* Glassmorphic overlay for admin module - TEMPORARILY DISABLED */}
        {/* <div className="fixed inset-0 bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-900/50" style={{ zIndex: 1 }} /> */}
        
        {/* Pattern overlay for visual interest - TEMPORARILY DISABLED */}
        {/* <div className="fixed inset-0 opacity-10" style={{ 
          zIndex: 1,
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)'
        }} /> */}
        {/* Apple-style Sidebar - TEMPORARILY DISABLED */}
        {/* <div className="relative" style={{ zIndex: 10 }}>
          <AppleSidebar 
            user={user}
            userClient={userClient}
            onSignOut={handleSignOut}
            logoUrl={companyLogoUrl || "/JiGR_Logo-full_figma_circle.png"}
            activeSection="admin"
          />
        </div> */}

        {/* Main content - NO SIDEBAR OFFSET */}
        <div className="min-h-screen" style={{ zIndex: 1000, background: 'transparent' }}>
          <main className="w-full">
            {children}
          </main>
        </div>
        
        {/* Console Toggle for Testing */}
        <ConsoleToggle />
      </div>
    </div>
  )
}