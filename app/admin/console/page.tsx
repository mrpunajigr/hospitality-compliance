'use client'

// Admin Console - Business information and dashboard
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'
import { getModuleConfig } from '@/lib/module-config'
import { ModuleHeader } from '@/app/components/ModuleHeader'
import ImageUploader from '@/app/components/ImageUploader'

export default function AdminConsolePage() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const handleLogoUploadSuccess = (logoUrl: string) => {
    setCompanyLogoUrl(logoUrl)
    console.log('Company logo uploaded successfully:', logoUrl)
    
    // Notify the layout about the logo update
    localStorage.setItem('companyLogoUrl', logoUrl)
    window.dispatchEvent(new CustomEvent('companyLogoUpdated', { detail: { logoUrl } }))
  }

  // Debug userClient state changes
  useEffect(() => {
    console.log('🔍 STATE UPDATE: userClient changed:', userClient ? {
      id: userClient.id,
      name: userClient.name,
      owner_name: userClient.owner_name,
      address: userClient.address,
      hasOwnerName: !!userClient.owner_name,
      hasAddress: !!userClient.address,
      isComplete: !!(userClient.owner_name && userClient.address)
    } : 'null')
  }, [userClient])

  const handleDemoSignIn = async () => {
    try {
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
      
      if (!anonError && anonData.user) {
        console.log('Anonymous demo user signed in successfully')
        setUser(anonData.user)
        setLoading(false)
        return
      }

      // Fallback to demo user
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
      setLoading(false)
      
    } catch (error) {
      console.error('Demo sign-in failed:', error)
      // Fallback demo user
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
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 ADMIN CONSOLE: Starting simplified auth check...')
      
      try {
        // Simple demo user setup for testing
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
        
        const demoClient = {
          id: 'demo-client-123',
          name: 'Demo Restaurant',
          owner_name: 'John Demo',
          business_type: 'restaurant',
          phone: '+64 9 123 4567',
          onboarding_status: 'completed',
          role: 'OWNER',
          champion_enrolled: true
        } as UserClient
        
        setUser(demoUser)
        setUserClient(demoClient)
        console.log('✅ ADMIN CONSOLE: Demo user and client set up')
        
      } catch (error) {
        console.error('❌ ADMIN CONSOLE: Error in simplified auth:', error)
      } finally {
        // ALWAYS set loading to false regardless of what happens
        setLoading(false)
        console.log('✅ ADMIN CONSOLE: Loading set to false')
      }
    }
    
    checkAuth()
    
    // TEMPORARILY DISABLED: Auth state change listener to prevent session refresh issues
    // const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
    //   console.log('🔍 ADMIN CONSOLE: Auth state changed:', { event, hasUser: !!session?.user })
    //   setUser(session?.user ?? null)
    // })

    // return () => subscription.unsubscribe()
  }, [])

  const moduleConfig = getModuleConfig('admin')
  
  if (!moduleConfig) {
    return <div>Module configuration not found</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={getCardStyle('primary')}>
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className={getTextStyle('body')}>Loading Console...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className={`${getCardStyle('primary')} max-w-md w-full`}>
          <div className="text-center">
            <h1 className={`${getTextStyle('pageTitle')} mb-2`}>
              Admin Console
            </h1>
            <p className={`${getTextStyle('bodySmall')} mb-6`}>
              Please sign in to manage settings
            </p>
            
            <button
              onClick={handleDemoSignIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] mb-4"
            >
              LOGIN as Demo User
            </button>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <p className="text-xs text-white/70">
                Demo mode with test company data
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 99999,
      background: 'white',
      overflow: 'auto',
      padding: '50px'
    }}>
      <h1 style={{color: 'black', fontSize: '48px', fontWeight: 'bold'}}>
        EMERGENCY BYPASS MODE
      </h1>
      
      <div style={{
        background: 'red',
        color: 'white',
        padding: '30px',
        margin: '20px 0',
        fontSize: '24px',
        borderRadius: '10px'
      }}>
        RED EMERGENCY TEST
      </div>
      
      <div style={{
        background: 'blue', 
        color: 'yellow',
        padding: '30px',
        margin: '20px 0',
        fontSize: '24px',
        borderRadius: '10px'
      }}>
        BLUE EMERGENCY TEST
      </div>
      
      <div style={{
        background: 'green',
        color: 'white',
        padding: '30px',
        margin: '20px 0',
        fontSize: '24px',
        borderRadius: '10px'
      }}>
        GREEN EMERGENCY TEST
      </div>
      
      <p style={{color: 'black', fontSize: '18px', margin: '20px 0'}}>
        This bypasses ALL frameworks, layouts, and CSS. JSX syntax is now fixed!
      </p>
    </div>
  )
}