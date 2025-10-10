'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserClient } from '@/lib/rbac-core'
import { updateOnboardingProgress } from '@/lib/onboarding-progress'

interface UserProfileData {
  jobTitle: string
  phoneNumber: string
  preferredName: string
  businessType: string
  notificationPreferences: {
    emailAlerts: boolean
    complianceReminders: boolean
    weeklyReports: boolean
  }
}

export default function ProfileCompletePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<any>(null)
  const [profileData, setProfileData] = useState<UserProfileData>({
    jobTitle: '',
    phoneNumber: '',
    preferredName: '',
    businessType: 'restaurant',
    notificationPreferences: {
      emailAlerts: true,
      complianceReminders: true,
      weeklyReports: false
    }
  })
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/')
        return
      }
      
      setUser(user)
      
      // Get user's company info
      try {
        const clientInfo = await getUserClient(user.id)
        if (clientInfo) {
          setUserClient(clientInfo)
          // Pre-fill business type if available
          if (clientInfo.business_type) {
            setProfileData(prev => ({
              ...prev,
              businessType: clientInfo.business_type || 'restaurant'
            }))
          }
        }
      } catch (error) {
        console.error('Error loading client info:', error)
      }
      
      // Pre-fill from user metadata
      if (user.user_metadata?.full_name) {
        const firstName = user.user_metadata.full_name.split(' ')[0]
        setProfileData(prev => ({
          ...prev,
          preferredName: firstName
        }))
      }
    }
    
    checkAuth()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setProfileData(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [name]: checkbox.checked
        }
      }))
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!user) {
        setError('User not found')
        setIsLoading(false)
        return
      }

      // Update user profile
      const profileUpdateData: any = {
        full_name: user.user_metadata?.full_name,
        phone: profileData.phoneNumber || null,
        updated_at: new Date().toISOString()
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
        setError('Failed to update profile')
        setIsLoading(false)
        return
      }

      // Update client_users with job title
      if (userClient) {
        const { error: clientUserError } = await supabase
          .from('client_users')
          .update({
            job_title: profileData.jobTitle || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('client_id', userClient.clientId)

        if (clientUserError) {
          console.warn('Job title update failed:', clientUserError)
          // Don't fail the whole process for this
        }
      }

      // Update business type in clients table if changed
      if (userClient && profileData.businessType !== userClient.business_type) {
        const { error: businessTypeError } = await supabase
          .from('clients')
          .update({
            business_type: profileData.businessType,
            updated_at: new Date().toISOString()
          })
          .eq('id', userClient.clientId)

        if (businessTypeError) {
          console.warn('Business type update failed:', businessTypeError)
          // Don't fail the whole process for this
        }
      }

      // Track onboarding progress
      await updateOnboardingProgress(user.id, 'profile', {
        jobTitle: profileData.jobTitle,
        phoneNumber: profileData.phoneNumber,
        preferredName: profileData.preferredName,
        businessType: profileData.businessType,
        notificationPreferences: profileData.notificationPreferences
      })

      console.log('✅ Profile completion successful')
      
      // Redirect to admin console for company setup
      router.push('/admin/console?onboarding=complete')
      
    } catch (error) {
      console.error('Profile completion error:', error)
      setError('Failed to complete profile. Please try again.')
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    // Allow users to skip profile completion
    router.push('/admin/console?onboarding=skipped')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-32 h-8 mx-auto mb-6">
            <img 
              src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_full.png" 
              alt="JiGR Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to JiGR, {user.user_metadata?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-gray-600">
            Let&apos;s personalize your compliance experience!
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                ✓
              </div>
              <span className="ml-2 text-green-600 font-medium">Account Created</span>
            </div>
            <div className="w-12 h-1 bg-blue-500 rounded"></div>
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
              <span className="ml-2 text-gray-500">Company Setup</span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleComplete} className="space-y-6">
            
            {/* Job Title */}
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Your Job Title
              </label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                placeholder="e.g., Owner, Manager, Head Chef"
                value={profileData.jobTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="e.g., +64 21 123 4567"
                value={profileData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Preferred Name */}
            <div>
              <label htmlFor="preferredName" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Name <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                id="preferredName"
                name="preferredName"
                placeholder="What should we call you?"
                value={profileData.preferredName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Business Type */}
            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <select
                id="businessType"
                name="businessType"
                value={profileData.businessType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="cafe">☕ Café</option>
                <option value="restaurant">🍽️ Restaurant</option>
                <option value="hotel">🏨 Hotel</option>
                <option value="catering">🚐 Catering</option>
                <option value="other">📦 Other</option>
              </select>
            </div>

            {/* Notification Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Stay informed with:
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="emailAlerts"
                    checked={profileData.notificationPreferences.emailAlerts}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">Email alerts for compliance violations</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="complianceReminders"
                    checked={profileData.notificationPreferences.complianceReminders}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">Weekly compliance reports</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="weeklyReports"
                    checked={profileData.notificationPreferences.weeklyReports}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">Daily reminders</span>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Continue to Company Setup'
                )}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                Skip for Now
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Need help? Contact us at <a href="mailto:dev@jigr.app" className="text-blue-600 hover:text-blue-800">dev@jigr.app</a></p>
        </div>
      </div>
    </div>
  )
}