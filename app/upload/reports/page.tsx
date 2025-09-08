'use client'

// Upload Reports - Module Viewing & Export Functionality
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { DesignTokens, getCardStyle, getTextStyle } from '@/lib/design-system'
import { getModuleAsset, getMappedIcon } from '@/lib/image-storage'
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
              src={getModuleAsset('icons/JiGRupload', { width: 96, height: 96 })} 
              alt="Upload Module" 
              width={96} 
              height={96}
              className="object-contain"
            />
            <div>
              <h1 className={`${getTextStyle('pageTitle')} text-white drop-shadow-lg text-4xl font-bold`}>
                UPLOAD
              </h1>
              <p className="text-white/80 drop-shadow-md italic text-xs">
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
            <div className="flex space-x-1 bg-black/20 p-0.5 rounded-full backdrop-blur-md border border-white/20 scale-75">
              <a 
                href="/upload/console" 
                className="px-3 py-1.5 font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 text-xs TouchTarget"
              >
                Console
              </a>
              <a 
                href="/upload/capture" 
                className="px-3 py-1.5 font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-full transition-all duration-300 text-xs TouchTarget"
              >
                Capture
              </a>
              <a 
                href="/upload/reports" 
                className="px-3 py-1.5 font-semibold text-black bg-white rounded-full transition-all duration-300 text-xs TouchTarget"
              >
                Reports
              </a>
            </div>
          </div>
          <div></div>
        </div>
      </div>

      <div>
            
            {/* Report Controls Section - At Top */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              
              {/* Report Filters - Spans Columns 1-2 */}
              <div className="lg:col-span-2 bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <select className="w-full px-3 py-3 bg-white/20 border border-white/30 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm">
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 3 months</option>
                        <option value="custom">Custom range</option>
                      </select>
                    </div>
                    
                    <div>
                      <select className="w-full px-3 py-3 bg-white/20 border border-white/30 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm">
                        <option value="compliance">Full Compliance</option>
                        <option value="violations">Violations Only</option>
                        <option value="delivery">Delivery Summary</option>
                        <option value="supplier">Supplier Analysis</option>
                      </select>
                    </div>
                    
                    <div>
                      <select className="w-full px-3 py-3 bg-white/20 border border-white/30 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm">
                        <option value="pdf">PDF Report</option>
                        <option value="csv">CSV Export</option>
                        <option value="excel">Excel Workbook</option>
                        <option value="json">JSON Data</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Action Card - Column 3 */}
              <div className="flex items-center justify-center h-full">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-3 rounded-xl font-medium transition-all duration-200">
                  Generate Report
                </button>
              </div>

              {/* Empty 4th Column */}
              <div></div>

            </div>

            {/* Quick Report Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              
              {/* Weekly Summary */}
              <div className={`${getCardStyle('secondary')} flex flex-col`}>
                <div className="text-center mb-4 flex-1">
                  <img 
                    src={getMappedIcon('JiGRsummary', 48)} 
                    alt="Summary" 
                    className="w-12 h-12 object-contain mx-auto mb-3"
                  />
                  <h3 className={`${getTextStyle('cardTitle')} text-white`}>Weekly Summary</h3>
                  <p className={`${getTextStyle('bodySmall')} text-white/80 mt-2`}>
                    Comprehensive weekly compliance overview
                  </p>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 mt-auto">
                  Preview
                </button>
              </div>

              {/* Violation Report */}
              <div className={`${getCardStyle('secondary')} flex flex-col`}>
                <div className="text-center mb-4 flex-1">
                  <img 
                    src={getMappedIcon('JiGRwarning', 48)} 
                    alt="Warning" 
                    className="w-12 h-12 object-contain mx-auto mb-3"
                  />
                  <h3 className={`${getTextStyle('cardTitle')} text-white`}>Violation Report</h3>
                  <p className={`${getTextStyle('bodySmall')} text-white/80 mt-2`}>
                    Delivery violations and corrective actions
                  </p>
                </div>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 mt-auto">
                  Preview
                </button>
              </div>

              {/* Report Statistics */}
              <div className={getCardStyle('secondary')}>
                <div className="text-center mb-4">
                  <img 
                    src={getMappedIcon('JiGRStats', 48)} 
                    alt="Statistics" 
                    className="w-12 h-12 object-contain mx-auto mb-3"
                  />
                  <h3 className={`${getTextStyle('cardTitle')} text-white`}>Report Statistics</h3>
                  <p className={`${getTextStyle('bodySmall')} text-white/80 mt-2`}>
                    Generation metrics and analytics overview
                  </p>
                </div>
                <div className="space-y-2 text-sm px-4">
                  <div className="flex justify-between text-black/90">
                    <span>Total Reports:</span>
                    <span className="font-medium text-white">23</span>
                  </div>
                  <div className="flex justify-between text-black/90">
                    <span>This Month:</span>
                    <span className="font-medium text-white">8</span>
                  </div>
                  <div className="flex justify-between text-black/90">
                    <span>Avg Response:</span>
                    <span className="font-medium text-white">2.3s</span>
                  </div>
                  <div className="flex justify-between text-black/90">
                    <span>Data Points:</span>
                    <span className="font-medium text-white">1,247</span>
                  </div>
                </div>
              </div>

              {/* Empty 4th Column */}
              <div></div>

            </div>

            {/* Report Table - Recent Generated Reports - 3 Columns Wide */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="lg:col-span-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <h3 className={`${getTextStyle('sectionTitle')} text-black mb-4`}>Recent Reports</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200">
                  <div>
                    <h4 className="font-medium text-black">Weekly Summary - Aug 13-19, 2025</h4>
                    <p className="text-sm text-black/80">Generated on Aug 19, 2025 • 47 deliveries processed</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-300 hover:text-white text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-600/20 transition-all">
                      PDF
                    </button>
                    <button className="text-green-300 hover:text-white text-sm font-medium px-3 py-1 rounded-lg hover:bg-green-600/20 transition-all">
                      CSV
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200">
                  <div>
                    <h4 className="font-medium text-black">Delivery Violations - August 2025</h4>
                    <p className="text-sm text-black/80">Generated on Aug 15, 2025 • 3 violations detected</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-300 hover:text-white text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-600/20 transition-all">
                      PDF
                    </button>
                    <button className="text-green-300 hover:text-white text-sm font-medium px-3 py-1 rounded-lg hover:bg-green-600/20 transition-all">
                      CSV
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200">
                  <div>
                    <h4 className="font-medium text-black">Monthly Compliance - July 2025</h4>
                    <p className="text-sm text-black/80">Generated on Aug 1, 2025 • 98.2% compliance rate</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-300 hover:text-white text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-600/20 transition-all">
                      PDF
                    </button>
                    <button className="text-green-300 hover:text-white text-sm font-medium px-3 py-1 rounded-lg hover:bg-green-600/20 transition-all">
                      CSV
                    </button>
                  </div>
                </div>
              </div>
              </div>
              
              {/* Empty 4th Column */}
              <div></div>
            </div>

      </div>
      
    </div>
  )
}