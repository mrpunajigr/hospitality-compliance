'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getChefWorkspaceBackground } from '@/lib/image-storage'
import AppleSidebar from '../components/AppleSidebar'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import BackgroundSelector from '../components/BackgroundSelector'
// import { PlatformProvider } from '@/lib/platform-context' // Temporarily disabled for quick deployment
interface UploadLayoutProps {children: React.ReactNode}

export default function UploadLayout({ children }: UploadLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        try {
          const clientInfo = await getUserClient(user.id)
          if (clientInfo) {
            setUserClient(clientInfo)
          }
        } catch (error) {
          console.error('Error loading client info:', error)
        }
      } else {
        // Check for demo mode
        const isDemoMode = typeof window !== 'undefined' && (
          window.location.pathname.startsWith('/upload') ||
          new URLSearchParams(window.location.search).get('demo') === 'true' ||
          document.cookie.includes('demo-session=active')
        )
        
        if (isDemoMode) {
          const demoUser = {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
            email: 'demo@example.com',
            app_metadata: {},
            user_metadata: { full_name: 'Demo User - Upload' },
            aud: 'authenticated',
            role: 'authenticated',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setUser(demoUser)
        } else {
          router.push('/')
          return
        }
      }
      setLoading(false)
    }
    
    checkAuth()
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
    // <PlatformProvider> // Temporarily disabled for quick deployment
      <div className="min-h-screen relative ContentArea">
        {/* Background overlay for upload module */}
        
        {/* Pattern overlay for visual interest */}
        <div className="fixed inset-0 opacity-10" style={{ 
          zIndex: 1,
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)'
        }} />
{showBackgroundSelector && (
        <BackgroundSelector 
          selectedBackground=""
          onBackgroundChange={() => {}}
          onClose={() => setShowBackgroundSelector(false)}
        />
      )}
      
      <div className="relative" style={{ zIndex: 10 }}>
        <AppleSidebar
          user={user}
          userClient={userClient}
          onSignOut={handleSignOut}
          logoUrl={userClient?.logo_url || "/JiGR_Logo-full_figma_circle.png"}
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
      
      {/* Main Content */}
      <div className="min-h-screen relative" style={{ zIndex: 5, marginLeft: '280px' }}>
        {children}
      </div>
      </div>
    // </PlatformProvider> // Temporarily disabled for quick deployment  
  )
}
