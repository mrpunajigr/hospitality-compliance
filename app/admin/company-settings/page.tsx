'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { getVersionDisplay } from '@/lib/version'
import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'
import BackgroundSelector from '@/app/components/BackgroundSelector'
import AssetUploadModal from '@/app/components/AssetUploadModal'

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
    estimated_monthly_deliveries: 50
  })
  const router = useRouter()

  // Check authentication and load company data
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/signin')
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
            estimated_monthly_deliveries: clientInfo.estimated_monthly_deliveries || 50
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className={`${getTextStyle('pageTitle')} drop-shadow-lg`}>
              Company Settings
            </h1>
            <p className={`${getTextStyle('bodySecondary')} drop-shadow-md`}>
              Manage your company information and business details
            </p>
            {userClient && (
              <div className={`${getTextStyle('caption')} text-white/80 drop-shadow-md mt-1`}>
                {userClient.name} • {userClient.role}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className={`${getCardStyle('primary')} max-w-2xl mx-auto`}>
          <div className="mb-6">
            <h2 className={`${getTextStyle('sectionTitle')} text-gray-900 mb-2`}>
              Company Profile
            </h2>
            <p className={`${getTextStyle('body')} text-gray-600`}>
              Manage your company information and business details.
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-xl ${
              message.includes('Error') 
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`${getFormFieldStyle()} bg-white`}
              />
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                name="business_type"
                value={formData.business_type}
                onChange={handleInputChange}
                required
                className={`${getFormFieldStyle()} bg-white`}
              >
                <option value="">Select Business Type</option>
                <option value="restaurant">Restaurant</option>
                <option value="cafe">Café</option>
                <option value="hotel">Hotel</option>
                <option value="catering">Catering</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Email *
                </label>
                <input
                  type="email"
                  name="business_email"
                  value={formData.business_email}
                  onChange={handleInputChange}
                  required
                  className={`${getFormFieldStyle()} bg-white`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`${getFormFieldStyle()} bg-white`}
                />
              </div>
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Number
              </label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleInputChange}
                placeholder="e.g., LA123456"
                className={`${getFormFieldStyle()} bg-white`}
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  placeholder="Street Address"
                  className={`${getFormFieldStyle()} bg-white`}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className={`${getFormFieldStyle()} bg-white`}
                  />
                  <input
                    type="text"
                    name="address.region"
                    value={formData.address.region}
                    onChange={handleInputChange}
                    placeholder="Region/State"
                    className={`${getFormFieldStyle()} bg-white`}
                  />
                  <input
                    type="text"
                    name="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={handleInputChange}
                    placeholder="Postal Code"
                    className={`${getFormFieldStyle()} bg-white`}
                  />
                </div>
              </div>
            </div>

            {/* Monthly Deliveries Estimate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Monthly Deliveries
              </label>
              <select
                name="estimated_monthly_deliveries"
                value={formData.estimated_monthly_deliveries}
                onChange={handleInputChange}
                className={`${getFormFieldStyle()} bg-white`}
              >
                <option value={25}>1-25 deliveries</option>
                <option value={75}>26-75 deliveries</option>
                <option value={150}>76-150 deliveries</option>
                <option value={300}>151-300 deliveries</option>
                <option value={500}>300+ deliveries</option>
              </select>
            </div>

            {/* Subscription Info (Read-only) */}
            {userClient && (
              <div className="bg-gray-50 p-4 rounded-xl border">
                <h3 className="font-medium text-gray-900 mb-2">Subscription Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      userClient.subscription_status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : userClient.subscription_status === 'trial'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {userClient.subscription_status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tier:</span>
                    <span className="ml-2 font-medium text-gray-900 capitalize">
                      {userClient.subscription_tier}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Asset Management Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Asset Management</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Background Images</h4>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowAssetUpload(true)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Upload New
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowBackgroundSelector(true)}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Select Background
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {loadingAssets ? (
                      <div className="col-span-full text-center py-4">
                        <div className="inline-block animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading assets...</p>
                      </div>
                    ) : assets.length > 0 ? (
                      assets.slice(0, 4).map((asset) => (
                        <div key={asset.id} className="relative group">
                          <div 
                            className="aspect-video bg-cover bg-center rounded-lg border-2 cursor-pointer transition-all"
                            style={{ 
                              backgroundImage: `url('${asset.file_url}')`,
                              borderColor: currentBackground === asset.file_url ? '#3B82F6' : '#E5E7EB'
                            }}
                            onClick={() => setCurrentBackground(asset.file_url)}
                          >
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                              {currentBackground === asset.file_url && (
                                <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                                  Selected
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate">{asset.name}</p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">No assets uploaded yet</p>
                        <p className="text-xs mt-1">Upload backgrounds to customize your workspace</p>
                      </div>
                    )}
                  </div>
                  
                  {assets.length > 4 && (
                    <div className="text-center mt-3">
                      <button
                        type="button"
                        onClick={() => setShowBackgroundSelector(true)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        View all {assets.length} assets →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

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