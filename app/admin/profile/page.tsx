'use client'

// User Profile Page - Personal account settings
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ImageUploader from '@/app/components/ImageUploader'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { getVersionDisplay } from '@/lib/version'
import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'
import { ModuleHeader } from '@/app/components/ModuleHeader'
import { getModuleConfig } from '@/lib/module-config'

function ProfilePageContent() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean>(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOnboarding = searchParams.get('onboarding') === 'true'

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Auto sign-in as demo user for development
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
        
        // Set demo profile
        setProfile({
          id: demoUser.id,
          email: demoUser.email,
          full_name: demoUser.user_metadata?.full_name || 'Demo User',
          avatar_url: null,
          phone: '+64 21 123 4567'
        })
      } else {
        setUser(user)
        
        // Get user's company information and check access permissions
        try {
          const clientInfo = await getUserClient(user.id)
          if (clientInfo) {
            setUserClient(clientInfo)
            
            // Check if user has permission to access profile management
            // Allow: Administrators, Owners, or the profile owner themselves
            const hasProfileAccess = 
              clientInfo.role === 'Administrator' || 
              clientInfo.role === 'Owner' ||
              user.id === user.id // Profile owner (they can always edit their own profile)
            
            setHasAccess(hasProfileAccess)
            
            if (!hasProfileAccess) {
              console.warn('Access denied: User does not have permission to access profile management')
            }
          }
        } catch (error) {
          console.error('Error loading client info:', error)
        }
        
        // Fetch user profile data
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (!error && profileData) {
          setProfile(profileData)
          setAvatarUrl(profileData.avatar_url)
        } else {
          // Demo fallback
          setProfile({
            id: user.id,
            email: user.email || 'demo@example.com',
            full_name: user.user_metadata?.full_name || 'Demo User',
            avatar_url: null,
            phone: '+64 21 123 4567'
          })
        }
      }
      
      setLoading(false)
    }
    
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        setUser(session.user)
      }
      // Don't set user to null if session is null - preserve demo user
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAvatarUploadSuccess = (imageUrl: string) => {
    setAvatarUrl(imageUrl)
    // Show success message
    alert('Avatar updated successfully!')
  }

  const handleAvatarUploadError = (error: string) => {
    console.error('Avatar upload error:', error)
    alert(`Avatar upload failed: ${error}`)
  }

  const handleDemoSignIn = async () => {
    try {
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
      
      if (!anonError && anonData.user) {
        console.log('Anonymous demo user signed in successfully')
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
      
    } catch (err) {
      console.error('Demo sign in error:', err)
      
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
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-black font-medium">Loading Profile...</p>
          </div>
        </div>
      </div>
    )
  }

  // Access Control Check
  if (!hasAccess && userClient) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-16 pb-8">
        <ModuleHeader 
          module={getModuleConfig('admin')!}
          currentPage=""
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-8 shadow-lg max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚫</span>
              </div>
              <h1 className="text-xl font-semibold text-black mb-2">Access Denied</h1>
              <p className="text-gray-700 mb-4">
                You don&apos;t have permission to access profile management. 
                Only Administrators, Owners, or the profile owner can edit profile information.
              </p>
              <p className="text-sm text-gray-600">
                Current Role: {userClient.role}
              </p>
            </div>
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
              User Profile
            </h1>
            <p className={`${getTextStyle('bodySmall')} mb-6`}>
              Please sign in to view your profile
            </p>
            
            <button
              onClick={handleDemoSignIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] mb-4"
            >
              Sign In as Demo User
            </button>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <p className="text-xs text-white/70">
                Demo mode with test profile data
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const moduleConfig = getModuleConfig('admin')
  
  if (!moduleConfig) {
    return <div>Module configuration not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-16 pb-8">
      
      {/* Standardized Module Header */}
      <ModuleHeader 
        module={moduleConfig}
        currentPage="profile"
      />

      {/* User Info Display */}
      {userClient && (
        <div className="mb-4 text-center">
          <p className="text-gray-700 text-sm">
            {userClient.name} • {userClient.role}
          </p>
        </div>
      )}

      {/* Onboarding Welcome Section */}
      {isOnboarding && (
        <div className="text-center mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
            <span className="text-2xl">👋</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to JiGR, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-600 mb-6">
            Let&apos;s personalize your compliance experience!
          </p>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <span className="ml-2 text-sm text-green-600 font-medium">Account Created</span>
            </div>
            <div className="w-12 h-0.5 bg-blue-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <span className="ml-2 text-sm text-blue-600 font-medium">Your Profile</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-bold">3</span>
              </div>
              <span className="ml-2 text-sm text-gray-500 font-medium">Company Setup</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-8">
          
          <div className="flex gap-6">
            
            {/* Left Column - Main Content */}
            <div className="flex-1">
              
              {/* Profile Overview */}
              <div className="bg-white/90 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-6 shadow-lg mb-6">
                <div className="flex items-start space-x-6 mb-6">
                  {/* Avatar Upload */}
                  <div className="flex-shrink-0">
                    <ImageUploader
                      currentImageUrl={avatarUrl}
                      onUploadSuccess={handleAvatarUploadSuccess}
                      onUploadError={handleAvatarUploadError}
                      uploadEndpoint="/api/upload-avatar"
                      uploadData={{ userId: user?.id || '' }}
                      acceptedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
                      maxSizeMB={5}
                      shape="circle"
                      size="large"
                      title="Profile Picture"
                      description="Click to change avatar"
                    />
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 pt-4">
                    <h2 className="text-2xl font-semibold text-black">{profile?.full_name || 'Demo User'}</h2>
                    <p className="text-gray-800">{profile?.email || 'demo@example.com'}</p>
                    <p className="text-sm text-gray-700 mt-1">Administrator • Demo Restaurant Ltd</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">47</div>
                    <div className="text-sm text-gray-700">Documents Uploaded</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">12</div>
                    <div className="text-sm text-gray-700">Days Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-black">98%</div>
                    <div className="text-sm text-gray-700">Compliance Rate</div>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white/90 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-6 shadow-lg mb-6">
                <h2 className="text-xl font-semibold text-black mb-6">Personal Information</h2>
                
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue={profile?.full_name || 'Demo User'}
                        className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Email Address</label>
                      <input
                        type="email"
                        defaultValue={profile?.email || 'demo@example.com'}
                        className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue={profile?.phone || '+64 21 123 4567'}
                        className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Timezone</label>
                      <select className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-gray-900 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="Pacific/Auckland">New Zealand (NZST)</option>
                        <option value="Australia/Sydney">Australia (AEST)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      className="bg-white/40 hover:bg-white/60 text-black font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-gray-300/40 backdrop-blur-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

              {/* Password & Security */}
              <div className="bg-white/90 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-6 shadow-lg mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Password & Security</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="bg-white/20 rounded-xl p-4 border border-white/20">
                    <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Activity Log */}
              <div className="bg-white/90 backdrop-blur-lg border border-white/40 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Uploaded delivery document</h4>
                      <p className="text-sm text-gray-600">Today at 2:15 PM</p>
                    </div>
                    <div className="text-green-400">✓</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Generated weekly report</h4>
                      <p className="text-sm text-gray-600">Yesterday at 11:30 AM</p>
                    </div>
                    <div className="text-blue-400">📄</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/20 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Signed in from new device</h4>
                      <p className="text-sm text-gray-600">2 days ago at 9:45 AM</p>
                    </div>
                    <div className="text-yellow-400">🔑</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column - Account Actions Sidebar */}
            <div className="w-64">
              <div className="bg-white/90 backdrop-blur-lg border border-white/40 rounded-2xl p-6 shadow-lg sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Actions</h2>
                
                <div>
                  <button className="block w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 text-left">
                    <div>
                      <h3 className="font-semibold text-lg">Download My Data</h3>
                      <p className="text-sm text-blue-100 mt-1">Export all your data</p>
                    </div>
                  </button>
                  
                  <button className="block w-full mb-4 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 text-left">
                    <div>
                      <h3 className="font-semibold text-lg">Sign Out All Devices</h3>
                      <p className="text-sm text-yellow-100 mt-1">Security action</p>
                    </div>
                  </button>
                  
                  <button className="block w-full bg-red-600 hover:bg-red-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 text-left">
                    <div>
                      <h3 className="font-semibold text-lg">Delete Account</h3>
                      <p className="text-sm text-red-100 mt-1">Permanent action</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

          </div>
          
          {/* Version */}
          <div className="text-center mt-8">
            <span className={`${getTextStyle('version')} text-white/60`}>{getVersionDisplay('short')}</span>
          </div>

        </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageContent />
    </Suspense>
  )
}