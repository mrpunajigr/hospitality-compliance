'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { DeviceProvider } from '@/contexts/DeviceContext'

interface CountLayoutProps {
  children: React.ReactNode
}

export default function CountLayout({ children }: CountLayoutProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        router.push('/')
        return
      }

      const user = session.user
      setUser(user)
      
      try {
        const response = await fetch(`/api/user-client?userId=${user.id}`)
        
        if (response.ok) {
          const data = await response.json()
          setUserClient(data.userClient)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <DeviceProvider userId={user?.id}>
      <div className="min-h-screen relative bg-gray-900">
        {/* Dark background for COUNT module */}
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" />
        
        {/* Pattern overlay */}
        <div className="fixed inset-0 opacity-10" style={{ 
          zIndex: 1,
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }} />

        {/* Main Content */}
        <div className="min-h-screen relative w-full" style={{ zIndex: 5 }}>
          {children}
        </div>
      </div>
    </DeviceProvider>
  )
}