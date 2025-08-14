'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { getVersionDisplay } from '@/lib/version'
import { DesignTokens, getTextStyle } from '@/lib/design-system'
import ConsoleAdminToggle from '@/app/components/ConsoleAdminToggle'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // No user found - redirect will be handled by middleware
        return
      }
      
      setUser(user)
      
      // Get user's company information
      try {
        const clientInfo = await getUserClient(user.id)
        if (clientInfo) {
          setUserClient(clientInfo)
        }
      } catch (error) {
        console.error('Error loading client info in admin layout:', error)
      }
    }
    
    loadUserData()
  }, [])

  const navigation = [
    { name: 'Company', href: '/admin/company', icon: '' },
    { name: 'User', href: '/admin/profile', icon: '' },
    { name: 'Team', href: '/admin/company/team', icon: '' },
    { name: 'Settings', href: '/admin/company-settings', icon: '' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
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

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        {/* Simple Admin Header */}
        <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12">
                <img 
                  src="/JiGR_Logo-full_figma_circle.png" 
                  alt="JiGR Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                <span className={getTextStyle('pageTitle')}>Admin Portal</span>
                <p className={`${getTextStyle('version')} text-white/60`}>{getVersionDisplay('short')}</p>
              </div>
            </div>

            {/* Navigation Pills */}
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
              {/* Console/Admin Toggle */}
              <ConsoleAdminToggle showLabels={false} />
              
              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                  <div className={`${getTextStyle('body')} font-semibold`}>
                    {user?.user_metadata?.full_name || user?.email || 'Loading...'}
                  </div>
                  <div className={`${getTextStyle('caption')} text-white/60`}>
                    {userClient?.role || 'Administrator'}
                  </div>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden">
                  <img 
                    src="/hero-image.jpg" 
                    alt="User Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-center py-3">
              <div className="flex bg-black/70 backdrop-blur-sm rounded-full p-1 space-x-1 border border-white/40 shadow-lg">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
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
          </div>
        </div>
      </div>

        {/* Page content */}
        <main className="pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}