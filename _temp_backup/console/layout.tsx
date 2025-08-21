'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getVersionDisplay } from '@/lib/version'
import DevVersionHeader from '@/app/components/DevVersionHeader'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import BackgroundSelector from '@/app/components/BackgroundSelector'
import AppleSidebar from '@/app/components/AppleSidebar'

interface BackgroundAsset {
  id: string
  name: string
  file_url: string
  category: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  alt_text: string | null
}

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [currentBackground, setCurrentBackground] = useState<string>('/chef-workspace1jpg.jpg')
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)
  const [isClient, setIsClient] = useState(false)


  useEffect(() => {
    const loadUserData = async () => {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Always allow demo mode for all console pages (development/testing)
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/console')) {
          console.log('🚀 Console page accessed - enabling demo mode')
          // Set demo user for all console pages
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
          return
        }
        
        // For non-console pages, redirect to sign-in
        // Do NOT redirect console pages - they should use demo mode
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/console')) {
          window.location.href = `/signin?redirectTo=${encodeURIComponent(window.location.pathname)}`
        }
        return
      }
      
      setUser(user)
      
      // Get user's client/company information
      try {
        const clientInfo = await getUserClient(user.id)
        if (clientInfo) {
          setUserClient(clientInfo)
          console.log('✅ Company loaded:', clientInfo.name)
        } else {
          console.log('ℹ️ User has no associated company - company setup needed')
        }
      } catch (error) {
        console.log('ℹ️ Company association not found - this is normal for users without companies')
      }
    }

    loadUserData()
  }, [])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/signin'
  }

  const handleBackgroundChange = (asset: BackgroundAsset) => {
    setCurrentBackground(asset.file_url)
    setShowBackgroundSelector(false)
  }


  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Development Version Header */}
      <DevVersionHeader />
      
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('${currentBackground}')`,
          backgroundPosition: '50% 50%',
          backgroundAttachment: 'fixed',
          filter: 'brightness(0.7)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50" />

      {/* Apple-style Sidebar */}
      <AppleSidebar 
        user={user}
        userClient={userClient}
        onSignOut={handleSignOut}
        logoUrl={logoUrl || undefined}
        activeSection="console"
        onBackgroundSelectorToggle={() => setShowBackgroundSelector(true)}
      />

      {/* Main content with fixed sidebar offset (only accounts for collapsed width) */}
      <div className="ml-[150px] min-h-screen transition-all duration-300">
        <main className="min-h-screen p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Background Selector Modal */}
      {showBackgroundSelector && (
        <BackgroundSelector
          selectedBackground={currentBackground}
          onBackgroundChange={handleBackgroundChange}
          onClose={() => setShowBackgroundSelector(false)}
          theme="dark"
        />
      )}
    </div>
  )
}