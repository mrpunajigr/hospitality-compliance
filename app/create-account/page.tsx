'use client'

import { getVersionDisplay } from '@/lib/version'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { generateSecurePassword } from '@/lib/password-utils'
import { sendWelcomeEmail } from '@/lib/email/welcome-email'
import { updateOnboardingProgress } from '@/lib/onboarding-progress'
import EmailDebugDashboard from '@/app/components/EmailDebugDashboard'
import Link from 'next/link'

// Development-only Platform Selector Component
interface PlatformSelectorProps {
  onPlatformChange: (platform: 'web' | 'ios') => void
  currentPlatform: 'web' | 'ios'
}

const PlatformSelector = ({ onPlatformChange, currentPlatform }: PlatformSelectorProps) => {
  // Only show in development environment
  if (process.env.NODE_ENV === 'production') return null
  
  return (
    <details className="text-center mt-4 pt-4 border-t border-white/10">
      <summary className="text-xs text-white/50 cursor-pointer hover:text-white/70 transition-colors">
        🧪 Development Tools
      </summary>
      <div className="mt-2">
        <select 
          value={currentPlatform} 
          onChange={(e) => onPlatformChange(e.target.value as 'web' | 'ios')}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="web">🌐 Web App Version</option>
          <option value="ios">📱 iPad Optimized Version</option>
        </select>
      </div>
    </details>
  )
}

export default function CreateAccountPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    fullName: '',
    email: ''
  })
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState<string | null>(null)
  const [platformMode, setPlatformMode] = useState<'web' | 'ios'>('web')
  const [emailStatus, setEmailStatus] = useState<'pending' | 'sent' | 'failed' | 'skipped'>('pending')
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setErrorType(null)
    setIsLoading(true)

    // Validate required fields
    if (!formData.companyName || !formData.fullName || !formData.email) {
      setError('All fields are required')
      setIsLoading(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      console.log('🚀 Starting optimized signup flow...')
      
      // Generate secure password
      const tempPassword = generateSecurePassword(12)
      console.log('🔑 Generated secure password')

      // Create user with Supabase Auth (skip email confirmation)
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName
          }
        }
      })

      if (authError) {
        console.error('❌ Supabase auth error:', authError)
        setError(authError.message)
        setIsLoading(false)
        return
      }

      if (data.user) {
        console.log('✅ User created successfully')
        
        // Create company via enhanced API
        try {
          const companyData = {
            businessName: formData.companyName,
            businessType: 'restaurant', // Default, will be set in profile completion
            phone: '', // Will be collected in profile completion
            userId: data.user.id,
            email: formData.email,
            fullName: formData.fullName,
            position: 'Owner', // Default for first user
            ownerName: formData.fullName
          }

          console.log('🏢 Creating company via API...')
          const response = await fetch('/api/create-company', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(companyData)
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => null)
            console.error('❌ Company creation failed:', errorData)
            
            if (errorData?.errorCode === 'DUPLICATE_BUSINESS_NAME') {
              setError(`This business name is already registered. Please choose a different name.`)
              setErrorType('DUPLICATE_BUSINESS_NAME')
              setIsLoading(false)
              return
            } else if (errorData?.errorCode === 'ACCOUNT_EXISTS') {
              setError('An account with this business name already exists. Please sign in instead.')
              setErrorType('ACCOUNT_EXISTS')
              setIsLoading(false)
              return
            } else {
              throw new Error(`Company creation failed: ${response.status}`)
            }
          }

          const result = await response.json()
          console.log('✅ Company created successfully')

          // Send welcome email (non-blocking)
          try {
            console.log('🔧 Starting welcome email process...')
            setEmailStatus('pending')
            
            const emailResult = await sendWelcomeEmail({
              email: formData.email,
              companyName: formData.companyName,
              userFullName: formData.fullName,
              tempCode: tempPassword
            })
            
            if (emailResult?.success !== false) {
              setEmailStatus('sent')
              console.log('✅ Email sending completed')
            } else {
              setEmailStatus('failed')
              console.log('⚠️ Email sending failed but continuing signup')
            }
          } catch (emailError) {
            console.error('❌ Email error caught:', emailError)
            setEmailStatus('failed')
            // Don't fail signup if email fails
          }

          // Track onboarding progress
          await updateOnboardingProgress(data.user.id, 'signup', {
            companyName: formData.companyName,
            fullName: formData.fullName,
            email: formData.email
          })

          // Auto-login the user (they're already logged in from signUp)
          console.log('✅ User auto-logged in, redirecting to profile completion...')
          router.push('/admin/profile?onboarding=true')
          
        } catch (companyError) {
          console.error('❌ Company creation error:', companyError)
          const errorMessage = companyError instanceof Error ? companyError.message : 'Unknown error'
          setError(`Unable to complete account setup: ${errorMessage}. Please try again.`)
          setIsLoading(false)
        }
      }
    } catch (err) {
      console.error('❌ Signup error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen relative overflow-hidden Platform${platformMode.charAt(0).toUpperCase()}${platformMode.slice(1)}`}>
      {/* Cafe Window Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg')`,
          filter: 'brightness(0.4)'
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        
        {/* JiGR Logo */}
        <div className="mb-8">
          <div className="w-144 h-36">
            <img 
              src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_full.png" 
              alt="JiGR Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Glass Morphism Card */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Start Your Free Compliance Trial
            </h1>
            <p className="text-white/70 text-sm font-light">
              No credit card required • Ready in 60 seconds
            </p>
          </div>

          {/* Simplified Sign Up Form */}
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Company Name */}
            <div>
              <input
                type="text"
                name="companyName"
                placeholder="Your Business Name"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                autoComplete="organization"
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-4 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
              />
            </div>

            {/* Full Name */}
            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Your Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                autoComplete="name"
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-4 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
              />
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Your Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-4 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3">
                <p className="text-red-200 text-sm text-center">{error}</p>
                {errorType === 'ACCOUNT_EXISTS' && (
                  <div className="mt-3 text-center">
                    <Link 
                      href="/signin"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                    >
                      Sign In Instead
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* What You Get */}
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-blue-200 font-medium text-sm mb-1">What you get:</h4>
                  <ul className="text-blue-100 text-xs space-y-1">
                    <li>• Instant access to your dashboard</li>
                    <li>• 30-day free trial with full features</li>
                    <li>• Compliance tracking & alerts</li>
                    <li>• Email confirmation & login details</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Creating Your Account...
                </div>
              ) : (
                '🚀 Create Free Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-white/70 text-sm">
              Already have an account?{' '}
              <Link 
                href="/signin" 
                className="text-blue-300 hover:text-blue-200 font-semibold transition-colors duration-200"
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Development Platform Selector */}
          <PlatformSelector 
            currentPlatform={platformMode}
            onPlatformChange={setPlatformMode}
          />
          
          {/* Version */}
          <div className="text-center mt-4 pt-4 border-t border-white/10">
            <p className="text-white/50 text-xs">
              {getVersionDisplay('prod')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Email Debug Dashboard (Development Only) */}
      <EmailDebugDashboard />
    </div>
  )
}