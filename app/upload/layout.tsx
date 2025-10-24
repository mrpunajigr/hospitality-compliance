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
      {/* Upload Module Background - Higher z-index than root */}
      <div 
        className="fixed inset-0"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #374151 50%, #1e293b 100%)',
          zIndex: -900,
          // iOS 12 compatibility - remove backgroundAttachment: 'fixed'
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)'
        }}
      />
      
      {/* Kitchen workspace overlay for context - iPad Safari 12 fallback */}
      <div 
        className="fixed inset-0"
        style={{
          backgroundImage: `url(${getChefWorkspaceBackground()}), linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #2d3748 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -900,
          // iOS 12 compatibility
          WebkitBackgroundSize: 'cover',
          WebkitTransform: 'translateZ(0)',
          transform: 'translateZ(0)',
          opacity: 0.4
        }}
      />
      
      {/* Pattern overlay for visual interest */}
      <div 
        className="fixed inset-0"
        style={{
          background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
          zIndex: -900,
          opacity: 0.2
        }}
      />
{showBackgroundSelector && (
        <BackgroundSelector 
          selectedBackground=""
          onBackgroundChange={() => {}}
          onClose={() => setShowBackgroundSelector(false)}
        />
      )}
      
      <AppleSidebar
        user={user}
        userClient={userClient}
        onSignOut={handleSignOut}
        activeSection="upload"
        currentUploadPage={
          pathname.includes('/training') ? 'training' :
          pathname.includes('/console') ? 'console' : 
          pathname.includes('/capture') ? 'capture' : 
          pathname.includes('/reports') ? 'reports' : 'console'
        }
        onBackgroundSelectorToggle={() => setShowBackgroundSelector(!showBackgroundSelector)}
      />
      
      {/* Main Content */}
      <div className="ml-[150px] min-h-screen">
        {children}
      </div>
      </div>
    // </PlatformProvider> // Temporarily disabled for quick deployment  
  )
}
