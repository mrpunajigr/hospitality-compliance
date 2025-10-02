'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getVersionDisplay } from '@/lib/version'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

// Progress Indicator Component
const ProgressIndicator = () => (
  <div className="mb-8 w-full">
    <div className="flex items-center justify-between max-w-md mx-auto">
      {/* Step 1: Account Created */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-xs font-medium text-green-200">Account</span>
      </div>
      
      {/* Progress Line */}
      <div className="flex-1 h-1 bg-white/20 mx-3 rounded">
        <div className="h-full bg-blue-500 rounded" style={{width: '50%'}}></div>
      </div>
      
      {/* Step 2: Your Profile (Current) */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-1">
          <span className="text-white font-bold text-sm">2</span>
        </div>
        <span className="text-xs font-medium text-blue-200">Your Profile</span>
      </div>
      
      {/* Progress Line */}
      <div className="flex-1 h-1 bg-white/20 mx-3 rounded"></div>
      
      {/* Step 3: Company Setup */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mb-1">
          <span className="text-white/60 font-bold text-sm">3</span>
        </div>
        <span className="text-xs font-medium text-white/60">Company</span>
      </div>
    </div>
  </div>
)

function UpdateProfileContent() {
  const [formData, setFormData] = useState({
    preferredName: '',
    mobileNumber: '',
    jobTitle: '',
    department: '',
    password: '',
    confirmPassword: ''
  })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' })
  const [currentUser, setCurrentUser] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current user and profile data on component mount
  useEffect(() => {
    const getCurrentUserAndProfile = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Error getting user:', error)
          setError('Authentication error. Please sign in again.')
        } else if (user) {
          setCurrentUser(user)
          console.log('Current user loaded:', user.id)
          
          // Load existing profile data from profiles table
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()
              
            if (profileError) {
              console.error('Error loading profile:', profileError)
              // Don't fail - user might not have profile yet
            } else if (profileData) {
              console.log('Profile data loaded:', profileData)
              
              // Pre-populate form with existing profile data
              setFormData(prev => ({
                ...prev,
                preferredName: profileData.preferred_name || profileData.full_name || '',
                mobileNumber: profileData.phone || '',
                jobTitle: profileData.job_title || '',
                department: ''  // No department field in profiles table yet
              }))
              
              if (profileData.avatar_url) {
                setProfileImage(profileData.avatar_url)
              }
            }
          } catch (profileError) {
            console.error('Error in profile loading:', profileError)
            // Don't fail - just log the error
          }
        } else {
          console.warn('No authenticated user found')
          setError('Please sign in to continue.')
        }
      } catch (error) {
        console.error('Error in getCurrentUserAndProfile:', error)
        setError('Authentication error. Please try again.')
      }
    }

    getCurrentUserAndProfile()
  }, [])

  // Password validation function
  const validatePassword = (password: string) => {
    let score = 0
    let feedback = ''

    if (password.length === 0) {
      return { score: 0, feedback: '' }
    }

    if (password.length < 8) {
      feedback = 'Password must be at least 8 characters'
      return { score: 1, feedback }
    }

    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score < 3) {
      feedback = 'Include uppercase, lowercase, and numbers'
    } else if (score < 4) {
      feedback = 'Strong password!'
    } else {
      feedback = 'Very strong password!'
    }

    return { score, feedback }
  }

  // Handle email verification if verify token is present
  useEffect(() => {
    const verifyToken = searchParams.get('verify')
    const isOnboarding = searchParams.get('onboarding')
    
    if (verifyToken && isOnboarding) {
      handleEmailVerification(verifyToken)
    }
  }, [searchParams])

  const handleEmailVerification = async (token: string) => {
    setIsVerifying(true)
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      if (response.ok) {
        setVerificationStatus('success')
        // Remove verify params from URL
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('verify')
        newUrl.searchParams.delete('onboarding')
        window.history.replaceState({}, '', newUrl.pathname)
      } else {
        // Check if user is already verified by checking if we have profile data loaded
        if (currentUser && formData.preferredName) {
          console.log('🎯 User appears to be already verified, skipping verification error')
          setVerificationStatus('success')
          // Remove verify params from URL since user is already verified
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete('verify')
          newUrl.searchParams.delete('onboarding')
          window.history.replaceState({}, '', newUrl.pathname)
        } else {
          setVerificationStatus('error')
          setError('Email verification failed. Please try again.')
        }
      }
    } catch (error) {
      // Check if user is already verified by checking if we have profile data loaded
      if (currentUser && formData.preferredName) {
        console.log('🎯 User appears to be already verified, skipping verification error')
        setVerificationStatus('success')
        // Remove verify params from URL since user is already verified
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('verify')
        newUrl.searchParams.delete('onboarding')
        window.history.replaceState({}, '', newUrl.pathname)
      } else {
        setVerificationStatus('error')
        setError('Verification failed. Please check your connection.')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Update password strength when password changes
    if (name === 'password') {
      const strength = validatePassword(value)
      setPasswordStrength(strength)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file)
      setProfileImage(previewUrl)
      
      // Here you would typically upload to your storage service
      // For now, we'll just use the preview URL
    } catch (error) {
      console.error('Error uploading image:', error)
      setError('Failed to upload image. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // Validate passwords
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        setIsSubmitting(false)
        return
      }

      if (passwordStrength.score < 3) {
        setError('Password is too weak. Please include uppercase, lowercase, and numbers.')
        setIsSubmitting(false)
        return
      }

      // Check if user is authenticated
      if (!currentUser) {
        setError('Authentication required. Please sign in again.')
        setIsSubmitting(false)
        return
      }

      // Set password first
      const passwordResponse = await fetch('/api/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          password: formData.password,
          profileData: {
            preferredName: formData.preferredName,
            mobileNumber: formData.mobileNumber,
            jobTitle: formData.jobTitle,
            department: formData.department
          },
          profileImage
        })
      })

      if (!passwordResponse.ok) {
        const errorData = await passwordResponse.json()
        throw new Error(errorData.error || 'Failed to set password')
      }

      // Navigate to company setup page
      router.push('/company-setup')
    } catch (error) {
      console.error('Profile update error:', error)
      setError(error instanceof Error ? error.message : 'Failed to save profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auth module form field styling (exact same as create-account and company-setup)
  const fieldStyle = "w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-4 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-normal"

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* CafeWindow Background - EXACT SAME as auth module */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg')`,
          filter: 'brightness(0.4)'
        }}
      />
      
      {/* Overlay - EXACT SAME as auth module */}
      <div className="absolute inset-0 bg-black/15" />

      {/* Main Content - EXACT SAME structure as auth module */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        
        {/* JiGR Logo - EXACT SAME as auth module */}
        <div className="mb-8">
          <div className="w-144 h-36">
            <img 
              src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_full.png" 
              alt="JiGR Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Profile Card - EXACT SAME styling as auth module */}
        <div className="w-full max-w-lg">
          <div className={`${getCardStyle('primary')} p-8`}>
            
            {/* Progress Indicator at top of card */}
            <ProgressIndicator />
            
            {/* Email Verification Status */}
            {isVerifying && (
              <div className="text-center mb-6">
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
                  <p className="text-blue-200 text-sm">Verifying your email...</p>
                </div>
              </div>
            )}
            
            {verificationStatus === 'success' && !isVerifying && (
              <div className="text-center mb-6">
                <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4">
                  <p className="text-green-200 text-sm">✅ Email verified successfully!</p>
                </div>
              </div>
            )}
            
            {/* Profile Image Upload - replaces success icon */}
            <div className="text-center mb-6">
              <div className="relative w-20 h-20 mx-auto mb-4">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover border-4 border-blue-300"
                  />
                ) : (
                  <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center border-2 border-dashed border-blue-300 hover:border-blue-200 transition-colors cursor-pointer">
                    <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-white/50 text-xs mb-4">
                Click to upload your profile photo (optional)
              </p>
              <h1 className={`${getTextStyle('pageTitle')} mb-2 text-white`}>
                Complete Your Profile
              </h1>
              <p className="text-white/70 text-sm">
                Tell us a bit about yourself
              </p>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Preferred Name */}
              <div>
                <input
                  type="text"
                  name="preferredName"
                  placeholder="Preferred Name"
                  value={formData.preferredName}
                  onChange={handleInputChange}
                  required
                  className={fieldStyle}
                />
              </div>

              {/* Mobile Number */}
              <div>
                <input
                  type="tel"
                  name="mobileNumber"
                  placeholder="Mobile Number"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className={fieldStyle}
                />
              </div>

              {/* Job Title */}
              <div>
                <input
                  type="text"
                  name="jobTitle"
                  placeholder="Job Title"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className={fieldStyle}
                />
              </div>

              {/* Department */}
              <div>
                <input
                  type="text"
                  name="department"
                  placeholder="Department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={fieldStyle}
                />
              </div>

              {/* Password Creation Section */}
              <div className="space-y-4 mt-6 pt-6 border-t border-white/20">
                <h3 className="text-white font-medium text-lg mb-4">Create Your Password</h3>
                
                {/* Password */}
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Create Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={fieldStyle}
                  />
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex space-x-1 mb-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded ${
                              level <= passwordStrength.score
                                ? passwordStrength.score <= 2
                                  ? 'bg-red-400'
                                  : passwordStrength.score <= 3
                                  ? 'bg-yellow-400'
                                  : 'bg-green-400'
                                : 'bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-white/70">{passwordStrength.feedback}</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className={fieldStyle}
                  />
                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="mt-1">
                      {formData.password === formData.confirmPassword ? (
                        <p className="text-xs text-green-400">✓ Passwords match</p>
                      ) : (
                        <p className="text-xs text-red-400">✗ Passwords do not match</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3">
                  <p className="text-red-200 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-white/20"
                >
                  Back
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  {isSubmitting ? 'Saving...' : 'Continue'}
                </button>
              </div>
            </form>
            
            {/* Assistance Message - EXACT SAME as auth module */}
            <div className="text-center mt-6 pt-4 border-t border-white/10">
              <p className="text-white/40 text-xs mb-2">
                Need help? Contact our support team
              </p>
            </div>
            
            {/* Version - EXACT SAME as auth module */}
            <div className="text-center">
              <p className="text-xs font-medium text-white/90">
                {getVersionDisplay()}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default function UpdateProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg')`,
            filter: 'brightness(0.4)'
          }}
        />
        <div className="absolute inset-0 bg-black/15" />
        <div className={`${getCardStyle('primary')} p-8 relative z-10`}>
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-white/20 rounded mb-4"></div>
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <UpdateProfileContent />
    </Suspense>
  )
}