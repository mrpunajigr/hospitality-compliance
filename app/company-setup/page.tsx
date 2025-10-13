'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, setIntentionalSignOut } from '@/lib/supabase'
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
      <div className="flex-1 h-1 bg-blue-500 mx-3 rounded"></div>
      
      {/* Step 2: Your Profile (Completed) */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-xs font-medium text-green-200">Profile</span>
      </div>
      
      {/* Progress Line */}
      <div className="flex-1 h-1 bg-white/20 mx-3 rounded">
        <div className="h-full bg-blue-500 rounded" style={{width: '50%'}}></div>
      </div>
      
      {/* Step 3: Company Setup (Current) */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-1">
          <span className="text-white font-bold text-sm">3</span>
        </div>
        <span className="text-xs font-medium text-blue-200">Company</span>
      </div>
    </div>
  </div>
)

export default function CompanySetupPage() {
  const [formData, setFormData] = useState({
    ownersName: '',
    businessType: '',
    address: '',
    phoneNumber: ''
  })
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [companyLogoBase64, setCompanyLogoBase64] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [companyName, setCompanyName] = useState('Business Information')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Fetch company name from database
  useEffect(() => {
    const fetchCompanyName = async () => {
      try {
        // Check if Supabase client is available
        if (!supabase) {
          console.error('❌ Supabase client not initialized')
          console.log('Environment check:', {
            supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          })
          return
        }

        console.log('🏢 COMPANY-SETUP: Attempting graceful business name lookup...')
        
        // Use getSession() instead of getUser() to avoid 403 errors
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.log('⚠️ COMPANY-SETUP: Session error during company name lookup:', sessionError.message)
          console.log('⚠️ COMPANY-SETUP: Will use default business name')
          return
        }
        
        const user = session?.user
        console.log('🔍 COMPANY-SETUP: User from session:', user ? { id: user.id, email: user.email } : 'No user found')
        
        if (user?.id) {
          try {
            // Look up company through client_users table (proper relationship)
            const { data: clientData, error } = await supabase
              .from('client_users')
              .select(`
                clients (
                  name
                )
              `)
              .eq('user_id', user.id)
              .single()
            
            console.log('🔍 COMPANY-SETUP: Database query result:', { clientData, error })
            
            if (error) {
              console.log('⚠️ COMPANY-SETUP: Company lookup error (using default):', error.message)
            } else if (clientData?.clients) {
              const companyName = Array.isArray(clientData.clients) ? clientData.clients[0]?.name : (clientData.clients as any)?.name
              if (companyName) {
                console.log('✅ COMPANY-SETUP: Company name found:', companyName)
                setCompanyName(companyName)
              } else {
                console.log('⚠️ COMPANY-SETUP: Company name is empty, using default')
              }
            } else {
              console.log('⚠️ COMPANY-SETUP: No company data found, using default')
            }
          } catch (dbError) {
            console.log('⚠️ COMPANY-SETUP: Database query failed (using default):', dbError)
          }
        } else {
          console.log('⚠️ COMPANY-SETUP: No user in session, using default business name')
        }
      } catch (error) {
        console.log('Could not fetch company name:', error)
        // Keep default title
      }
    }
    
    fetchCompanyName()
  }, [])

  // GRACEFUL: Session monitoring - non-intrusive checking to avoid 403 errors
  useEffect(() => {
    const checkSession = async () => {
      if (typeof window === 'undefined') return
      
      console.log('🔍 COMPANY-SETUP: Performing non-intrusive session check...')
      
      try {
        // Use getSession() instead of getUser() to avoid triggering 403 errors
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('⚠️ COMPANY-SETUP: Session check error (non-critical):', error.message)
          console.warn('⚠️ COMPANY-SETUP: Will validate authentication during form submission')
        } else if (!session) {
          console.warn('⚠️ COMPANY-SETUP: No session found - user may need to authenticate during form submission')
          console.warn('⚠️ COMPANY-SETUP: Page remains accessible, authentication checked on form submission')
        } else {
          console.log('✅ COMPANY-SETUP: Session found for user:', session.user?.email)
          console.log('✅ COMPANY-SETUP: Session appears valid, form submission should work')
        }
      } catch (error) {
        console.warn('⚠️ COMPANY-SETUP: Session check failed (non-critical):', error)
        console.warn('⚠️ COMPANY-SETUP: Authentication will be validated during form submission')
      }
    }
    
    // Small delay to avoid interfering with page mounting
    const timeoutId = setTimeout(checkSession, 1000)
    return () => clearTimeout(timeoutId)
  }, [])

  // MINIMAL monitoring - track page stability without triggering auth events
  useEffect(() => {
    console.log('🔍 COMPANY-SETUP: Page mounted successfully - minimal monitoring mode')
    console.log('🔍 COMPANY-SETUP: No auth state listeners to prevent SIGNED_OUT events')
    
    // Minimal monitoring - just track if page stays mounted
    const mountTime = Date.now()
    const checkStillMounted = setInterval(() => {
      const timeElapsed = Date.now() - mountTime
      console.log(`✅ COMPANY-SETUP: Still mounted after ${Math.round(timeElapsed/1000)} seconds`)
    }, 2000) // Reduced frequency to minimize interference
    
    return () => {
      clearInterval(checkStillMounted)
      const totalTime = Date.now() - mountTime
      console.log(`🔍 COMPANY-SETUP: Page unmounted after ${Math.round(totalTime/1000)} seconds`)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }


  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be less than 5MB.')
        return
      }

      // Create a preview URL for display
      const previewUrl = URL.createObjectURL(file)
      
      // Set preview URL for immediate display
      setCompanyLogo(previewUrl)
      
      // Convert to base64 for storage
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setCompanyLogoBase64(base64String) // Store base64 for API submission
      }
      reader.readAsDataURL(file)
      
    } catch (error) {
      console.error('Error processing logo:', error)
      setError('Failed to process logo. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      console.log('🚀 FORM SUBMISSION: Starting company setup...')
      console.log('🔍 FORM SUBMISSION: Session state debugging begins')
      
      // STEP 1: Validate session before API call
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('🔍 FORM SUBMISSION: Pre-API session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        sessionError: sessionError?.message,
        accessToken: session?.access_token ? 'present' : 'missing',
        refreshToken: session?.refresh_token ? 'present' : 'missing'
      })
      
      if (!session?.user || sessionError) {
        console.error('❌ FORM SUBMISSION: No valid session found:', sessionError?.message)
        console.error('❌ FORM SUBMISSION: This is the root cause of the authorization failure')
        setError('Your session has expired. Please refresh the page and sign in again.')
        setIsSubmitting(false)
        return
      }
      
      const currentUser = session.user
      console.log('✅ FORM SUBMISSION: Session validation passed for user:', currentUser.id, currentUser.email)

      // Prepare company data - FIXED: Include ownersName
      const companyData = {
        userId: currentUser.id,
        ownersName: formData.ownersName,  // ← THIS WAS MISSING!
        businessType: formData.businessType,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        companyLogo: companyLogoBase64
      }

      console.log('📤 Submitting company data...')
      
      // CRITICAL: Temporarily mark any sign-out events as intentional to prevent redirects during form submission
      console.log('🛡️ FORM SUBMISSION: Enabling redirect protection during API call...')
      setIntentionalSignOut(true)
      
      const response = await fetch('/api/update-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData)
      })

      // Disable redirect protection immediately after API call
      setIntentionalSignOut(false)
      console.log('🛡️ FORM SUBMISSION: Redirect protection disabled after API call')

      console.log('📥 API response status:', response.status, response.ok)
      
      if (!response.ok) {
        setIntentionalSignOut(false) // Ensure protection is disabled on error
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ API error:', errorData)
        setError(errorData?.error || 'Failed to save company settings.')
        setIsSubmitting(false)
        return
      }

      const result = await response.json()
      console.log('✅ Company setup successful:', result)
      
      // STEP 2: Validate session immediately after successful API call
      console.log('🔍 FORM SUBMISSION: Post-API session validation...')
      const { data: { session: postApiSession }, error: postApiError } = await supabase.auth.getSession()
      console.log('🔍 FORM SUBMISSION: Post-API session check:', {
        hasSession: !!postApiSession,
        hasUser: !!postApiSession?.user,
        userId: postApiSession?.user?.id,
        userEmail: postApiSession?.user?.email,
        sessionError: postApiError?.message,
        accessToken: postApiSession?.access_token ? 'present' : 'missing',
        sessionChanged: session?.access_token !== postApiSession?.access_token
      })
      
      if (!postApiSession?.user || postApiError) {
        console.error('❌ FORM SUBMISSION: Session lost after API call!', postApiError?.message)
        setError('Session was lost during company setup. Please try again.')
        setIsSubmitting(false)
        return
      }
      
      // STEP 3: Refresh session before redirect to ensure it's stable
      console.log('🔄 FORM SUBMISSION: Refreshing session before redirect...')
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
      console.log('🔍 FORM SUBMISSION: Session refresh result:', {
        success: !refreshError,
        hasSession: !!refreshedSession,
        error: refreshError?.message
      })
      
      // Small delay to ensure session stabilizes
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('🎯 Redirecting to admin console with validated session...')
      router.push('/admin/console')
      
    } catch (error) {
      setIntentionalSignOut(false) // Ensure protection is disabled on exception
      console.error('❌ Exception during company setup:', error)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  // Auth module form field styling (exact same as create-account and update-profile)
  const fieldStyle = "w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-4 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm font-normal"
  const selectStyle = "w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-4 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm font-normal appearance-none"

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

        {/* Company Setup Card - EXACT SAME styling as auth module */}
        <div className="w-full max-w-lg">
          <div className={`${getCardStyle('primary')} p-8`}>
            
            {/* Progress Indicator at top of card */}
            <ProgressIndicator />
            
            {/* Company Logo Upload - same component as update-profile */}
            <div className="text-center mb-6">
              <div className="relative w-20 h-20 mx-auto mb-4">
                {companyLogo ? (
                  <img 
                    src={companyLogo} 
                    alt="Company Logo" 
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
                  onChange={handleLogoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-white/50 text-xs mb-4">
                Click to upload your company logo (optional)
              </p>
              <h1 className={`${getTextStyle('pageTitle')} mb-2 text-white`}>
                {companyName}
              </h1>
              <p className="text-white/70 text-sm">
                Customize your compliance experience
              </p>
            </div>

            {/* Company Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Owners Name */}
              <div>
                <input
                  type="text"
                  name="ownersName"
                  placeholder="Owner's Name"
                  value={formData.ownersName}
                  onChange={handleInputChange}
                  required
                  className={fieldStyle}
                />
              </div>

              {/* Business Type */}
              <div>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  required
                  className={selectStyle}
                >
                  <option value="">Select Business Type</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="bar">Bar/Pub</option>
                  <option value="hotel">Hotel</option>
                  <option value="catering">Catering</option>
                  <option value="food-truck">Food Truck</option>
                  <option value="takeaway">Takeaway</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Address */}
              <div>
                <input
                  type="text"
                  name="address"
                  placeholder="Business Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className={fieldStyle}
                />
              </div>

              {/* Phone Number */}
              <div>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Business Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className={fieldStyle}
                />
              </div>


              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3">
                  <p className="text-red-200 text-sm text-center">{error}</p>
                  {error.includes('sign in') && (
                    <div className="mt-3 text-center">
                      <button
                        onClick={() => router.push('/create-account')}
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                      >
                        Create Account
                      </button>
                    </div>
                  )}
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
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  {isSubmitting ? 'Completing...' : 'Complete Setup'}
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