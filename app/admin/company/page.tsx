'use client'

// Company Profile Page - Business information and settings
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function CompanyPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white font-medium">Loading Company...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              Company Profile
            </h1>
            <p className="text-white/80 text-sm mb-6">
              Please sign in to manage company settings
            </p>
            
            <button
              onClick={handleDemoSignIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] mb-4"
            >
              Sign In as Demo User
            </button>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <p className="text-xs text-white/70">
                Demo mode with test company data
              </p>
            </div>
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
              <h1 className="text-2xl font-bold text-white">
                Company Profile
              </h1>
              <p className="text-white/70 text-sm">
                Manage your business information and settings
              </p>
              <p className="text-blue-300 text-xs mt-1">
                Demo Mode
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="flex gap-6">
            
            {/* Left Column - Main Content */}
            <div className="flex-1">
              
              {/* Overview Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                
                {/* Business Info */}
                <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🏢</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Business Info</h3>
                    <p className="text-sm text-white/90 mt-2">
                      Demo Restaurant Ltd
                    </p>
                  </div>
                  <div className="text-sm text-white space-y-1">
                    <p><strong>Type:</strong> Restaurant</p>
                    <p><strong>License:</strong> AL123456</p>
                    <p><strong>Phone:</strong> +64 9 123 4567</p>
                  </div>
                </div>

                {/* Subscription */}
                <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">💎</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Subscription</h3>
                    <p className="text-sm text-white/90 mt-2">
                      Professional Plan
                    </p>
                  </div>
                  <div className="text-sm text-white space-y-1">
                    <p><strong>Status:</strong> Active</p>
                    <p><strong>Usage:</strong> 127/2000</p>
                    <p><strong>Billing:</strong> $99/month</p>
                  </div>
                </div>

                {/* Team */}
                <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">👥</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">Team</h3>
                    <p className="text-sm text-white/90 mt-2">
                      4 Active Users
                    </p>
                  </div>
                  <div className="text-sm text-white space-y-1">
                    <p><strong>Admins:</strong> 2</p>
                    <p><strong>Staff:</strong> 2</p>
                    <p><strong>Pending:</strong> 0</p>
                  </div>
                </div>

              </div>

              {/* Business Information Form */}
              <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-xl font-semibold text-white mb-6">Business Information</h2>
                
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Business Name</label>
                      <input
                        type="text"
                        defaultValue="Demo Restaurant Ltd"
                        className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-900 placeholder-gray-600 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Business Type</label>
                      <select className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-900 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="restaurant">Restaurant</option>
                        <option value="cafe">Café</option>
                        <option value="hotel">Hotel</option>
                        <option value="catering">Catering</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Contact Email</label>
                      <input
                        type="email"
                        defaultValue="admin@demorestaurant.co.nz"
                        className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-900 placeholder-gray-600 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue="+64 9 123 4567"
                        className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-900 placeholder-gray-600 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Address</label>
                    <textarea
                      rows={3}
                      defaultValue="123 Queen Street, Auckland CBD, Auckland 1010"
                      className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-900 placeholder-gray-600 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Alcohol License Number</label>
                    <input
                      type="text"
                      defaultValue="AL123456789"
                      className="w-full px-4 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-900 placeholder-gray-600 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      className="bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-white/30 backdrop-blur-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Right Column - Quick Actions Sidebar */}
            <div className="w-64">
              <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg sticky top-8">
                <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
                
                <div>
                  <Link href="/admin/company/settings" className="block mb-4">
                    <div className="bg-white/20 hover:bg-white/30 rounded-xl p-6 transition-all duration-200 cursor-pointer">
                      <div>
                        <h3 className="font-semibold text-white text-lg">Settings</h3>
                        <p className="text-sm text-white/80 mt-2">Compliance rules & preferences</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/admin/company/team" className="block mb-4">
                    <div className="bg-white/20 hover:bg-white/30 rounded-xl p-6 transition-all duration-200 cursor-pointer">
                      <div>
                        <h3 className="font-semibold text-white text-lg">Team</h3>
                        <p className="text-sm text-white/80 mt-2">Manage users & permissions</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/admin/company/billing" className="block mb-4">
                    <div className="bg-white/20 hover:bg-white/30 rounded-xl p-6 transition-all duration-200 cursor-pointer">
                      <div>
                        <h3 className="font-semibold text-white text-lg">Billing</h3>
                        <p className="text-sm text-white/80 mt-2">Subscription & payment</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/workspace/reports" className="block">
                    <div className="bg-white/20 hover:bg-white/30 rounded-xl p-6 transition-all duration-200 cursor-pointer">
                      <div>
                        <h3 className="font-semibold text-white text-lg">Reports</h3>
                        <p className="text-sm text-white/80 mt-2">Export compliance data</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
    </div>
  )
}