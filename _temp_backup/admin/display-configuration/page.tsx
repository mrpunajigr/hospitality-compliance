'use client'

// Admin Display Configuration Page
// Allows administrators to configure display settings for client results

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserClient, type UserClient } from '@/lib/auth-utils'
import { getCardStyle, getTextStyle } from '@/lib/design-system'
import ClientDisplayConfigurationPanel from '@/app/components/configuration/ClientDisplayConfigurationPanel'
import type { DisplayConfiguration } from '@/app/api/client-config/display/route'

export default function DisplayConfigurationPage() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [configuration, setConfiguration] = useState<DisplayConfiguration | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        // Get user's client information
        const clientInfo = await getUserClient(user.id)
        if (clientInfo) {
          setUserClient(clientInfo)
        }
      } else {
        // Redirect to login if not authenticated
        router.push('/signin')
        return
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/signin')
    } finally {
      setLoading(false)
    }
  }

  const handleConfigurationSaved = (config: DisplayConfiguration) => {
    setConfiguration(config)
    console.log('Configuration saved:', config)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-white text-lg">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user || !userClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className={getCardStyle('primary')}>
          <div className="text-center py-8">
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
              Access Required
            </h2>
            <p className={`${getTextStyle('body')} text-white/80 mb-6`}>
              You need to be signed in with administrator access to view this page.
            </p>
            <button
              onClick={() => router.push('/signin')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`${getTextStyle('pageTitle')} text-white mb-2`}>
                Display Configuration
              </h1>
              <p className={`${getTextStyle('body')} text-white/80`}>
                Configure how delivery docket results are displayed for {userClient.name}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-200"
              >
                ← Back to Admin
              </button>
              
              <div className="text-right">
                <div className="text-white font-medium">{user.user_metadata?.full_name || user.email}</div>
                <div className="text-white/70 text-sm">{userClient.name}</div>
              </div>
            </div>
          </div>
          
          {/* Current Configuration Status */}
          {configuration && (
            <div className={getCardStyle('secondary')}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">Current Configuration</h3>
                  <p className="text-white/80 text-sm">
                    {configuration.configName} • {configuration.industryPreset} preset
                  </p>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="text-white font-medium">
                      {Object.values(configuration.optionalFields).filter(Boolean).length}
                    </div>
                    <div className="text-white/70">Optional Fields</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-white font-medium">
                      {configuration.displayPreferences.resultsCardLayout}
                    </div>
                    <div className="text-white/70">Layout</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-white font-medium">
                      {configuration.displayPreferences.temperatureUnit}
                    </div>
                    <div className="text-white/70">Temperature</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Configuration Panel */}
        <ClientDisplayConfigurationPanel
          clientId={userClient.id}
          onConfigurationSaved={handleConfigurationSaved}
        />

        {/* Help Section */}
        <div className={`${getCardStyle('secondary')} mt-8`}>
          <h3 className="text-white font-medium mb-4">Configuration Help</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">Mandatory Fields</h4>
              <p className="text-white/70 text-sm">
                These fields are always shown for compliance and safety requirements. 
                They cannot be disabled.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">Optional Fields</h4>
              <p className="text-white/70 text-sm">
                Choose which additional information to display based on your business needs. 
                More fields provide more detail but may clutter the interface.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">Layout Options</h4>
              <p className="text-white/70 text-sm">
                <strong>Compact:</strong> Essential info only<br />
                <strong>Detailed:</strong> All selected fields<br />
                <strong>Minimal:</strong> Critical compliance only
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-600/20 border border-blue-400/30 rounded-xl">
            <h4 className="text-blue-300 font-medium mb-2">💡 Pro Tip</h4>
            <p className="text-blue-200 text-sm">
              Start with an industry preset that matches your business type, then customize 
              individual fields as needed. You can always change settings later.
            </p>
          </div>
        </div>

        {/* Configuration Preview Section */}
        <div className={`${getCardStyle('secondary')} mt-8`}>
          <h3 className="text-white font-medium mb-4">What This Configuration Does</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-white/80 text-sm">
                Controls which fields appear in delivery docket results after AI processing
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-white/80 text-sm">
                Affects how data is displayed in the dashboard and exported reports
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-white/80 text-sm">
                Changes take effect immediately for new document uploads
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-white/80 text-sm">
                Existing documents will use the new display settings when viewed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}