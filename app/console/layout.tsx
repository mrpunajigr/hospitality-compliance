'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getVersionDisplay } from '@/lib/version'
import DevVersionHeader from '@/app/components/DevVersionHeader'
import { DesignTokens, getTextStyle } from '@/lib/design-system'
import ConsoleAdminToggle from '@/app/components/ConsoleAdminToggle'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import BackgroundSelector from '@/app/components/BackgroundSelector'

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
        
        // For other pages, redirect to sign-in
        if (typeof window !== 'undefined') {
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

  const navigation = [
    { name: 'Dashboard', href: '/console/dashboard' },
    { name: 'Upload', href: '/console/upload' },
    { name: 'Reports', href: '/console/reports' },
  ]

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

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        {/* Header - Exact Admin Portal Style */}
        <div className="relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-24">
              
              {/* Logo */}
              <Link href="/admin/company-settings" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
                <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center overflow-hidden">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt="Company Logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-xl">HC</span>
                  )}
                </div>
                <div>
                  <span className={`${getTextStyle('pageTitle')} text-white`}>Console</span>
                  <p className={`${getTextStyle('version')} ${DesignTokens.colors.text.onGlassSecondary}`}>
                    {isClient ? getVersionDisplay('prod') : 'Loading...'}
                  </p>
                </div>
              </Link>

              {/* Navigation Pills - Exact Admin Style */}
              <div className="hidden md:flex items-center">
                <div className="flex bg-black/70 backdrop-blur-sm rounded-full p-1 space-x-1 border border-white/40 shadow-lg">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        pathname === item.href
                          ? `bg-white ${DesignTokens.colors.text.navActive} backdrop-blur-sm shadow-sm`
                          : `${DesignTokens.colors.text.navInactive} hover:text-black hover:bg-white/25`
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* User Avatar & Actions */}
              <div className="flex items-center space-x-4">
                {/* Background Selector Button */}
                <button
                  onClick={() => setShowBackgroundSelector(true)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  title="Change Background"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                
                {/* Console/Admin Toggle */}
                <ConsoleAdminToggle showLabels={false} />
                
                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  Sign Out
                </button>
                
                {/* User Avatar */}
                <Link href="/admin/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="text-right hidden md:block">
                    <div className={`${getTextStyle('body')} text-white font-semibold`}>
                      {user?.user_metadata?.full_name || user?.email || 'User'}
                    </div>
                    <div className={`${getTextStyle('caption')} ${DesignTokens.colors.text.onGlassSecondary}`}>
                      {userClient?.role || 'Console'}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="User Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm">
                        {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                </Link>
              </div>

            </div>
          </div>
          
          {/* Mobile Navigation - Exact Admin Style */}
          <div className="md:hidden border-t border-white/20 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex space-x-1 py-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex-1 px-3 py-2 rounded-lg text-center text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? `bg-white ${DesignTokens.colors.text.navActive} backdrop-blur-sm`
                        : `${DesignTokens.colors.text.navInactive} hover:text-black hover:bg-white/20`
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">
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