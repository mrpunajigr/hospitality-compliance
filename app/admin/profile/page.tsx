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
  const [emailVerified, setEmailVerified] = useState<boolean>(false)
  const [verificationToken, setVerificationToken] = useState<string | null>(null)
  const [onboardingData, setOnboardingData] = useState({
    jobTitle: '',
    preferredName: '',
    businessType: 'restaurant',
    notificationPreferences: {
      emailAlerts: true,
      complianceReminders: true,
      weeklyReports: false
    }
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOnboarding = searchParams.get('onboarding') === 'true'

  const handleEmailVerification = async (token: string) => {
    try {
      console.log('🔐 Verifying email with token:', token.substring(0, 8) + '...')
      
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        console.log('✅ Email verification successful')
        setEmailVerified(true)
        // Remove verification token from URL
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('verify')
        window.history.replaceState({}, '', newUrl.toString())
      } else {
        console.error('❌ Email verification failed:', result.error)
        alert('Email verification failed: ' + result.error)
      }
    } catch (error) {
      console.error('❌ Email verification error:', error)
      alert('Email verification error. Please try again.')
    }
  }

  const handleResendVerification = async () => {
    try {
      if (!user?.email) {
        alert('No email address found')
        return
      }

      console.log('📧 Requesting verification email resend for:', user.email)

      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log('✅ Verification email resent successfully')
        alert('Verification email sent! Please check your inbox.')
      } else {
        console.error('❌ Failed to resend verification email:', result.error)
        alert('Failed to resend verification email: ' + result.error)
      }
    } catch (error) {
      console.error('❌ Resend verification error:', error)
      alert('Error sending verification email. Please try again.')
    }
  }

  const handleOnboardingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setOnboardingData(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [name]: checkbox.checked
        }
      }))
    } else {
      setOnboardingData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSaveOnboardingData = async () => {
    try {
      if (!user) return

      console.log('💾 Saving onboarding data:', onboardingData)

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          job_title: onboardingData.jobTitle,
          preferred_name: onboardingData.preferredName,
          notification_preferences: onboardingData.notificationPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('❌ Profile update error:', profileError)
        alert('Failed to update profile: ' + profileError.message)
        return
      }

      // Update business type in clients table if user has a client
      if (userClient && onboardingData.businessType !== userClient.business_type) {
        const { error: clientError } = await supabase
          .from('clients')
          .update({
            business_type: onboardingData.businessType,
            updated_at: new Date().toISOString()
          })
          .eq('id', userClient.clientId)

        if (clientError) {
          console.warn('⚠️ Business type update failed:', clientError)
        }
      }

      // Update job title in client_users if user has client relationship
      if (userClient) {
        const { error: clientUserError } = await supabase
          .from('client_users')
          .update({
            job_title: onboardingData.jobTitle,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('client_id', userClient.clientId)

        if (clientUserError) {
          console.warn('⚠️ Job title update failed:', clientUserError)
        }
      }

      console.log('✅ Onboarding data saved successfully')
      alert('Profile updated successfully!')

      // If this was onboarding, redirect to console
      if (isOnboarding) {
        router.push('/admin/console')
      }

    } catch (error) {
      console.error('❌ Save error:', error)
      alert('Failed to save profile changes. Please try again.')
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      // Check for verification token in URL
      const verifyToken = searchParams.get('verify')
      if (verifyToken) {
        setVerificationToken(verifyToken)
        await handleEmailVerification(verifyToken)
      }

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
          
          // Load email verification status and onboarding data
          setEmailVerified(profileData.email_verified || false)
          setOnboardingData({
            jobTitle: profileData.job_title || '',
            preferredName: profileData.preferred_name || '',
            businessType: userClient?.business_type || 'restaurant',
            notificationPreferences: profileData.notification_preferences || {
              emailAlerts: true,
              complianceReminders: true,
              weeklyReports: false
            }
          })
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
      
      {/* Standardized Module Header with Onboarding */}
      <ModuleHeader 
        module={moduleConfig}
        currentPage="profile"
        onboardingData={isOnboarding ? {
          userFirstName: user?.user_metadata?.full_name?.split(' ')[0] || 'there'
        } : undefined}
      />

      {/* User Info Display */}
      {userClient && (
        <div className="mb-4 text-center">
          <p className="text-gray-700 text-sm">
            {userClient.name} • {userClient.role}
          </p>
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

              {/* Onboarding Progress Indicator - Only show in onboarding mode */}
              {isOnboarding && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/50 rounded-2xl p-6 shadow-lg mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Complete Your Profile Setup</h2>
                  
                  {/* Progress Steps */}
                  <div className="mb-6">
                    <div className="flex items-center justify-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                          ✓
                        </div>
                        <span className="ml-2 text-green-600 font-medium">Account Created</span>
                      </div>
                      <div className="w-12 h-1 bg-green-500 rounded"></div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          2
                        </div>
                        <span className="ml-2 text-blue-600 font-medium">Your Profile</span>
                      </div>
                      <div className="w-12 h-1 bg-gray-300 rounded"></div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 font-semibold">
                          3
                        </div>
                        <span className="ml-2 text-gray-500">Complete Setup</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 text-center">
                    Fill out the fields below to personalize your JiGR experience!
                  </p>
                </div>
              )}

              {/* Email Verification Status */}
              {verificationToken || !emailVerified ? (
                <div className="bg-white/90 backdrop-blur-lg border border-orange-200/50 rounded-2xl p-6 shadow-lg mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        emailVerified ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {emailVerified ? '✓' : '⚠️'}
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {emailVerified ? 'Email Verified!' : 'Email Verification Required'}
                      </h3>
                      <p className="text-gray-600">
                        {emailVerified 
                          ? 'Your email address has been successfully verified.' 
                          : 'Please verify your email address to access all features.'
                        }
                      </p>
                    </div>
                    {!emailVerified && (
                      <div className="flex-shrink-0">
                        <button 
                          onClick={handleResendVerification}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                        >
                          Resend Email
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

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
                      <label className="block text-sm font-medium text-black mb-2">Preferred Name</label>
                      <input
                        type="text"
                        name="preferredName"
                        value={onboardingData.preferredName}
                        onChange={handleOnboardingInputChange}
                        placeholder="What should we call you?"
                        className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          defaultValue={profile?.email || 'demo@example.com'}
                          className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled
                        />
                        {emailVerified && (
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Job Title</label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={onboardingData.jobTitle}
                        onChange={handleOnboardingInputChange}
                        placeholder="e.g., Owner, Manager, Head Chef"
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
                      type="button"
                      onClick={handleSaveOnboardingData}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {isOnboarding ? 'Complete Setup' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Business Information */}
              {(isOnboarding || onboardingData.businessType) && (
                <div className="bg-white/90 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-6 shadow-lg mb-6">
                  <h2 className="text-xl font-semibold text-black mb-6">Business Information</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Business Type</label>
                      <select
                        name="businessType"
                        value={onboardingData.businessType}
                        onChange={handleOnboardingInputChange}
                        className="w-full px-4 py-3 bg-white/60 border border-gray-300/50 rounded-xl text-black backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="cafe">☕ Café</option>
                        <option value="restaurant">🍽️ Restaurant</option>
                        <option value="hotel">🏨 Hotel</option>
                        <option value="catering">🚐 Catering</option>
                        <option value="other">📦 Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Preferences */}
              {(isOnboarding || Object.values(onboardingData.notificationPreferences).some(v => v)) && (
                <div className="bg-white/90 backdrop-blur-lg border border-gray-200/50 rounded-2xl p-6 shadow-lg mb-6">
                  <h2 className="text-xl font-semibold text-black mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <p className="text-gray-600 mb-4">Stay informed with:</p>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="emailAlerts"
                        checked={onboardingData.notificationPreferences.emailAlerts}
                        onChange={handleOnboardingInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">Email alerts for compliance violations</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="complianceReminders"
                        checked={onboardingData.notificationPreferences.complianceReminders}
                        onChange={handleOnboardingInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">Weekly compliance reports</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="weeklyReports"
                        checked={onboardingData.notificationPreferences.weeklyReports}
                        onChange={handleOnboardingInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">Daily reminders</span>
                    </label>
                  </div>
                </div>
              )}

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