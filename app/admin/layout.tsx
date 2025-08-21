'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { getVersionDisplay } from '@/lib/version'
import AppleSidebar from '@/app/components/AppleSidebar'

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/signin'
  }

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

      {/* Apple-style Sidebar */}
      <AppleSidebar 
        user={user}
        userClient={userClient}
        onSignOut={handleSignOut}
        logoUrl="/JiGR_Logo-full_figma_circle.png"
        activeSection="admin"
      />

      {/* Main content with fixed sidebar offset (only accounts for collapsed width) */}
      <div className="ml-[150px] min-h-screen transition-all duration-300">
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}