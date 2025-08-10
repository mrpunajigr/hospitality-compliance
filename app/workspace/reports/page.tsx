'use client'

// Reports Page - Compliance reporting and analytics
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
      } else {
        // Auto sign-in with demo user for smoother development experience
        const demoUser = {
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
          email: 'demo@example.com',
          app_metadata: {},
          user_metadata: { full_name: 'Demo User' },
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setUser(demoUser)
      }
      setLoading(false)
    }
    
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleDemoSignIn = async () => {
    try {
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
      
      if (!anonError && anonData.user) {
        console.log('Anonymous demo user signed in successfully')
        return
      }

      // Fallback to demo user
      const demoUser = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
        email: 'demo@example.com',
        app_metadata: {},
        user_metadata: { full_name: 'Demo User' },
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setUser(demoUser)
      
    } catch (err) {
      console.error('Demo sign in error:', err)
      
      const demoUser = {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
        email: 'demo@example.com',
        app_metadata: {},
        user_metadata: { full_name: 'Demo User' },
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setUser(demoUser)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white font-medium">Loading Reports...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg max-w-md w-full">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-2">
                Compliance Reports
              </h1>
              <p className="text-white/80 text-sm mb-6">
                Please sign in to view reports
              </p>
              
              <button
                onClick={handleDemoSignIn}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] mb-4"
              >
                Sign In as Demo User
              </button>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <p className="text-xs text-white/80">
                  Demo mode with test compliance data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header - Exact Dashboard Style */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Compliance Reports
        </h1>
        <p className="text-white/70 text-sm">
          Generate and export compliance documentation
        </p>
        <p className="text-blue-300 text-xs mt-1">
          Demo Mode
        </p>
      </div>

      <div className="flex gap-6">
        
        {/* Left Column - Main Content */}
        <div className="flex-1">
          
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
            
            {/* Report Types */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              
              {/* Weekly Summary */}
              <div className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="w-6 h-6 bg-blue-600 rounded"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Weekly Summary</h3>
                  <p className="text-sm text-gray-700 mt-2">
                    Comprehensive weekly compliance overview
                  </p>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200">
                  Generate Report
                </button>
              </div>

              {/* Violation Report */}
              <div className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="w-6 h-6 bg-red-600 rounded"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Violation Report</h3>
                  <p className="text-sm text-gray-700 mt-2">
                    Temperature violations and corrective actions
                  </p>
                </div>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200">
                  Generate Report
                </button>
              </div>

              {/* Inspector Access */}
              <div className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="w-6 h-6 bg-green-600 rounded"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Inspector Access</h3>
                  <p className="text-sm text-gray-700 mt-2">
                    Generate secure inspector portal link
                  </p>
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200">
                  Create Access
                </button>
              </div>

            </div>

            {/* Report History */}
            <div className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">Weekly Summary - Aug 1-7, 2025</h4>
                    <p className="text-sm text-gray-700">Generated on Aug 7, 2025</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      Download PDF
                    </button>
                    <button className="text-green-400 hover:text-green-300 text-sm font-medium">
                      Export CSV
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">Temperature Violations - July 2025</h4>
                    <p className="text-sm text-gray-700">Generated on Aug 1, 2025</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      Download PDF
                    </button>
                    <button className="text-green-400 hover:text-green-300 text-sm font-medium">
                      Export CSV
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">Monthly Compliance - July 2025</h4>
                    <p className="text-sm text-gray-700">Generated on Jul 31, 2025</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      Download PDF
                    </button>
                    <button className="text-green-400 hover:text-green-300 text-sm font-medium">
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>


          </div>
          
        </div>

        {/* Right Column - Report Actions Sidebar */}
        <div className="w-64 space-y-6">
          
          {/* Report Actions Menu */}
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-6">Report Actions</h2>
            
            <div>
              <button 
                onClick={() => router.push('/workspace/dashboard')}
                className="block w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl transition-all duration-200 text-left"
              >
                <div>
                  <h3 className="font-semibold text-lg">View Dashboard</h3>
                  <p className="text-sm mt-1 opacity-90">Check compliance metrics</p>
                </div>
              </button>
              
              <button 
                onClick={() => router.push('/workspace/upload')}
                className="block w-full bg-white/20 hover:bg-white/30 text-white py-4 px-6 rounded-xl transition-all duration-200 text-left"
              >
                <div>
                  <h3 className="font-semibold text-lg">Upload Documents</h3>
                  <p className="text-sm mt-1 opacity-90">Add new delivery dockets</p>
                </div>
              </button>
            </div>
          </div>
          
          {/* Custom Report Builder Menu */}
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Custom Report Builder</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Date Range</label>
                <select className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Custom range</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Report Type</label>
                <select className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Full Compliance</option>
                  <option>Violations Only</option>
                  <option>Temperature Summary</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Format</label>
                <select className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>PDF Report</option>
                  <option>CSV Export</option>
                  <option>Excel Workbook</option>
                </select>
              </div>
            </div>
            
            <button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
              Generate Custom Report
            </button>
          </div>
          
        </div>

      </div>
      
    </div>
  )
}