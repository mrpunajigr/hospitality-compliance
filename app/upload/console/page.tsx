'use client'

// Upload Console - Module Dashboard Overview
import { useState, useEffect } from 'react'
import EnhancedComplianceDashboard from '../../components/compliance/EnhancedComplianceDashboard'
import SimpleResultsCard from '../../components/results/SimpleResultsCard'
import { supabase } from '@/lib/supabase'
import { DesignTokens, getCardStyle, getTextStyle } from '@/lib/design-system'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import Image from 'next/image'

export default function UploadConsolePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [latestDeliveryRecord, setLatestDeliveryRecord] = useState<any>(null)
  const [processingResults, setProcessingResults] = useState<any>(null)

  // Authentication handled by upload layout
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        try {
          const clientInfo = await getUserClient(user.id)
          if (clientInfo) {
            setUserClient(clientInfo)
            console.log('✅ Upload Console: Real user authenticated with company:', clientInfo.name)
          } else {
            console.log('ℹ️ Upload Console: User has no associated company')
          }
        } catch (error) {
          console.error('Error loading client info:', error)
        }
      } else {
        // Check for demo mode - Compliance path triggers demo mode automatically
        const isDemoMode = typeof window !== 'undefined' && (
          window.location.pathname.startsWith('/compliance') ||
          new URLSearchParams(window.location.search).get('demo') === 'true' ||
          document.cookie.includes('demo-session=active')
        )
        
        if (isDemoMode) {
          console.log('🚀 Upload Console demo mode detected')
          const demoUser = {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
            email: 'demo@example.com',
            app_metadata: {},
            user_metadata: { full_name: 'Demo User - Upload Console' },
            aud: 'authenticated',
            role: 'authenticated',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setUser(demoUser)
          console.log('✅ Demo user set for compliance console')
        }
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  // Fetch latest delivery records for console overview
  useEffect(() => {
    const fetchLatestResults = async () => {
      try {
        const { data: deliveryRecords, error } = await supabase
          .from('delivery_records')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)

        console.log('📊 Upload Console: Fetched delivery records:', deliveryRecords)

        if (error) {
          console.error('Error fetching delivery records:', error)
          return
        }

        if (deliveryRecords && deliveryRecords.length > 0) {
          const record = deliveryRecords[0]
          console.log('📊 Upload Console: Latest record:', record)
          setLatestDeliveryRecord(record)
          
          if (record.analysis || record.extraction_data) {
            const resultsData = record.analysis || record.extraction_data
            console.log('📊 Upload Console: Setting processing results:', resultsData)
            setProcessingResults(resultsData)
          }
        }
      } catch (error) {
        console.error('Error in fetchLatestResults:', error)
      }
    }

    if (user) {
      fetchLatestResults()
    }
  }, [user])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className={getCardStyle('primary')}>
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className={`${getTextStyle('body')} font-medium`}>Loading Upload Console...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      
      {/* Console Header */}
      <div className="mb-16">
        <div className="grid grid-cols-4 gap-6 items-center">
          <div className="flex items-center space-x-4 col-span-2">
            <Image 
              src="/ModuleIcons/JiGRupload.png" 
              alt="Upload Module" 
              width={96} 
              height={96}
              className="object-contain"
            />
            <div>
              <h1 className={`${getTextStyle('pageTitle')} text-white drop-shadow-lg text-4xl font-bold`}>
                UPLOAD
              </h1>
              <p className={`${getTextStyle('body')} text-white/80 drop-shadow-md`}>
                Document upload, processing, and compliance management
              </p>
              {userClient && (
                <p className="text-blue-300 text-sm mt-1">
                  {userClient.name} • {userClient.role}
                </p>
              )}
              {user && !userClient && (
                <p className="text-blue-300 text-sm mt-1">
                  {user.user_metadata?.full_name || user.email} • Demo Mode
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex space-x-1 bg-black/20 p-0.5 rounded-full backdrop-blur-md border border-white/20">
              <a 
                href="/upload/console" 
                className="px-4 py-2 font-semibold text-black bg-white rounded-full transition-all duration-300 text-sm"
              >
                Console
              </a>
              <a 
                href="/upload/capture" 
                className="px-4 py-2 font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 text-sm"
              >
                Capture
              </a>
              <a 
                href="/upload/reports" 
                className="px-4 py-2 font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 text-sm"
              >
                Reports
              </a>
            </div>
          </div>
          <div></div>
        </div>
      </div>

      {/* Upload Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Uploads */}
        <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-300 text-sm font-medium">Total Uploads</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {latestDeliveryRecord ? '1+' : '0'}
            </div>
            <div className="text-green-300 text-sm">
              <span className="inline-flex items-center space-x-1">
                <span>Ready to process</span>
              </span>
            </div>
          </div>
        </div>

        {/* Processing Status */}
        <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-300 text-sm font-medium">Processing</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {processingResults ? '1' : '0'}
            </div>
            <div className="text-blue-300 text-sm">
              <span className="inline-flex items-center space-x-1">
                <span>AI Analysis</span>
              </span>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-300 text-sm font-medium">Success Rate</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {processingResults ? '100%' : '--'}
            </div>
            <div className="text-green-300 text-sm">
              <span className="inline-flex items-center space-x-1">
                <span>Analysis complete</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      <div className="space-y-16">
        
        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Latest Upload Results */}
          <div>
            
            {latestDeliveryRecord ? (
              <SimpleResultsCard 
                data={{
                  id: latestDeliveryRecord.id,
                  supplier_name: latestDeliveryRecord.supplier_name || latestDeliveryRecord.supplier_info || latestDeliveryRecord.supplier || latestDeliveryRecord.company_name || 'Processing...',
                  delivery_date: latestDeliveryRecord.delivery_date || latestDeliveryRecord.created_at,
                  created_at: latestDeliveryRecord.created_at,
                  uploaded_by: latestDeliveryRecord.uploaded_by,
                  image_path: latestDeliveryRecord.image_path,
                  user_name: user?.user_metadata?.full_name || user?.email,
                  confidence_score: latestDeliveryRecord.confidence_score,
                  client_id: latestDeliveryRecord.client_id || userClient?.id
                }}
                userId={user?.id}
              />
            ) : (
              <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-300 text-sm font-medium">No Uploads Today</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Enhanced Compliance Dashboard for Real Users */}
        {userClient?.id && (
          <div>
            {(() => {
              try {
                return (
                  <EnhancedComplianceDashboard 
                    clientId={userClient.id}
                    userId={user.id}
                  />
                )
              } catch (error) {
                console.error('EnhancedComplianceDashboard error:', error)
                return (
                  <div className={getCardStyle('primary')}>
                    <div className="text-center py-12">
                      <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
                        📊 Compliance Analytics
                      </h2>
                      <p className={`${getTextStyle('body')} text-white/80 mb-6`}>
                        Dashboard is loading... If this persists, please contact support.
                      </p>
                      <div className="bg-orange-600/20 border border-orange-400/30 rounded-xl p-4">
                        <p className="text-orange-200 text-sm">
                          Loading enhanced compliance features...
                        </p>
                      </div>
                    </div>
                  </div>
                )
              }
            })()}
          </div>
        )}

      </div>
      
    </div>
  )
}