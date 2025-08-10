'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  // Demo IDs (same as used elsewhere)
  const DEMO_CLIENT_ID = '550e8400-e29b-41d4-a716-446655440001'
  const DEMO_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'

  useEffect(() => {
    const loadUserData = async () => {
      // Try to get real authenticated user first
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Use demo user ID if no authenticated user (for demo mode)
      const userId = user?.id || DEMO_USER_ID

      // Load images via API to bypass RLS
      try {
        const response = await fetch(`/api/get-images?userId=${userId}&clientId=${DEMO_CLIENT_ID}`)
        const data = await response.json()
        
        console.log('Images loaded:', data)
        
        if (data.avatarUrl) {
          setAvatarUrl(data.avatarUrl)
        }
        
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl)
        }
      } catch (error) {
        console.error('Failed to load images:', error)
      }
    }

    loadUserData()
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/workspace/dashboard' },
    { name: 'Upload', href: '/workspace/upload' },
    { name: 'Reports', href: '/workspace/reports' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('/chef-workspace.jpg')`,
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
              <Link href="/admin/company/settings" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
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
                  <span className="text-white font-bold text-2xl">Workspace</span>
                  <p className="text-white/60 text-xs">v1.8.13</p>
                </div>
              </Link>

              {/* Navigation Pills - Exact Admin Style */}
              <div className="hidden md:flex items-center">
                <div className="flex bg-white/10 backdrop-blur-sm rounded-full p-1 space-x-1 border border-white/20">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        pathname === item.href
                          ? 'bg-white/20 text-white backdrop-blur-sm shadow-sm'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* User Avatar & Actions */}
              <div className="flex items-center space-x-4">
                <Link 
                  href="/admin/company" 
                  className="bg-white/10 hover:bg-white/20 text-white hover:text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 border border-white/20 backdrop-blur-sm"
                >
                  Admin Portal
                </Link>
                
                {/* User Avatar */}
                <Link href="/admin/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="text-right hidden md:block">
                    <div className="text-white font-semibold text-sm">Demo User</div>
                    <div className="text-white/60 text-xs">Workspace</div>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="User Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm">User</span>
                    )}
                  </div>
                </Link>
              </div>

            </div>
          </div>
          
          {/* Mobile Navigation - Exact Admin Style */}
          <div className="md:hidden border-t border-white/20 bg-white/5 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex space-x-1 py-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex-1 px-3 py-2 rounded-lg text-center text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-white/20 text-white backdrop-blur-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
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
    </div>
  )
}