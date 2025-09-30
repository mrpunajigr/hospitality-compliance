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
    department: ''
  })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

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
        setVerificationStatus('error')
        setError('Email verification failed. Please try again.')
      }
    } catch (error) {
      setVerificationStatus('error')
      setError('Verification failed. Please check your connection.')
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
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Navigate to company setup page
      router.push('/company-setup')
    } catch (error) {
      setError('Failed to save profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auth module form field styling (exact same as create-account)
  const fieldStyle = "w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-4 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"

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