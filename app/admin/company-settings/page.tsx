'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { getVersionDisplay } from '@/lib/version'
import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'
import BackgroundSelector from '@/app/components/BackgroundSelector'
import AssetUploadModal from '@/app/components/AssetUploadModal'
import ResultsCardConfig, { ResultsCardConfig as ResultsCardConfigType, DEFAULT_CONFIG } from '@/app/components/upload/ResultsCardConfig'

interface BackgroundAsset {
  id: string
  name: string
  file_url: string
  category: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  alt_text: string | null
}

export default function CompanySettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)
  const [showAssetUpload, setShowAssetUpload] = useState(false)
  const [uploadType, setUploadType] = useState<'background' | 'logo'>('background')
  const [currentBackground, setCurrentBackground] = useState<string>('')
  const [assets, setAssets] = useState<BackgroundAsset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    business_type: '',
    business_email: '',
    phone: '',
    license_number: '',
    address: {
      street: '',
      city: '',
      region: '',
      postalCode: '',
      country: ''
    },
    estimated_monthly_deliveries: 50,
    results_card_config: DEFAULT_CONFIG
  })
  const router = useRouter()

  // Check authentication and load company data
  useEffect(() => {
    // Check for onboarding parameters
    const urlParams = new URLSearchParams(window.location.search)
    const onboarding = urlParams.get('onboarding') === 'true'
    const companyCreated = urlParams.get('company') === 'created'
    
    if (onboarding) {
      setIsOnboarding(true)
      setShowWelcome(true)
    }
    
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/')
        return
      }

      setUser(user)
      
      // Get user's company information
      try {
        const clientInfo = await getUserClient(user.id)
        if (clientInfo) {
          setUserClient(clientInfo)
          // Populate form with existing data
          setFormData({
            name: clientInfo.name || '',
            business_type: clientInfo.business_type || '',
            business_email: clientInfo.business_email || '',
            phone: clientInfo.phone || '',
            license_number: clientInfo.license_number || '',
            address: clientInfo.address || {
              street: '',
              city: '',
              region: '',
              postalCode: '',
              country: 'NZ'
            },
            estimated_monthly_deliveries: clientInfo.estimated_monthly_deliveries || 50,
            results_card_config: clientInfo.results_card_config || {
              show_supplier_name: true,
              show_delivery_date: true,
              show_confidence_score: true,
              show_upload_info: true,
              card_style: 'modern'
            }
          })
        } else {
          setMessage(`No company found. User ID: ${user.id}. Please check debug endpoint: /api/debug-user?userId=${user.id}`)
        }
      } catch (error) {
        console.error('Error loading company data:', error)
        setMessage('Error loading company information.')
      }
      
      setLoading(false)
    }
    
    checkAuth()
    loadAssets()
  }, [router])

  const loadAssets = async () => {
    setLoadingAssets(true)
    try {
      const clientId = userClient?.id || ''
      const response = await fetch(`/api/assets/upload?type=background&clientId=${clientId}`)
      const data = await response.json()
      
      if (data.success) {
        setAssets(data.assets)
        // Set current background to first asset or default
        if (data.assets.length > 0 && !currentBackground) {
          setCurrentBackground(data.assets[0].file_url)
        }
      }
    } catch (error) {
      console.error('Error loading assets:', error)
    }
    setLoadingAssets(false)
  }

  const handleBackgroundChange = (asset: BackgroundAsset) => {
    setCurrentBackground(asset.file_url)
    setShowBackgroundSelector(false)
  }

  const handleAssetUploaded = () => {
    setShowAssetUpload(false)
    loadAssets() // Refresh assets list
  }

  const handleResultsConfigChange = (config: ResultsCardConfigType) => {
    setFormData(prev => ({
      ...prev,
      results_card_config: config
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'estimated_monthly_deliveries' ? parseInt(value) || 0 : value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userClient) return
    
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/update-company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: userClient.id,
          userId: user.id,
          name: formData.name,
          business_type: formData.business_type,
          business_email: formData.business_email,
          phone: formData.phone,
          license_number: formData.license_number,
          address: formData.address,
          estimated_monthly_deliveries: formData.estimated_monthly_deliveries
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error updating company:', result)
        setMessage(`Error saving changes: ${result.error}`)
      } else {
        setMessage('Company profile updated successfully!')
        // Refresh the user client data
        const updatedClientInfo = await getUserClient(user.id)
        if (updatedClientInfo) {
          setUserClient(updatedClientInfo)
        }
      }
    } catch (error) {
      console.error('Error saving company settings:', error)
      setMessage('Error saving changes. Please try again.')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Upload Module Background Style */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 25%, #3730a3 50%, #2563eb 75%, #1e293b 100%)',
            backgroundAttachment: 'fixed'
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
            opacity: 0.3
          }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
            <p className="text-white/70 text-sm mt-4">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Upload Module Background Style */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 25%, #3730a3 50%, #2563eb 75%, #1e293b 100%)',
          backgroundAttachment: 'fixed'
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
          opacity: 0.3
        }}
      />
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} />

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              Settings
            </h1>
            <p className="text-white/70 text-lg drop-shadow-md">
              Manage your business information and preferences
            </p>
            {userClient && (
              <div className="text-white/80 text-sm drop-shadow-md mt-1">
                {userClient.name} • {userClient.role}
              </div>
            )}
          </div>
          
          {/* Onboarding Welcome Message */}
          {isOnboarding && showWelcome && (
            <div className="bg-green-500/20 backdrop-blur-lg border border-green-400/30 rounded-3xl p-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-2">
                    🎉 Welcome! Your account has been created successfully!
                  </h3>
                  <p className="text-white/90 mb-4">
                    Let&apos;s complete your company setup to get the most out of your hospitality compliance platform.
                  </p>
                  <div className="text-white/70 text-sm">
                    ✅ Account Created • 📝 Complete Company Setup • 🚀 Ready to Use
                  </div>
                </div>
                <button 
                  onClick={() => setShowWelcome(false)}
                  className="text-white/60 hover:text-white/90 transition-colors p-2 hover:bg-white/10 rounded-xl"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-2xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Company Profile
            </h2>
            <p className="text-white/70">
              Manage your company information and business details.
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-xl backdrop-blur-lg border ${
              message.includes('Error') 
                ? 'bg-red-500/20 border-red-400/30 text-red-200'
                : 'bg-green-500/20 border-green-400/30 text-green-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Company Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder="Enter your company name"
              />
            </div>

            {/* Company Avatar */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Company Avatar
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden backdrop-blur-sm">
                    <div className="text-white/80 text-2xl font-bold">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 bg-blue-500/80 hover:bg-blue-500 text-white p-1.5 rounded-full shadow-sm transition-colors backdrop-blur-sm border border-white/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                <div>
                  <p className="text-sm text-white/70 mb-1">Upload company profile picture</p>
                  <p className="text-xs text-white/50">Recommended: Square image, max 2MB</p>
                </div>
              </div>
            </div>

            {/* Module 2 Results Card Configuration */}
            <div>
              <ResultsCardConfig
                initialConfig={formData.results_card_config}
                onConfigChange={handleResultsConfigChange}
              />
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Business Type *
              </label>
              <select
                name="business_type"
                value={formData.business_type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              >
                <option value="" className="bg-slate-800 text-white">Select Business Type</option>
                <option value="restaurant" className="bg-slate-800 text-white">Restaurant</option>
                <option value="cafe" className="bg-slate-800 text-white">Café</option>
                <option value="hotel" className="bg-slate-800 text-white">Hotel</option>
                <option value="catering" className="bg-slate-800 text-white">Catering</option>
                <option value="other" className="bg-slate-800 text-white">Other</option>
              </select>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Business Email *
                </label>
                <input
                  type="email"
                  name="business_email"
                  value={formData.business_email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="business@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  placeholder="+64 9 123 4567"
                />
              </div>
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                License Number
              </label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleInputChange}
                placeholder="e.g., LA123456"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Address
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  placeholder="Street Address"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    name="address.region"
                    value={formData.address.region}
                    onChange={handleInputChange}
                    placeholder="Region/State"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    name="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={handleInputChange}
                    placeholder="Postal Code"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Monthly Deliveries Estimate */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                Estimated Monthly Deliveries
              </label>
              <select
                name="estimated_monthly_deliveries"
                value={formData.estimated_monthly_deliveries}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              >
                <option value={25} className="bg-slate-800 text-white">1-25 deliveries</option>
                <option value={75} className="bg-slate-800 text-white">26-75 deliveries</option>
                <option value={150} className="bg-slate-800 text-white">76-150 deliveries</option>
                <option value={300} className="bg-slate-800 text-white">151-300 deliveries</option>
                <option value={500} className="bg-slate-800 text-white">300+ deliveries</option>
              </select>
            </div>

            {/* Subscription Info (Read-only) */}
            {userClient && (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                <h3 className="font-medium text-white mb-2">Subscription Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      (userClient as any).subscription_status === 'active' 
                        ? 'bg-green-500/30 text-green-200 border border-green-400/30'
                        : (userClient as any).subscription_status === 'trial'
                        ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30'
                        : 'bg-white/20 text-white/80 border border-white/30'
                    }`}>
                      {(userClient as any).subscription_status || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/70">Tier:</span>
                    <span className="ml-2 font-medium text-white capitalize">
                      {(userClient as any).subscription_tier || 'Standard'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>

          {/* Background Selector Modal */}
          {showBackgroundSelector && (
            <BackgroundSelector
              selectedBackground={currentBackground}
              onBackgroundChange={handleBackgroundChange}
              onClose={() => setShowBackgroundSelector(false)}
              theme="light"
            />
          )}

          {/* Asset Upload Modal */}
          {showAssetUpload && userClient && (
            <AssetUploadModal
              isOpen={showAssetUpload}
              uploadType={uploadType}
              onUploadSuccess={handleAssetUploaded}
              onClose={() => setShowAssetUpload(false)}
              theme="dark"
            />
          )}

          {/* Onboarding Continue Button */}
          {isOnboarding && (
            <div className="text-center mt-8 pt-6 border-t border-white/10">
              <button
                onClick={() => router.push('/console/dashboard?setup=completed')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🚀 Continue to Dashboard
              </button>
              <p className={`${getTextStyle('meta')} text-white/60 mt-2`}>
                You can always return to settings later
              </p>
            </div>
          )}

          {/* Version */}
          <div className="text-center mt-8 pt-4 border-t border-white/10">
            <p className={`${getTextStyle('version')} text-gray-500`}>
              {getVersionDisplay('dev')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}