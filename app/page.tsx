'use client'

// Main Upload Interface - Direct access to upload functionality
import { useState, useEffect } from 'react'
import EnhancedComplianceDashboard from './components/compliance/EnhancedComplianceDashboard'
import SimpleResultsCard from './components/results/SimpleResultsCard'
import { supabase } from '@/lib/supabase'
import { DesignTokens, getCardStyle, getTextStyle } from '@/lib/design-system'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { getModuleAsset } from '@/lib/image-storage'
import Image from 'next/image'

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [latestDeliveryRecord, setLatestDeliveryRecord] = useState<any>(null)
  const [processingResults, setProcessingResults] = useState<any>(null)
  const [todaysUploads, setTodaysUploads] = useState<any[]>([])
  const [totalUploads, setTotalUploads] = useState<number>(0)
  const [processingCount, setProcessingCount] = useState<number>(0)
  const [successRate, setSuccessRate] = useState<number>(0)

  // Demo mode by default - no authentication required
  useEffect(() => {
    const setupDemoMode = async () => {
      try {
        // Always use demo mode for main page
        const demoUser = {
          id: 'demo-user-main',
          email: 'demo@jigr.app',
          app_metadata: {},
          user_metadata: { full_name: 'Demo User - Main Interface' },
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setUser(demoUser)
        console.log('✅ Main page: Demo mode activated')
      } catch (error) {
        console.error('Demo mode setup error:', error)
      }
      
      setLoading(false)
    }
    
    setupDemoMode()
  }, [])

  // Load recent uploads for display
  useEffect(() => {
    const loadRecentUploads = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('delivery_records')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (data && !error) {
          setTodaysUploads(data)
          if (data.length > 0) {
            setLatestDeliveryRecord(data[0])
          }
          console.log(`📊 Main page: Loaded ${data.length} recent uploads`)
        }
      } catch (error) {
        console.error('❌ Failed to load recent uploads:', error)
      }
    }
    
    loadRecentUploads()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading upload interface...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image 
              src="/JiGR_Logo-full_figma_circle.png" 
              alt="JiGR Logo" 
              width={40} 
              height={40}
              className="rounded-full"
            />
            <div>
              <h1 className="text-xl font-bold text-white">Hospitality Compliance</h1>
              <p className="text-sm text-slate-400">AI-powered document processing</p>
            </div>
          </div>
          <div className="text-white text-sm">
            Demo Mode Active
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Upload Dashboard */}
        <div className={getCardStyle('primary')}>
          <div className="p-6">
            <h2 className={`${getTextStyle('heading')} text-white mb-6`}>
              📤 Document Upload & Processing
            </h2>
            
            {/* Main upload component */}
            <EnhancedComplianceDashboard />
          </div>
        </div>

        {/* Recent Results */}
        {latestDeliveryRecord && (
          <div className={getCardStyle('secondary')}>
            <div className="p-6">
              <h3 className={`${getTextStyle('subheading')} text-white mb-4`}>
                🎯 Latest Processed Document
              </h3>
              <SimpleResultsCard data={latestDeliveryRecord} />
            </div>
          </div>
        )}

        {/* Recent Uploads List */}
        {todaysUploads.length > 0 && (
          <div className={getCardStyle('secondary')}>
            <div className="p-6">
              <h3 className={`${getTextStyle('subheading')} text-white mb-4`}>
                📋 Recent Uploads ({todaysUploads.length})
              </h3>
              <div className="space-y-4">
                {todaysUploads.slice(0, 3).map((record, index) => (
                  <div key={record.id || index} className="bg-slate-700/50 rounded-lg p-4">
                    <SimpleResultsCard data={record} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Welcome message for new users */}
        {todaysUploads.length === 0 && (
          <div className={getCardStyle('secondary')}>
            <div className="p-6 text-center">
              <h3 className={`${getTextStyle('subheading')} text-white mb-4`}>
                🚀 Welcome to Hospitality Compliance
              </h3>
              <p className="text-slate-300 mb-4">
                Upload your first delivery docket to see our 4 core features in action:
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-blue-600/20 rounded-lg p-3">
                  <p className="text-blue-300 font-medium">📝 Supplier Name</p>
                </div>
                <div className="bg-green-600/20 rounded-lg p-3">
                  <p className="text-green-300 font-medium">📅 Delivery Date</p>
                </div>
                <div className="bg-purple-600/20 rounded-lg p-3">
                  <p className="text-purple-300 font-medium">🖼️ Thumbnail</p>
                </div>
                <div className="bg-yellow-600/20 rounded-lg p-3">
                  <p className="text-yellow-300 font-medium">🔢 Item Count</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}