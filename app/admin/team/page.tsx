'use client'

// Admin Team - User management and team settings
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ImageUploader from '@/app/components/ImageUploader'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { getVersionDisplay } from '@/lib/version'
import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'
import { getModuleConfig } from '@/lib/module-config'
import { ModuleHeader } from '@/app/components/ModuleHeader'

export default function AdminTeamPage() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [teamMembers] = useState([
    { id: '1', name: 'Admin User', email: 'admin@demo.com', role: 'Administrator', status: 'Active', lastLogin: '2 hours ago' },
    { id: '2', name: 'Kitchen Manager', email: 'kitchen@demo.com', role: 'Manager', status: 'Active', lastLogin: '1 day ago' },
    { id: '3', name: 'Front Staff', email: 'front@demo.com', role: 'Staff', status: 'Active', lastLogin: '3 days ago' },
    { id: '4', name: 'Delivery Staff', email: 'delivery@demo.com', role: 'Staff', status: 'Inactive', lastLogin: '1 week ago' }
  ])
  const router = useRouter()

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
      role: 'Administrator',
      department: 'Management',
      phone: '+64 21 123 456',
      created_at: new Date().toISOString()
    })
    
    setLoading(false)
  }

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        await handleDemoSignIn()
      } else {
        setUser(user)
        
        try {
          const clientInfo = await getUserClient(user.id)
          if (clientInfo) {
            setUserClient(clientInfo)
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
          console.error('Error loading profile:', error)
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
              Sign In as Demo User
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
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-16 pb-8">
      
      {/* Standardized Module Header */}
      <ModuleHeader 
        module={moduleConfig}
        currentPage="team"
      />
      
      {/* User Info Display */}
      {userClient && (
        <div className="mb-4 text-center">
          <p className="text-blue-300 text-sm">
            {userClient.name} • {userClient.role}
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
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className={getTextStyle('cardTitle')}>Total Members</h3>
                <p className={`${getTextStyle('bodyLarge')} mt-2 font-bold`}>
                  {teamMembers.length}
                </p>
              </div>
            </div>

            {/* Active Users */}
            <div className={getCardStyle('primary')}>
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className={getTextStyle('cardTitle')}>Active</h3>
                <p className={`${getTextStyle('bodyLarge')} mt-2 font-bold text-green-400`}>
                  {teamMembers.filter(member => member.status === 'Active').length}
                </p>
              </div>
            </div>

            {/* Roles */}
            <div className={getCardStyle('primary')}>
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className={getTextStyle('cardTitle')}>Administrators</h3>
                <p className={`${getTextStyle('bodyLarge')} mt-2 font-bold text-purple-400`}>
                  {teamMembers.filter(member => member.role === 'Administrator').length}
                </p>
              </div>
            </div>

          </div>

          {/* Team Members List */}
          <div className={getCardStyle('primary')}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`${getTextStyle('sectionTitle')}`}>Team Members</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200">
                Invite Member
              </button>
            </div>
            
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className={`${getCardStyle('secondary')} flex items-center justify-between`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className={`${getTextStyle('cardTitle')} text-base`}>{member.name}</h3>
                      <p className={`${getTextStyle('bodySmall')} text-white/70`}>{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <p className={`${getTextStyle('body')} font-medium`}>{member.role}</p>
                      <p className={`${getTextStyle('bodySmall')} text-white/70`}>Last: {member.lastLogin}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 'Active' 
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
            </div>
          </div>

        </div>

        {/* Right Column - User Profile */}
        <div className="w-80">
          
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
                  <option value="Administrator">Administrator</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
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
    </div>
  )
}