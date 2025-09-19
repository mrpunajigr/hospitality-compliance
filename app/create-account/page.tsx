'use client'

import { getVersionDisplay } from '@/lib/version'
import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'

// Hospitality Compliance SaaS - Create Account Page
// Matching the clean styling of the Sign In page

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
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
    businessName: '',
    email: '',
    fullName: '',
    phone: '',
    businessType: 'restaurant',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState<string | null>(null)
  const [platformMode, setPlatformMode] = useState<'web' | 'ios'>('web')
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    try {
      // Create user with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            business_name: formData.businessName,
            phone: formData.phone,
            business_type: formData.businessType
          }
        }
      })

      if (authError) {
        setError(authError.message)
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Create company for the new user using API route
        console.log('🚀 User created, now creating company via API route')
        try {
          const companyData = {
            businessName: formData.businessName,
            businessType: formData.businessType,
            phone: formData.phone,
            userId: data.user.id,
            email: formData.email,
            fullName: formData.fullName
          }

          console.log('🚀 About to call API with data:', companyData)
          
          const response = await fetch('/api/create-company', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(companyData)
          })

          console.log('📋 API Response status:', response.status)
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => null)
            console.error('❌ API Error response:', errorData)
            
            if (errorData) {
              // Handle structured error responses from duplicate prevention
              if (errorData.errorCode === 'DUPLICATE_BUSINESS_NAME') {
                const suggestions = errorData.suggestions ? 
                  `\n\nSuggestions:\n• ${errorData.suggestions.join('\n• ')}` : ''
                setError(`${errorData.message}${suggestions}`)
                setErrorType('DUPLICATE_BUSINESS_NAME')
                setIsLoading(false)
                return
              } else if (errorData.errorCode === 'ACCOUNT_EXISTS') {
                setError(errorData.message)
                setErrorType('ACCOUNT_EXISTS')
                setIsLoading(false)
                return
              } else {
                // Extract just the user-friendly message, not technical details
                const cleanMessage = errorData.message || errorData.error || 'Account creation failed. Please try again.'
                setError(cleanMessage)
                setErrorType('GENERAL_ERROR')
                setIsLoading(false)
                return
              }
            } else {
              throw new Error(`Company creation failed: ${response.status}`)
            }
          }

          const result = await response.json()
          console.log('✅ API Success result:', result)

          console.log('✅ Account and company created successfully via API')
          // Success - redirect to admin console (main company dashboard)
          router.push('/admin/console')
        } catch (companyError) {
          console.error('🚨 Company creation error:', companyError)
          
          // Extract user-friendly error message
          const errorMessage = companyError instanceof Error ? companyError.message : String(companyError)
          
          // Check if it's a duplicate business name error (common case)
          if (errorMessage.includes('Business name already registered') || errorMessage.includes('DUPLICATE_BUSINESS_NAME')) {
            // Extract contact email if present in the error message
            const contactEmailMatch = errorMessage.match(/contact ([^\s]+@[^\s]+)/);
            const contactEmail = contactEmailMatch ? contactEmailMatch[1] : null;
            
            if (contactEmail) {
              setError(`This business name is already taken. Please choose a different name, or contact ${contactEmail} for access to the existing account.`)
            } else {
              setError('This business name is already taken. Please choose a different name.')
            }
            setErrorType('DUPLICATE_BUSINESS_NAME')
          } else if (errorMessage.includes('Account already exists') || errorMessage.includes('ACCOUNT_EXISTS')) {
            setError('An account with this business name already exists. Please sign in instead.')
            setErrorType('ACCOUNT_EXISTS')
          } else {
            // Generic user-friendly message for other errors
            setError('Unable to complete account setup. Please try again or contact support.')
            setErrorType('GENERAL_ERROR')
          }
          
          setIsLoading(false)
        }
      }
    } catch (err) {
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

      {/* Main Content - Matching Landing Page layout */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        
        {/* JiGR Logo above form container - Matching Landing Page */}
        <div className="mb-8">
          <div className="w-144 h-36">
            <img 
              src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_full.png" 
              alt="JGR Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        {/* Glass Morphism Card - Matching Sign In styling */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Create Account
            </h1>
            <p className="text-white/70 text-sm font-light">
              Start your compliance journey today
            </p>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Business Name */}
            <div>
              <input
                type="text"
                name="businessName"
                placeholder="Business Name"
                value={formData.businessName}
                onChange={handleInputChange}
                required
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Business Type */}
            <div>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                required
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="restaurant" className="text-gray-800">Restaurant</option>
                <option value="cafe" className="text-gray-800">Café</option>
                <option value="hotel" className="text-gray-800">Hotel</option>
                <option value="catering" className="text-gray-800">Catering</option>
                <option value="other" className="text-gray-800">Other</option>
              </select>
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
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Business Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Phone */}
            <div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password (8+ characters)"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
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
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3">
                <p className="text-red-200 text-sm text-center whitespace-pre-line">{error}</p>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none mt-6"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
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
    </div>
  )
}