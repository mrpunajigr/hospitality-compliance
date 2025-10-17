'use client'

// Admin Team - Enhanced user management with RBAC invitation system
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ImageUploader from '@/app/components/ImageUploader'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { getVersionDisplay } from '@/lib/version'
import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'
import { getModuleConfig } from '@/lib/module-config'
import { ModuleHeader } from '@/app/components/ModuleHeader'
// Removed RoleBasedSidebar - using AppleSidebar from layout instead
import UserInvitationModal from '@/app/components/team/UserInvitationModal'
import type { InvitationFormData, UserRole } from '@/app/components/team/UserInvitationModal'
import { Users, UserPlus, Settings, MoreVertical, Clock, Mail, Crown, Shield, Wrench, UserIcon } from 'lucide-react'

interface TeamMember {
  id: string
  email: string
  fullName: string
  role: UserRole
  status: 'active' | 'inactive' | 'pending'
  lastLogin?: string
  invitedAt?: string
  department?: string
  jobTitle?: string
  phone?: string
}

interface PendingInvitation {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  createdAt: string
  expiresAt: string
  inviterName: string
  department?: string
  jobTitle?: string
}

export default function AdminTeamPage() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  // =====================================================
  // DATA LOADING FUNCTIONS
  // =====================================================

  const loadTeamData = async (clientId: string) => {
    try {
      setRefreshing(true)

      // Load team members
      const { data: membersData, error: membersError } = await supabase
        .from('client_users')
        .select(`
          *,
          profiles!inner (
            id,
            email,
            full_name,
            phone
          )
        `)
        .eq('client_id', clientId)
        .order('role', { ascending: false })

      if (membersError) {
        console.error('Error loading team members:', membersError)
      } else {
        const members: TeamMember[] = membersData.map((member: any) => ({
          id: member.user_id,
          email: member.profiles.email,
          fullName: member.profiles.full_name || 'Unknown User',
          role: member.role as UserRole,
          status: member.status,
          lastLogin: member.last_active_at,
          invitedAt: member.invited_at,
          department: member.department,
          jobTitle: member.job_title,
          phone: member.profiles.phone
        }))
        setTeamMembers(members)
      }

      // Load pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('invitations')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          department,
          job_title,
          created_at,
          expires_at,
          status,
          profiles!invited_by (
            full_name
          )
        `)
        .eq('client_id', clientId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (invitationsError) {
        console.error('Error loading invitations:', invitationsError)
      } else {
        const invitations: PendingInvitation[] = invitationsData.map((invite: any) => ({
          id: invite.id,
          email: invite.email,
          firstName: invite.first_name,
          lastName: invite.last_name,
          role: invite.role as UserRole,
          department: invite.department,
          jobTitle: invite.job_title,
          createdAt: invite.created_at,
          expiresAt: invite.expires_at,
          inviterName: invite.profiles?.full_name || 'Team Admin'
        }))
        setPendingInvitations(invitations)
      }

    } catch (error) {
      console.error('Error loading team data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleInviteUser = async (invitationData: InvitationFormData) => {
    try {
      // Use demo client ID for now if userClient is not available
      const clientId = userClient?.clientId || '1'
      
      if (!clientId) {
        throw new Error('Client ID not found')
      }

      // Ensure we have a fresh, valid session token
      console.log('🔍 Refreshing session before API call...')
      
      // First, try to refresh the session to ensure token is current
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError) {
        console.warn('⚠️ Session refresh failed, using existing session:', refreshError)
      }
      
      // Use refreshed session if available, otherwise fall back to current session
      const { data: { session } } = await supabase.auth.getSession()
      const finalSession = refreshedSession || session
      
      console.log('🔍 Frontend session details:', {
        userId: finalSession?.user?.id,
        userEmail: finalSession?.user?.email,
        hasAccessToken: !!finalSession?.access_token,
        tokenPreview: finalSession?.access_token?.substring(0, 20) + '...',
        wasRefreshed: !!refreshedSession
      })
      
      // Verify the session user matches the frontend user we expect
      const expectedUserId = user?.id || userClient?.id
      if (finalSession?.user?.id !== expectedUserId) {
        console.error('❌ Session user mismatch!', {
          frontendUser: expectedUserId,
          sessionUser: finalSession?.user?.id
        })
        throw new Error('Session authentication mismatch. Please refresh the page and try again.')
      }
      
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${finalSession?.access_token || ''}`,
        },
        body: JSON.stringify({
          ...invitationData,
          clientId: clientId
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invitation')
      }

      // Refresh team data to show new invitation (skip in demo mode)
      if (clientId !== '1') {
        await loadTeamData(clientId)
      }

      return { success: true }
    } catch (error) {
      console.error('Error sending invitation:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send invitation' 
      }
    }
  }

  const handleDemoSignIn = async () => {
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
    
    setProfile({
      id: demoUser.id,
      full_name: 'Demo User',
      avatar_url: null,
      email: demoUser.email,
      role: 'OWNER',
      department: 'Management',
      phone: '+64 21 123 456',
      created_at: new Date().toISOString()
    })

    // Load demo team data
    setTeamMembers([
      { 
        id: '1', 
        email: 'admin@demo.com', 
        fullName: 'Demo User',
        role: 'OWNER', 
        status: 'active', 
        lastLogin: new Date().toISOString(),
        department: 'Management',
        jobTitle: 'Restaurant Owner'
      },
      { 
        id: '2', 
        email: 'kitchen@demo.com', 
        fullName: 'Kitchen Manager',
        role: 'MANAGER', 
        status: 'active', 
        lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        department: 'Kitchen',
        jobTitle: 'Head Chef'
      },
      { 
        id: '3', 
        email: 'front@demo.com', 
        fullName: 'Front Staff',
        role: 'STAFF', 
        status: 'active', 
        lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        department: 'Front of House',
        jobTitle: 'Server'
      }
    ])

    // Set demo pending invitations
    setPendingInvitations([
      {
        id: 'demo-pending-1',
        email: 'steve@newrestaurant.com',
        firstName: 'Steve',
        lastName: 'Laird',
        role: 'MANAGER',
        department: 'Kitchen',
        jobTitle: 'Sous Chef',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days left
        inviterName: 'Demo User'
      }
    ])
    
    setLoading(false)
    
    // Set user client for demo
    setUserClient({
      id: '1',
      clientId: '1',
      name: 'Demo Restaurant',
      role: 'OWNER'
    })
  }

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Admin Team: Starting auth check...')
      const { data: { user } } = await supabase.auth.getUser()
      
      console.log('🔍 Admin Team: User data:', user ? { id: user.id, email: user.email } : 'No user')
      
      if (!user) {
        console.log('❌ Admin Team: No user found, falling back to demo mode')
        await handleDemoSignIn()
      } else {
        console.log('✅ Admin Team: Real user found, loading client info...')
        setUser(user)
        
        try {
          console.log('🔍 Admin Team: Calling getUserClient for user ID:', user.id)
          const clientInfo = await getUserClient(user.id)
          console.log('🔍 Admin Team: Client info result:', clientInfo)
          
          if (clientInfo) {
            console.log('✅ Admin Team: Client info loaded successfully:', clientInfo.name)
            setUserClient(clientInfo)
            
            // CRITICAL: Load real team data for this client
            console.log('🔍 Admin Team: Loading team data for client ID:', clientInfo.clientId)
            await loadTeamData(clientInfo.clientId)
            console.log('✅ Admin Team: Team data loading completed')
          } else {
            console.log('❌ Admin Team: No client info found for user')
          }
          
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (profileData) {
            setProfile(profileData)
            setAvatarUrl(profileData.avatar_url)
          }
        } catch (error) {
          console.error('❌ Admin Team: Error loading client info or team data:', error)
        }
        
        setLoading(false)
      }
    }
    
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
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
            <p className={getTextStyle('body')}>Loading team...</p>
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
              Team Management
            </h1>
            <p className={`${getTextStyle('bodySmall')} mb-6`}>
              Please sign in to manage your team
            </p>
            
            <button
              onClick={handleDemoSignIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] mb-4"
            >
              LOGIN as Demo User
            </button>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <p className="text-xs text-white/70">
                Demo mode with test team data
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Main Content - Sidebar handled by admin layout */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 pt-8 pb-8">
      
      {/* Standardized Module Header */}
      <ModuleHeader 
        module={moduleConfig}
        currentPage="team"
      />
      
      {/* User Info Display */}
      {userClient && (
        <div className="mb-4 text-center">
          <p className="text-blue-300 text-sm">
            {userClient?.name || 'Loading...'} • {userClient?.role || 'OWNER'}
          </p>
        </div>
      )}

      <div className="flex gap-6">
        
        {/* Left Column - Team Management */}
        <div className="flex-1">
          
          {/* Team Overview Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            
            {/* Total Team Members */}
            <div className={getCardStyle('primary')}>
              <div className="mb-4">
                <h3 className="text-black text-lg font-semibold mb-3">Total Members</h3>
                <div className="flex justify-center mb-4">
                  <img 
                    src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRteam.png"
                    alt="Team Members"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <p className="text-gray-700 text-sm mb-4">
                  {teamMembers.length + pendingInvitations.length} Total
                </p>
              </div>
              <div className="text-gray-800 space-y-1 text-sm">
                <p><strong>Active:</strong> {teamMembers.filter(member => member.status === 'active').length}</p>
                <p><strong>Pending:</strong> {pendingInvitations.length}</p>
              </div>
            </div>

            {/* Active Users */}
            <div className={getCardStyle('primary')}>
              <div className="mb-4">
                <h3 className="text-black text-lg font-semibold mb-3">Active Users</h3>
                <div className="flex justify-center mb-4">
                  <img 
                    src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRStats.png"
                    alt="Active Users"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <p className="text-gray-700 text-sm mb-4">
                  {teamMembers.filter(member => member.status === 'active').length} Online
                </p>
              </div>
              <div className="text-gray-800 space-y-1 text-sm">
                <p><strong>Last Hour:</strong> 2</p>
                <p><strong>Today:</strong> {teamMembers.filter(member => member.status === 'active').length}</p>
              </div>
            </div>

            {/* Roles */}
            <div className={getCardStyle('primary')}>
              <div className="mb-4">
                <h3 className="text-black text-lg font-semibold mb-3">Roles</h3>
                <div className="flex justify-center mb-4">
                  <img 
                    src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRadmin.png"
                    alt="Administrator Roles"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <p className="text-gray-700 text-sm mb-4">
                  {teamMembers.filter(member => member.role === 'OWNER').length} Owners
                </p>
              </div>
              <div className="text-gray-800 space-y-1 text-sm">
                <p><strong>Managers:</strong> {teamMembers.filter(member => member.role === 'MANAGER').length}</p>
                <p><strong>Staff:</strong> {teamMembers.filter(member => member.role === 'STAFF').length}</p>
              </div>
            </div>

          </div>

          {/* Team Members List */}
          <div className={getCardStyle('primary')}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`${getTextStyle('sectionTitle')}`}>Team Members</h2>
              <button 
                onClick={() => setShowInviteModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                Invite Member
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Active Team Members */}
              {teamMembers.map((member) => (
                <div key={`member-${member.id}`} className={`${getCardStyle('secondary')} flex items-center justify-between`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {member.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className={`${getTextStyle('cardTitle')} text-base`}>{member.fullName}</h3>
                      <p className={`${getTextStyle('bodySmall')} text-white/70`}>{member.email}</p>
                      <div className="flex items-center space-x-2">
                        {member.department && (
                          <span className={`${getTextStyle('bodySmall')} text-blue-300`}>{member.department}</span>
                        )}
                        {member.department && member.jobTitle && (
                          <span className="text-white/40">•</span>
                        )}
                        {member.jobTitle && (
                          <span className={`${getTextStyle('bodySmall')} text-green-300`}>{member.jobTitle}</span>
                        )}
                        {!member.department && !member.jobTitle && (
                          <span className={`${getTextStyle('bodySmall')} text-white/60`}>{member.role}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <p className={`${getTextStyle('bodySmall')} text-white/70`}>Last: {member.lastLogin}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 'active' 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {member.status}
                    </div>
                    <button className="text-white/60 hover:text-white">
                      <span className="text-lg">⚙️</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Pending Invitations */}
              {pendingInvitations.map((invitation) => (
                <div key={`invitation-${invitation.id}`} className={`${getCardStyle('secondary')} flex items-center justify-between border-l-4 border-l-orange-500/50`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center border-2 border-orange-500/30">
                      <span className="text-sm font-semibold text-orange-300">
                        {invitation.firstName?.charAt(0)}{invitation.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className={`${getTextStyle('cardTitle')} text-base`}>{invitation.firstName} {invitation.lastName}</h3>
                      <p className={`${getTextStyle('bodySmall')} text-white/70`}>{invitation.email}</p>
                      <div className="flex items-center space-x-2">
                        {invitation.department && (
                          <span className={`${getTextStyle('bodySmall')} text-blue-300`}>{invitation.department}</span>
                        )}
                        {invitation.department && invitation.jobTitle && (
                          <span className="text-white/40">•</span>
                        )}
                        {invitation.jobTitle && (
                          <span className={`${getTextStyle('bodySmall')} text-green-300`}>{invitation.jobTitle}</span>
                        )}
                        {!invitation.department && !invitation.jobTitle && (
                          <span className={`${getTextStyle('bodySmall')} text-white/60`}>{invitation.role}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <p className={`${getTextStyle('bodySmall')} text-white/70`}>
                        Invited: {new Date(invitation.createdAt).toLocaleDateString()}
                      </p>
                      <p className={`${getTextStyle('bodySmall')} text-white/60`}>
                        Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      pending
                    </div>
                    <button className="text-white/60 hover:text-white" title="Cancel invitation">
                      <span className="text-lg">❌</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {teamMembers.length === 0 && pendingInvitations.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <p className={`${getTextStyle('body')} text-white/70 mb-2`}>No team members yet</p>
                  <p className={`${getTextStyle('bodySmall')} text-white/50`}>Start by inviting your first team member</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column - User Profile */}
        <div className="w-64">
          
          {/* Current User Profile */}
          <div className={getCardStyle('primary')}>
            <h2 className={`${getTextStyle('sectionTitle')} mb-6`}>Your Profile</h2>
            
            {/* Avatar Section */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/20">
                    <span className="text-2xl font-bold">
                      {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'DU'}
                    </span>
                  </div>
                )}
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs">
                  📷
                </button>
              </div>
            </div>

            {/* Profile Form */}
            <form className="space-y-4">
              <div>
                <label className={`block ${getTextStyle('label')} mb-2`}>Full Name</label>
                <input
                  type="text"
                  defaultValue={profile?.full_name || ''}
                  className={getFormFieldStyle()}
                />
              </div>
              
              <div>
                <label className={`block ${getTextStyle('label')} mb-2`}>Email</label>
                <input
                  type="email"
                  defaultValue={profile?.email || ''}
                  className={getFormFieldStyle()}
                />
              </div>
              
              <div>
                <label className={`block ${getTextStyle('label')} mb-2`}>Role</label>
                <select className={getFormFieldStyle()}>
                  <option value="OWNER">Owner</option>
                  <option value="MANAGER">Manager</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>
              
              <div>
                <label className={`block ${getTextStyle('label')} mb-2`}>Phone</label>
                <input
                  type="tel"
                  defaultValue={profile?.phone || ''}
                  className={getFormFieldStyle()}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-white/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Update
                </button>
              </div>
            </form>
          </div>

          {/* Quick Actions */}
          <div className={`${getCardStyle('secondary')} mt-6`}>
            <h3 className={`${getTextStyle('cardTitle')} mb-4`}>Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200">
                <div>
                  <h4 className={getTextStyle('body')}>Security Settings</h4>
                  <p className={`${getTextStyle('bodySmall')} text-white/70 mt-1`}>Change password & 2FA</p>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200">
                <div>
                  <h4 className={getTextStyle('body')}>Permissions</h4>
                  <p className={`${getTextStyle('bodySmall')} text-white/70 mt-1`}>Manage access levels</p>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200">
                <div>
                  <h4 className={getTextStyle('body')}>Audit Log</h4>
                  <p className={`${getTextStyle('bodySmall')} text-white/70 mt-1`}>View activity history</p>
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* User Invitation Modal */}
      {user && (
        <UserInvitationModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteUser}
          userRole={profile?.role || 'OWNER'}
          organizationName={userClient?.name || 'Loading...'}
        />
      )}
      </div>
    </div>
  )
}