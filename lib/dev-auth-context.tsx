'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { DevUser, DevRole, DevSessionManager, logDevAccess } from './dev-auth'
import { getUserClient } from '@/lib/auth-utils'
import { supabase } from '@/lib/supabase'

interface DevAuthContextType {
  devUser: DevUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  hasRole: (role: DevRole) => boolean
  logAccess: (action: string, resource: string) => void
}

const DevAuthContext = createContext<DevAuthContextType | undefined>(undefined)

interface DevAuthProviderProps {
  children: ReactNode
}

export function DevAuthProvider({ children }: DevAuthProviderProps) {
  const [devUser, setDevUser] = useState<DevUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    console.log('🔧 DEV AUTH: Initializing context, checking for existing session...')
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('🔧 DEV AUTH: Session check timeout - forcing no session state')
      setDevUser(null)
      setIsLoading(false)
    }, 2000) // 2 second timeout
    
    try {
      const session = DevSessionManager.getSession()
      console.log('🔧 DEV AUTH: Session check result:', session ? `${session.username} (${session.role})` : 'No session')
      clearTimeout(timeout)
      setDevUser(session)
      setIsLoading(false)
      
      if (session) {
        logDevAccess(session, 'SESSION_RESTORED', 'dev-auth-context')
      }
    } catch (error) {
      console.error('🚫 DEV AUTH: Error during session check:', error)
      clearTimeout(timeout)
      setDevUser(null)
      setIsLoading(false)
    }
    
    return () => clearTimeout(timeout)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Make API call to verify credentials
      const response = await fetch('/api/dev-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        const userData = await response.json()
        const devUserData: DevUser = {
          username: userData.username,
          role: userData.role,
          loginTime: userData.loginTime,
          expiresAt: userData.expiresAt
        }
        
        DevSessionManager.setSession(devUserData)
        setDevUser(devUserData)
        
        logDevAccess(devUserData, 'LOGIN_SUCCESS', 'dev-portal')
        return true
      }
      
      return false
    } catch (error) {
      console.error('DEV login error:', error)
      return false
    }
  }

  const logout = () => {
    if (devUser) {
      logDevAccess(devUser, 'LOGOUT', 'dev-portal')
    }
    
    DevSessionManager.clearSession()
    setDevUser(null)
  }

  const hasRole = (role: DevRole): boolean => {
    return DevSessionManager.hasRole(role)
  }

  const logAccess = (action: string, resource: string) => {
    if (devUser) {
      logDevAccess(devUser, action, resource)
    }
  }

  const value: DevAuthContextType = {
    devUser,
    isAuthenticated: !!devUser,
    isLoading,
    login,
    logout,
    hasRole,
    logAccess
  }

  return (
    <DevAuthContext.Provider value={value}>
      {children}
    </DevAuthContext.Provider>
  )
}

export function useDevAuth() {
  const context = useContext(DevAuthContext)
  if (context === undefined) {
    throw new Error('useDevAuth must be used within a DevAuthProvider')
  }
  return context
}

// Higher-order component for protecting dev routes
interface WithDevAuthProps {
  requiredRole?: DevRole
  fallback?: ReactNode
}

export function withDevAuth<P extends object>(
  Component: React.ComponentType<P>,
  { requiredRole = 'DEV', fallback }: WithDevAuthProps = {}
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, hasRole, isLoading } = useDevAuth()

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white">Verifying DEV access...</p>
          </div>
        </div>
      )
    }

    if (!isAuthenticated || !hasRole(requiredRole)) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-3xl">🔒</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-lg text-gray-300 mb-6">
              You need {requiredRole} level access to view this content.
            </p>
            <a
              href="/dev/login"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              DEV Login
            </a>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

/**
 * Higher-order component that allows both DEV users and Heroes access
 */
export function withHeroOrDevAuth<P extends object>(
  Component: React.ComponentType<P>,
  { fallback }: { fallback?: React.ReactNode } = {}
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated: devAuthenticated, isLoading: devLoading } = useDevAuth()
    const [heroAccess, setHeroAccess] = useState(false)
    const [heroLoading, setHeroLoading] = useState(true)

    useEffect(() => {
      const checkHeroAccess = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const clientInfo = await getUserClient(session.user.id)
            if (clientInfo?.champion_enrolled) {
              setHeroAccess(true)
            }
          }
        } catch (error) {
          console.log('Hero access check failed:', error)
        } finally {
          setHeroLoading(false)
        }
      }

      if (!devAuthenticated) {
        checkHeroAccess()
      } else {
        setHeroLoading(false)
      }
    }, [devAuthenticated])

    if (devLoading || heroLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white">Verifying access...</p>
          </div>
        </div>
      )
    }

    if (!devAuthenticated && !heroAccess) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-2xl font-bold text-white mb-4">Access Required</h1>
            <p className="text-gray-300 mb-6">
              This area requires DEV access or Hero program enrollment.
            </p>
            <button
              onClick={() => window.location.href = '/admin/profile'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Back to Profile
            </button>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}