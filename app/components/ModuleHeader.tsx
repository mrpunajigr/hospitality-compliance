/**
 * Smart ModuleHeader Router Component
 * 
 * Routes to the appropriate header variant based on module theme:
 * - Light backgrounds (Admin) → ModuleHeaderDark (dark text)
 * - Dark backgrounds (Upload) → ModuleHeaderLight (light text)
 */

'use client'

import { ModuleConfig } from '@/lib/module-config'
import { ModuleHeaderDark } from './ModuleHeaderDark'
import { ModuleHeaderLight } from './ModuleHeaderLight'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserClient } from '@/lib/auth-utils'
import { useRouter } from 'next/navigation'

interface OnboardingData {
  userFirstName: string
}

interface ModuleHeaderProps {
  module: ModuleConfig
  currentPage: string
  className?: string
  onboardingData?: OnboardingData
}

export function ModuleHeader({ 
  module, 
  currentPage, 
  className = '',
  onboardingData
}: ModuleHeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<any>(null)

  // Fetch user data internally
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          
          // Load company info using reliable API endpoint
          try {
            const response = await fetch(`/api/user-client?userId=${session.user.id}`)
            
            if (response.ok) {
              const data = await response.json()
              const clientInfo = data.userClient
              
              setUserClient(clientInfo)
              console.log('ModuleHeader: User client data loaded successfully via API')
            } else {
              console.log('ModuleHeader: API failed, using fallback data')
              // Set a minimal userClient object with fallback data
              setUserClient({
                id: 'unknown',
                name: 'Unknown Company',
                owner_name: session.user.user_metadata?.full_name || session.user.email || 'User',
                role: 'OWNER'
              })
            }
          } catch (clientError) {
            console.log('ModuleHeader: API error, proceeding with fallback data:', clientError)
            // Set a minimal userClient object with fallback data
            setUserClient({
              id: 'unknown',
              name: 'Unknown Company',
              owner_name: session.user.user_metadata?.full_name || session.user.email || 'User',
              role: 'OWNER'
            })
          }
        } else {
          console.log('ModuleHeader: No authenticated session found')
        }
      } catch (error) {
        console.error('ModuleHeader: Error fetching session data:', error)
      }
    }
    
    fetchUserData()
  }, [])

  // Sign out handler
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }
  // Route to appropriate variant based on module theme
  if (module.theme === 'dark') {
    // Dark theme = dark text for light backgrounds
    return (
      <ModuleHeaderDark 
        module={module}
        currentPage={currentPage}
        className={className}
        onboardingData={onboardingData}
        user={user}
        userClient={userClient}
        onSignOut={handleSignOut}
      />
    )
  }
  
  // Default to light theme = light text for dark backgrounds
  return (
    <ModuleHeaderLight 
      module={module}
      currentPage={currentPage}
      className={className}
      onboardingData={onboardingData}
      user={user}
      userClient={userClient}
      onSignOut={handleSignOut}
    />
  )
}