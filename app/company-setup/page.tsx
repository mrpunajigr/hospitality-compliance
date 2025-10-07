'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          // Look up company by user's email in clients table
          const { data: client } = await supabase
            .from('clients')
            .select('name')
            .eq('business_email', user.email)
            .single()
          
          if (client?.name) {
            setCompanyName(client.name)
          }
        }
      } catch (error) {
        console.log('Could not fetch company name:', error)
        // Keep default title
      }
    }
    
    fetchCompanyName()
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('User not authenticated. Please sign in again.')
        setIsSubmitting(false)
        return
      }

      // Prepare the company data
      const companyData = {
        userId: user.id,
        ownersName: formData.ownersName,
        businessType: formData.businessType,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        companyLogo: companyLogoBase64 // This will be the base64 data URL if uploaded
      }

      console.log('🏢 Submitting company setup data...')
      
      // Call the API to complete company setup
      const response = await fetch('/api/update-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('❌ Company setup failed:', errorData)
        setError(errorData?.error || 'Failed to save company settings. Please try again.')
        setIsSubmitting(false)
        return
      }

      const result = await response.json()
      console.log('✅ Company setup completed successfully:', result)
      
      // Navigate to admin console (complete onboarding)
      router.push('/admin/console')
    } catch (error) {
      console.error('❌ Company setup error:', error)
      setError('Failed to save company settings. Please try again.')
    } finally {
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