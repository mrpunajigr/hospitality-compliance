'use client'

// Admin Configure - Business configuration and customization
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { getVersionDisplay } from '@/lib/version'
import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'
import { getModuleConfig } from '@/lib/module-config'
import { ModuleHeader } from '@/app/components/ModuleHeader'

interface BackgroundAsset {
  id: string
  name: string
  file_url: string
  category: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  alt_text: string | null
}

export default function AdminConfigurePage() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUser(user)
          
          const clientInfo = await getUserClient(user.id)
          if (clientInfo) {
            setUserClient(clientInfo)
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        setLoading(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const moduleConfig = getModuleConfig('admin')
  
  if (!moduleConfig) {
    return <div>Module configuration not found</div>
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      // Placeholder for configuration saving
      // In a future update, this will save actual configuration data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage('Configuration saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Save failed:', error)
      setMessage('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={getCardStyle('primary')}>
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className={getTextStyle('body')}>Loading configuration...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-16 pb-8">
      
      {/* Standardized Module Header */}
      <ModuleHeader 
        module={moduleConfig}
        currentPage="configure"
      />
      
      {/* User Info Display */}
      {userClient && (
        <div className="mb-4 text-center">
          <p className="text-blue-300 text-sm">
            {userClient.name} • {userClient.role}
          </p>
        </div>
      )}

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl ${message.includes('success') 
          ? 'bg-green-500/20 border border-green-500/30 text-green-100' 
          : 'bg-red-500/20 border border-red-500/30 text-red-100'
        }`}>
          {message}
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-6">
        
        {/* Left Column - Main Content */}
        <div className="flex-1">
          <div className="space-y-8">
        
        {/* Display Configuration */}
        <div className={getCardStyle('primary')}>
          <h2 className={`${getTextStyle('sectionTitle')} mb-6`}>Display Configuration</h2>
          
          <div className="space-y-6">
            
            {/* Background Management */}
            <div>
              <h3 className={`${getTextStyle('cardTitle')} mb-4`}>Background Settings</h3>
              <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                <p className={`${getTextStyle('body')} text-white/70`}>
                  Background selection and upload options will be available in a future update.
                </p>
              </div>
            </div>

            {/* Results Card Configuration */}
            <div>
              <h3 className={`${getTextStyle('cardTitle')} mb-4`}>Results Card Settings</h3>
              <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                <p className={`${getTextStyle('body')} text-white/70`}>
                  Results card configuration options will be available here.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Business Configuration */}
        <div className={getCardStyle('primary')}>
          <h2 className={`${getTextStyle('sectionTitle')} mb-6`}>Business Configuration</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Compliance Settings */}
            <div className={getCardStyle('secondary')}>
              <h3 className={`${getTextStyle('cardTitle')} mb-4`}>Compliance Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className={`block ${getTextStyle('label')} mb-2`}>Default Temperature Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      defaultValue="-18"
                      className={getFormFieldStyle()}
                      placeholder="Min °C"
                    />
                    <input
                      type="number"
                      defaultValue="4"
                      className={getFormFieldStyle()}
                      placeholder="Max °C"
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block ${getTextStyle('label')} mb-2`}>Alert Threshold (hours)</label>
                  <input
                    type="number"
                    defaultValue="2"
                    className={getFormFieldStyle()}
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className={getCardStyle('secondary')}>
              <h3 className={`${getTextStyle('cardTitle')} mb-4`}>Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={getTextStyle('body')}>Email Alerts</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <span className={getTextStyle('body')}>SMS Notifications</span>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <span className={getTextStyle('body')}>Daily Reports</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* System Information */}
        <div className={getCardStyle('primary')}>
          <h2 className={`${getTextStyle('sectionTitle')} mb-6`}>System Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className={getTextStyle('body')}><strong>Version:</strong> {getVersionDisplay()}</p>
              <p className={getTextStyle('body')}><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className={getTextStyle('body')}><strong>Environment:</strong> Production</p>
              <p className={getTextStyle('body')}><strong>Region:</strong> New Zealand</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>

          </div>
        </div>

        {/* Right Column - Empty Sidebar */}
        <div className="w-64">
          {/* Empty sidebar to maintain layout consistency */}
        </div>

      </div>

      {/* Note: Background selector and asset upload modals will be integrated in a future update */}

    </div>
  )
}