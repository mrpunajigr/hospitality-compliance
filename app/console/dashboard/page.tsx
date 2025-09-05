'use client'

// Enhanced Dashboard Page - Full AI Results Display
import { useState, useEffect } from 'react'
import EnhancedComplianceDashboard from '../../components/compliance/EnhancedComplianceDashboard'
import SimpleResultsCard from '../../components/results/SimpleResultsCard'
import { supabase } from '@/lib/supabase'
import { DesignTokens, getCardStyle, getTextStyle } from '@/lib/design-system'
import { getUserClient, UserClient } from '@/lib/auth-utils'


export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [latestDeliveryRecord, setLatestDeliveryRecord] = useState<any>(null)
  const [processingResults, setProcessingResults] = useState<any>(null)

  // Simplified auth check - rely on console layout for authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        // Get user's client/company information with comprehensive error handling
        try {
          const clientInfo = await getUserClient(user.id)
          if (clientInfo) {
            setUserClient(clientInfo)
            console.log('✅ Real user authenticated with company:', clientInfo.name)
          } else {
            console.log('ℹ️ User has no associated company - company setup needed')
          }
        } catch (error) {
          console.error('Error loading client info:', error)
          console.log('ℹ️ Company association not found - this is expected for new users or in demo mode')
          // Continue without client info - this is normal for users without companies or in demo mode
        }
      } else {
        // Check for demo mode - Console path triggers demo mode automatically
        const isDemoMode = typeof window !== 'undefined' && (
          window.location.pathname.startsWith('/console') ||
          new URLSearchParams(window.location.search).get('demo') === 'true' ||
          document.cookie.includes('demo-session=active') ||
          window.location.pathname.includes('demo')
        )
        
        if (isDemoMode) {
          console.log('🚀 Dashboard demo mode detected')
          console.log('URL params:', window.location.search)
          console.log('Cookies:', document.cookie)
          
          const demoUser = {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
            email: 'demo@example.com',
            app_metadata: {},
            user_metadata: { full_name: 'Demo User - Production' },
            aud: 'authenticated',
            role: 'authenticated',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setUser(demoUser)
          console.log('✅ Demo user set for dashboard')
        }
        // Don't redirect to signin - let console layout handle that
      }
      setLoading(false)
    }
    
    checkAuth()
    
    return () => {}
  }, [])

  // Fetch latest delivery records for results display
  useEffect(() => {
    const fetchLatestResults = async () => {
      try {
        // Fetch the most recent delivery record with processing results
        const { data: deliveryRecords, error } = await supabase
          .from('delivery_records')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)

        console.log('📊 Dashboard: Fetched delivery records:', deliveryRecords)
        console.log('📊 Dashboard: Query error:', error)

        if (error) {
          console.error('Error fetching delivery records:', error)
          return
        }

        if (deliveryRecords && deliveryRecords.length > 0) {
          const record = deliveryRecords[0]
          console.log('📊 Dashboard: Latest record:', record)
          console.log('📊 Dashboard: Record analysis:', record.analysis)
          console.log('📊 Dashboard: Record extraction_data:', record.extraction_data)
          
          setLatestDeliveryRecord(record)
          
          // If the record has analysis results, set them for display
          if (record.analysis || record.extraction_data) {
            const resultsData = record.analysis || record.extraction_data
            console.log('📊 Dashboard: Setting processing results:', resultsData)
            setProcessingResults(resultsData)
          } else {
            console.log('📊 Dashboard: No analysis or extraction_data found in record')
          }
        } else {
          console.log('📊 Dashboard: No delivery records found')
        }
      } catch (error) {
        console.error('Error in fetchLatestResults:', error)
      }
    }

    // Only fetch if we have a user (including demo mode)
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
              <p className={`${getTextStyle('body')} font-medium`}>Loading Dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className={`${getTextStyle('pageTitle')} text-white drop-shadow-lg`}>
          Intelligence Dashboard
        </h1>
        <p className={`${getTextStyle('bodySmall')} text-white/90 drop-shadow-md`}>
          AI-powered insights, compliance analytics, and predictive recommendations
        </p>
        {userClient && (
          <p className="text-blue-300 text-sm mt-2">
            {userClient.name} • {userClient.role}
          </p>
        )}
        {user && !userClient && (
          <p className="text-blue-300 text-sm mt-2">
            {user.user_metadata?.full_name || user.email} • Demo Mode
          </p>
        )}
      </div>

      <div className="space-y-6">
        
        {/* Main Content - Full width */}
        <div className="space-y-6">
          
          {/* Simple Results Card - Clean Design at Top */}
          {false && latestDeliveryRecord ? (
            <div>
              <h2 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>
                📋 Latest Delivery Processing
              </h2>
              <SimpleResultsCard 
                data={{
                  id: latestDeliveryRecord.id,
                  supplier_name: latestDeliveryRecord.supplier_name || latestDeliveryRecord.supplier_info || latestDeliveryRecord.supplier || latestDeliveryRecord.company_name || 'Supplier Processing',
                  delivery_date: latestDeliveryRecord.delivery_date || latestDeliveryRecord.created_at,
                  created_at: latestDeliveryRecord.created_at,
                  uploaded_by: latestDeliveryRecord.uploaded_by,
                  image_path: latestDeliveryRecord.image_path,
                  user_name: user?.user_metadata?.full_name || user?.email,
                  confidence_score: latestDeliveryRecord.confidence_score,
                  client_id: latestDeliveryRecord.client_id || userClient?.id
                }}
                userId={user?.id}
                className="mb-6"
              />
            </div>
          ) : null}

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
                          📊 Compliance Dashboard
                        </h2>
                        <p className={`${getTextStyle('body')} text-white/80 mb-6`}>
                          Dashboard is loading... If this persists, please contact support.
                        </p>
                        <div className="bg-orange-600/20 border border-orange-400/30 rounded-xl p-4">
                          <p className="text-orange-200 text-sm">
                            Loading enhanced dashboard features...
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
      
    </div>
  )
}