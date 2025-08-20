'use client'

// Upload Reports - Module Viewing & Export Functionality
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { DesignTokens, getCardStyle, getTextStyle } from '@/lib/design-system'
import Image from 'next/image'

export default function UploadReportsPage() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
          }
        } catch (error) {
          console.error('Error loading client info in compliance reports:', error)
        }
      } else {
        // Check for demo mode - Compliance path triggers demo mode automatically
        const isDemoMode = typeof window !== 'undefined' && (
          window.location.pathname.startsWith('/compliance') ||
          new URLSearchParams(window.location.search).get('demo') === 'true' ||
          document.cookie.includes('demo-session=active')
        )
        
        if (isDemoMode) {
          console.log('🚀 Upload Reports demo mode detected')
          const demoUser = {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
            email: 'demo@example.com',
            app_metadata: {},
            user_metadata: { full_name: 'Demo User - Upload Reports' },
            aud: 'authenticated',
            role: 'authenticated',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setUser(demoUser)
        }
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className={getCardStyle('primary')}>
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white font-medium">Loading Upload Reports...</p>
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
                className="px-4 py-2 font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 text-sm"
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
                className="px-4 py-2 font-semibold text-black bg-white rounded-full transition-all duration-300 text-sm"
              >
                Reports
              </a>
            </div>
          </div>
          <div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Report Interface - 3 columns */}
        <div className="lg:col-span-3">
          
          <div className={getCardStyle('primary')}>
            
            {/* Report Filters */}
            <div className="mb-8">
              <h2 className={`${getTextStyle('sectionTitle')} text-white mb-6`}>
                Report Filters
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className={`block ${getTextStyle('label')} text-white mb-2`}>Date Range</label>
                  <select className="w-full px-3 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm">
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 3 months</option>
                    <option value="custom">Custom range</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block ${getTextStyle('label')} text-white mb-2`}>Report Type</label>
                  <select className="w-full px-3 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm">
                    <option value="compliance">Full Compliance</option>
                    <option value="violations">Violations Only</option>
                    <option value="delivery">Delivery Summary</option>
                    <option value="supplier">Supplier Analysis</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block ${getTextStyle('label')} text-white mb-2`}>Export Format</label>
                  <select className="w-full px-3 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm">
                    <option value="pdf">PDF Report</option>
                    <option value="csv">CSV Export</option>
                    <option value="excel">Excel Workbook</option>
                    <option value="json">JSON Data</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
                  Generate Report
                </button>
                <button className="bg-white/20 hover:bg-white/30 border border-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
                  Preview Data
                </button>
              </div>
            </div>

            {/* Quick Report Templates */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              
              {/* Weekly Summary */}
              <div className={getCardStyle('secondary')}>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h3 className={`${getTextStyle('cardTitle')} text-white`}>Weekly Summary</h3>
                  <p className={`${getTextStyle('bodySmall')} text-white/80 mt-2`}>
                    Comprehensive weekly compliance overview
                  </p>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200">
                  Generate Report
                </button>
              </div>

              {/* Violation Report */}
              <div className={getCardStyle('secondary')}>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h3 className={`${getTextStyle('cardTitle')} text-white`}>Violation Report</h3>
                  <p className={`${getTextStyle('bodySmall')} text-white/80 mt-2`}>
                    Delivery violations and corrective actions
                  </p>
                </div>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200">
                  Generate Report
                </button>
              </div>

              {/* Inspector Access */}
              <div className={getCardStyle('secondary')}>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className={`${getTextStyle('cardTitle')} text-white`}>Inspector Access</h3>
                  <p className={`${getTextStyle('bodySmall')} text-white/80 mt-2`}>
                    Generate secure inspector portal link
                  </p>
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200">
                  Create Access
                </button>
              </div>

            </div>

            {/* Report Table - Recent Generated Reports */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <h3 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>Recent Reports</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200">
                  <div>
                    <h4 className="font-medium text-white">Weekly Summary - Aug 13-19, 2025</h4>
                    <p className="text-sm text-white/80">Generated on Aug 19, 2025 • 47 deliveries processed</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-300 hover:text-white text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-600/20 transition-all">
                      📄 PDF
                    </button>
                    <button className="text-green-300 hover:text-white text-sm font-medium px-3 py-1 rounded-lg hover:bg-green-600/20 transition-all">
                      📊 CSV
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200">
                  <div>
                    <h4 className="font-medium text-white">Delivery Violations - August 2025</h4>
                    <p className="text-sm text-white/80">Generated on Aug 15, 2025 • 3 violations detected</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-300 hover:text-white text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-600/20 transition-all">
                      📄 PDF
                    </button>
                    <button className="text-green-300 hover:text-white text-sm font-medium px-3 py-1 rounded-lg hover:bg-green-600/20 transition-all">
                      📊 CSV
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200">
                  <div>
                    <h4 className="font-medium text-white">Monthly Compliance - July 2025</h4>
                    <p className="text-sm text-white/80">Generated on Aug 1, 2025 • 98.2% compliance rate</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-300 hover:text-white text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-600/20 transition-all">
                      📄 PDF
                    </button>
                    <button className="text-green-300 hover:text-white text-sm font-medium px-3 py-1 rounded-lg hover:bg-green-600/20 transition-all">
                      📊 CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
          
        </div>

        {/* Reports Sidebar - 1 column */}
        <div className="lg:col-span-1">
          <div className={getCardStyle('primary')}>
            <h2 className={`${getTextStyle('sectionTitle')} text-white mb-6`}>Export Actions</h2>
            
            <div className="space-y-4">
              <button 
                onClick={() => router.push('/upload/console')}
                className="block w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 text-white py-4 px-6 rounded-xl transition-all duration-200 text-left"
              >
                <div>
                  <h3 className="font-semibold">📊 View Console</h3>
                  <p className="text-sm mt-1 opacity-90">Return to dashboard</p>
                </div>
              </button>
              
              <button 
                onClick={() => router.push('/upload/capture')}
                className="block w-full bg-green-600/20 hover:bg-green-600/30 border border-green-400/30 text-white py-4 px-6 rounded-xl transition-all duration-200 text-left"
              >
                <div>
                  <h3 className="font-semibold">📤 Upload More</h3>
                  <p className="text-sm mt-1 opacity-90">Add delivery documents</p>
                </div>
              </button>

              {/* Report Statistics */}
              <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/20">
                <h3 className="text-white font-semibold text-sm mb-3">Report Statistics</h3>
                <div className="space-y-2 text-xs text-white/80">
                  <div className="flex justify-between">
                    <span>Total Reports:</span>
                    <span className="text-white font-medium">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Month:</span>
                    <span className="text-white font-medium">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response:</span>
                    <span className="text-white font-medium">2.3s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Points:</span>
                    <span className="text-white font-medium">1,247</span>
                  </div>
                </div>
              </div>

              {/* Chart Preview */}
              <div className="mt-6 p-4 bg-white/10 rounded-xl border border-white/20">
                <h3 className="text-white font-semibold text-sm mb-3">Visual Analytics</h3>
                <div className="bg-gradient-to-r from-blue-500/20 to-green-500/20 h-20 rounded-lg flex items-center justify-center">
                  <span className="text-white/80 text-xs">Chart preview available in generated reports</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  )
}