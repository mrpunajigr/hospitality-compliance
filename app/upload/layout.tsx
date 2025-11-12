'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getChefWorkspaceBackground } from '@/lib/image-storage'
import AppleSidebar from '../components/AppleSidebar'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import BackgroundSelector from '../components/BackgroundSelector'
import { DeviceProvider } from '@/contexts/DeviceContext'
interface UploadLayoutProps {children: React.ReactNode}

export default function UploadLayout({ children }: UploadLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      // Use getSession() instead of getUser() to avoid 403 errors
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        // No authenticated user - redirect to home/login
        router.push('/')
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
      }
      
      setLoading(false)
    }
    
    loadUserData()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <DeviceProvider userId={user?.id}>
      <div className="min-h-screen relative ContentArea">
        {/* Background overlay for upload module */}
        
        {/* Pattern overlay for visual interest */}
        <div className="fixed inset-0 opacity-10" style={{ 
          zIndex: 1,
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)'
        }} />

        {/* Background Selector - Keep for future use */}
        {showBackgroundSelector && (
          <BackgroundSelector 
            selectedBackground=""
            onBackgroundChange={() => {}}
            onClose={() => setShowBackgroundSelector(false)}
          />
        )}
      
        {/* SIDEBAR DISABLED - Using ModuleHeader navigation instead */}
        {/*
        <div className="relative" style={{ zIndex: 10 }}>
          <AppleSidebar
            user={user}
            userClient={userClient}
            onSignOut={handleSignOut}
            logoUrl={companyLogoUrl || userClient?.logo_url}
            activeSection="upload"
            currentUploadPage={
              pathname.includes('/training') ? 'training' :
              pathname.includes('/console') ? 'console' : 
              pathname.includes('/capture') ? 'capture' : 
              pathname.includes('/reports') ? 'reports' : 'console'
            }
            onBackgroundSelectorToggle={() => setShowBackgroundSelector(!showBackgroundSelector)}
          />
        </div>
        */}
      
        {/* Main Content - Full width without sidebar offset */}
        <div className="min-h-screen relative w-full" style={{ zIndex: 5 }}>
          {children}
        </div>
      </div>
    </DeviceProvider>
  )
}
