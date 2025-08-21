'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ImageUploader from '@/app/components/ImageUploader'
import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'
import { getVersionDisplay } from '@/lib/version'

// Demo client ID - in real app this would come from auth context
const DEMO_CLIENT_ID = '550e8400-e29b-41d4-a716-446655440001'

export default function CompanySettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [client, setClient] = useState<any>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user || {
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
          email: 'demo@example.com'
        })
        
        // Fetch client data
        const { data: clientData, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', DEMO_CLIENT_ID)
          .single()
        
        if (!error && clientData) {
          setClient(clientData)
          setLogoUrl(clientData.logo_url)
        } else {
          // Demo fallback
          setClient({
            id: DEMO_CLIENT_ID,
            name: 'Demo Restaurant Ltd',
            business_type: 'restaurant',
            business_email: 'info@demorestaurant.com',
            phone: '+64 9 123 4567',
            logo_url: null
          })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogoUploadSuccess = (imageUrl: string) => {
    setLogoUrl(imageUrl)
    alert('Company logo updated successfully!')
  }

  const handleLogoUploadError = (error: string) => {
    console.error('Logo upload error:', error)
    alert(`Logo upload failed: ${error}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={getCardStyle('primary')}>
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white font-medium">Loading Settings...</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className={`${getTextStyle('pageTitle')} text-white`}>
                Settings
              </h1>
              <p className={`${getTextStyle('bodySmall')} text-white/70`}>
                Manage your company configuration and preferences
              </p>
              <p className="text-blue-300 text-xs mt-1">
                Demo Mode
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Company Branding Section */}
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl mb-8">
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-6`}>Company Branding</h2>
            
            <div className="flex items-start space-x-8">
              <div className="flex-shrink-0">
                <ImageUploader
                  currentImageUrl={logoUrl}
                  onUploadSuccess={handleLogoUploadSuccess}
                  onUploadError={handleLogoUploadError}
                  uploadEndpoint="/api/upload-client-logo"
                  uploadData={{ 
                    clientId: client?.id || DEMO_CLIENT_ID, 
                    userId: user?.id || '' 
                  }}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']}
                  maxSizeMB={10}
                  shape="square"
                  size="large"
                  title="Company Logo"
                  description="Upload your business logo"
                />
              </div>
              
              <div className="flex-1">
                <h3 className={`${getTextStyle('cardTitle')} text-white mb-2`}>Brand Guidelines</h3>
                <div className="text-sm text-white/80 space-y-2">
                  <p>• Logo should be clear and professional</p>
                  <p>• Supported formats: JPG, PNG, WebP, SVG</p>
                  <p>• Maximum file size: 10MB</p>
                  <p>• Recommended dimensions: 400x400px minimum</p>
                  <p>• Your logo will appear in navigation and reports</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl mb-8">
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-6`}>Company Information</h2>
            
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={`block ${getTextStyle('label')} text-white mb-2`}>Company Name</label>
                  <input
                    type="text"
                    defaultValue={client?.name || 'Demo Restaurant Ltd'}
                    className={getFormFieldStyle()}
                  />
                </div>
                
                <div>
                  <label className={`block ${getTextStyle('label')} text-white mb-2`}>Business Type</label>
                  <select 
                    defaultValue={client?.business_type || 'restaurant'}
                    className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-gray-900 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Café</option>
                    <option value="hotel">Hotel</option>
                    <option value="catering">Catering</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={`block ${getTextStyle('label')} text-white mb-2`}>Business Email</label>
                  <input
                    type="email"
                    defaultValue={client?.business_email || 'info@demorestaurant.com'}
                    className={getFormFieldStyle()}
                  />
                </div>
                
                <div>
                  <label className={`block ${getTextStyle('label')} text-white mb-2`}>Phone Number</label>
                  <input
                    type="tel"
                    defaultValue={client?.phone || '+64 9 123 4567'}
                    className={getFormFieldStyle()}
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl mb-8">
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-6`}>Compliance Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Temperature Monitoring</label>
                  <p className="text-white/80 text-sm">Enable automatic temperature alerts</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition-transform"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Daily Reports</label>
                  <p className="text-white/80 text-sm">Generate daily compliance reports</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center space-x-4">
            <button className="bg-white/20 hover:bg-white/30 text-gray-900 font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-white/30 backdrop-blur-sm">
              Cancel
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
              Save Changes
            </button>
          </div>
          
          {/* Version */}
          <div className="text-center mt-8">
            <span className={`${getTextStyle('version')} text-white/60`}>{getVersionDisplay('short')}</span>
          </div>

        </div>
    </div>
  )
}