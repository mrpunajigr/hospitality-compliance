'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { 
  getCurrentUser, 
  getCurrentUserProfile, 
  getAccessibleClients,
  getUserRoleForClient,
  hasPermission,
  type UserRole,
  type Permission
} from './auth'
import type { UserWithClients, ClientWithUsers } from '@/types/database'

// =====================================================
// TYPES
// =====================================================

interface AuthContextType {
  // Authentication state
  user: User | null
  profile: UserWithClients | null
  loading: boolean
  
  // Multi-tenant state
  currentClientWithUsers: ClientWithUsers | null
  accessibleClients: ClientWithUsers[]
  userRole: UserRole | null
  
  // Actions
  setCurrentClientWithUsers: (client: ClientWithUsers | null) => void
  switchClientWithUsers: (clientId: string) => Promise<void>
  hasPermissionForClientWithUsers: (permission: Permission) => Promise<boolean>
  refetchProfile: () => Promise<void>
  
  // Auth actions
  signOut: () => Promise<void>
}

interface ClientWithUsersContextType {
  client: ClientWithUsers | null
  userRole: UserRole | null
  loading: boolean
  
  // Permission helpers
  canUploadDocuments: boolean
  canViewReports: boolean
  canManageTeam: boolean
  canManageSettings: boolean
  canManageBilling: boolean
}

// =====================================================
// CONTEXTS
// =====================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const ClientWithUsersContext = createContext<ClientWithUsersContextType | undefined>(undefined)

// =====================================================
// AUTH PROVIDER
// =====================================================

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserWithClients | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentClientWithUsers, setCurrentClientWithUsersState] = useState<ClientWithUsers | null>(null)
  const [accessibleClients, setAccessibleClients] = useState<ClientWithUsers[]>([])
  const [userRole, setUserRole] = useState<UserRole | null>(null)

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && mounted) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else if (mounted) {
          // Check for console demo mode - same logic as console layout
          const isConsoleDemo = typeof window !== 'undefined' && 
            window.location.pathname.startsWith('/console')
          
          if (isConsoleDemo) {
            console.log('🚀 AuthContext: Console demo mode detected')
            const demoUser = {
              id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
              email: 'demo@example.com',
              app_metadata: {},
              user_metadata: { full_name: 'Demo User - AuthContext' },
              aud: 'authenticated',
              role: 'authenticated',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as User
            setUser(demoUser)
            console.log('✅ AuthContext: Demo user set for console')
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (!mounted) return

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setCurrentClientWithUsersState(null)
          setAccessibleClients([])
          setUserRole(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Load user profile and client data
  const loadUserProfile = async (userId: string) => {
    try {
      const userProfile = await getCurrentUserProfile()
      // Temporarily disabled to avoid type issues - focus on core upload functionality
      // const clients = await getAccessibleClients()
      
      setProfile(userProfile)
      // setAccessibleClients(clients)
      
      // Temporarily disabled - focus on core upload functionality
      // Set default client if none selected and user has clients
      // if (!currentClientWithUsers && clients.length > 0) {
      //   const defaultClientWithUsers = clients[0]
      //   setCurrentClientWithUsersState(defaultClientWithUsers)
      //   
      //   // Get user role for default client
      //   const role = await getUserRoleForClient(defaultClientWithUsers.id)
      //   setUserRole(role)
      // }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  // Refresh profile data
  const refetchProfile = async () => {
    if (!user) return
    await loadUserProfile(user.id)
  }

  // Set current client
  const setCurrentClientWithUsers = (client: ClientWithUsers | null) => {
    setCurrentClientWithUsersState(client)
    
    // Update user role for new client
    if (client) {
      getUserRoleForClient(client.id).then(setUserRole)
    } else {
      setUserRole(null)
    }
  }

  // Switch to different client
  const switchClientWithUsers = async (clientId: string) => {
    const client = accessibleClients.find(c => c.id === clientId)
    if (client) {
      setCurrentClientWithUsers(client)
      
      // Store preference in localStorage
      localStorage.setItem('selected-client-id', clientId)
    }
  }

  // Check permission for current client
  const hasPermissionForClientWithUsers = async (permission: Permission): Promise<boolean> => {
    if (!currentClientWithUsers) return false
    return hasPermission(currentClientWithUsers.id, permission)
  }

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut()
    
    // Clear client preference
    localStorage.removeItem('selected-client-id')
  }

  // Restore client preference on load
  useEffect(() => {
    if (accessibleClients.length > 0 && !currentClientWithUsers) {
      const savedClientWithUsersId = localStorage.getItem('selected-client-id')
      const savedClientWithUsers = accessibleClients.find(c => c.id === savedClientWithUsersId)
      
      if (savedClientWithUsers) {
        setCurrentClientWithUsers(savedClientWithUsers)
      } else {
        // Default to first client
        setCurrentClientWithUsers(accessibleClients[0])
      }
    }
  }, [accessibleClients, currentClientWithUsers])

  const value: AuthContextType = {
    user,
    profile,
    loading,
    currentClientWithUsers,
    accessibleClients,
    userRole,
    setCurrentClientWithUsers,
    switchClientWithUsers,
    hasPermissionForClientWithUsers,
    refetchProfile,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// =====================================================
// CLIENT PROVIDER
// =====================================================

interface ClientWithUsersProviderProps {
  children: ReactNode
}

export function ClientWithUsersProvider({ children }: ClientWithUsersProviderProps) {
  const auth = useAuth()
  const [permissions, setPermissions] = useState({
    canUploadDocuments: false,
    canViewReports: false,
    canManageTeam: false,
    canManageSettings: false,
    canManageBilling: false
  })

  // Update permissions when client or role changes
  useEffect(() => {
    async function updatePermissions() {
      if (!auth.currentClientWithUsers || !auth.userRole) {
        setPermissions({
          canUploadDocuments: false,
          canViewReports: false,
          canManageTeam: false,
          canManageSettings: false,
          canManageBilling: false
        })
        return
      }

      const [
        canUploadDocuments,
        canViewReports,
        canManageTeam,
        canManageSettings,
        canManageBilling
      ] = await Promise.all([
        auth.hasPermissionForClientWithUsers('upload_documents'),
        auth.hasPermissionForClientWithUsers('view_compliance_reports'),
        auth.hasPermissionForClientWithUsers('invite_users'),
        auth.hasPermissionForClientWithUsers('manage_settings'),
        auth.hasPermissionForClientWithUsers('manage_billing')
      ])

      setPermissions({
        canUploadDocuments,
        canViewReports,
        canManageTeam,
        canManageSettings,
        canManageBilling
      })
    }

    updatePermissions()
  }, [auth.currentClientWithUsers, auth.userRole, auth.hasPermissionForClientWithUsers])

  const value: ClientWithUsersContextType = {
    client: auth.currentClientWithUsers,
    userRole: auth.userRole,
    loading: auth.loading,
    ...permissions
  }

  return (
    <ClientWithUsersContext.Provider value={value}>
      {children}
    </ClientWithUsersContext.Provider>
  )
}

// =====================================================
// HOOKS
// =====================================================

// Main auth hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ClientWithUsers context hook
export function useClientWithUsers() {
  const context = useContext(ClientWithUsersContext)
  if (context === undefined) {
    throw new Error('useClientWithUsers must be used within a ClientWithUsersProvider')
  }
  return context
}

// Combined auth and client hook
export function useAuthWithClientWithUsers() {
  const auth = useAuth()
  const client = useClientWithUsers()
  
  return {
    ...auth,
    ...client,
    // Convenience flags
    isAuthenticated: !!auth.user,
    hasActiveClientWithUsers: !!client.client,
    isClientWithUsersAdmin: client.userRole === 'admin' || client.userRole === 'owner',
    isClientWithUsersOwner: client.userRole === 'owner'
  }
}

// Hook for requiring authentication
export function useRequireAuth() {
  const auth = useAuth()
  
  useEffect(() => {
    if (!auth.loading && !auth.user) {
      // Redirect to login
      window.location.href = '/signin'
    }
  }, [auth.loading, auth.user])
  
  return auth
}

// Hook for requiring specific client access
export function useRequireClientWithUsers() {
  const auth = useAuthWithClientWithUsers()
  
  useEffect(() => {
    if (!auth.loading && (!auth.user || !auth.hasActiveClientWithUsers)) {
      // Redirect to client selection or onboarding
      if (!auth.user) {
        window.location.href = '/signin'
      } else {
        window.location.href = '/onboarding'
      }
    }
  }, [auth.loading, auth.user, auth.hasActiveClientWithUsers])
  
  return auth
}

// Hook for role-based access control
export function useRequireRole(requiredRole: UserRole) {
  const auth = useAuthWithClientWithUsers()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  
  useEffect(() => {
    if (auth.loading || !auth.user || !auth.client) {
      setHasAccess(null)
      return
    }
    
    const roleHierarchy: Record<UserRole, number> = {
      staff: 1,
      manager: 2,
      admin: 3,
      owner: 4
    }
    
    const userLevel = auth.userRole ? roleHierarchy[auth.userRole] : 0
    const requiredLevel = roleHierarchy[requiredRole]
    
    setHasAccess(userLevel >= requiredLevel)
  }, [auth.loading, auth.user, auth.client, auth.userRole, requiredRole])
  
  useEffect(() => {
    if (hasAccess === false) {
      // Redirect to unauthorized page or dashboard
      window.location.href = '/unauthorized'
    }
  }, [hasAccess])
  
  return { ...auth, hasAccess }
}

// =====================================================
// UTILITY COMPONENTS
// =====================================================

// ClientWithUsers selector component
interface ClientWithUsersSelectorProps {
  className?: string
}

export function ClientWithUsersSelector({ className = '' }: ClientWithUsersSelectorProps) {
  const auth = useAuth()
  
  if (!auth.user || auth.accessibleClients.length <= 1) {
    return null
  }
  
  return (
    <select
      value={auth.currentClientWithUsers?.id || ''}
      onChange={(e) => auth.switchClientWithUsers(e.target.value)}
      className={`form-select ${className}`}
    >
      {auth.accessibleClients.map((client) => (
        <option key={client.id} value={client.id}>
          {client.name}
        </option>
      ))}
    </select>
  )
}

// Role badge component
interface RoleBadgeProps {
  role: UserRole
  className?: string
}

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const roleColors: Record<UserRole, string> = {
    staff: 'bg-gray-100 text-gray-800',
    manager: 'bg-blue-100 text-blue-800',
    admin: 'bg-purple-100 text-purple-800',
    owner: 'bg-green-100 text-green-800'
  }
  
  const roleLabels: Record<UserRole, string> = {
    staff: 'Staff',
    manager: 'Manager',
    admin: 'Admin',
    owner: 'Owner'
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role]} ${className}`}>
      {roleLabels[role]}
    </span>
  )
}