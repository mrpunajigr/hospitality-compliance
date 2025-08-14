'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserClient, UserClient } from '@/lib/auth-utils'
import { getTextStyle } from '@/lib/design-system'

export default function TeamPage() {
  const [user, setUser] = useState<any>(null)
  const [userClient, setUserClient] = useState<UserClient | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        try {
          const clientInfo = await getUserClient(user.id)
          if (clientInfo) {
            setUserClient(clientInfo)
          }
        } catch (error) {
          console.error('Error loading client info:', error)
        }
      }
    }
    
    loadUserData()
  }, [])
  return (
    <div className="min-h-screen">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className={`${getTextStyle('pageTitle')} drop-shadow-lg`}>
                Team Management
              </h1>
              <p className={`${getTextStyle('bodySecondary')} drop-shadow-md`}>
                Manage your team members and their permissions
              </p>
              {userClient && (
                <div className={`${getTextStyle('caption')} text-white/80 drop-shadow-md mt-1`}>
                  {userClient.name} • {userClient.role}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl">

            <div className="mb-6">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg">
                + Invite Team Member
              </button>
            </div>

            <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">JD</span>
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold">John Doe</h3>
                  <p className="text-blue-600 text-sm">john@company.com</p>
                  <span className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full mt-1">Admin</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="bg-white/20 hover:bg-white/30 text-gray-900 px-4 py-2 rounded-lg text-sm transition-colors font-medium">
                  Edit
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">JS</span>
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold">Jane Smith</h3>
                  <p className="text-green-600 text-sm">jane@company.com</p>
                  <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded-full mt-1">Manager</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="bg-white/20 hover:bg-white/30 text-gray-900 px-4 py-2 rounded-lg text-sm transition-colors font-medium">
                  Edit
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">MB</span>
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold">Mike Brown</h3>
                  <p className="text-gray-600 text-sm">mike@company.com</p>
                  <span className="inline-block bg-gray-600 text-white text-xs px-2 py-1 rounded-full mt-1">Staff</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="bg-white/20 hover:bg-white/30 text-gray-900 px-4 py-2 rounded-lg text-sm transition-colors font-medium">
                  Edit
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  Remove
                </button>
              </div>
            </div>
          </div>
            </div>

            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Pending Invitations</h2>
              
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-gray-900 font-medium">Sarah Johnson</h4>
                      <p className="text-yellow-600 text-sm">sarah@newrestaurant.com</p>
                      <span className="inline-block bg-yellow-600 text-white text-xs px-2 py-1 rounded-full mt-1">Manager</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors">
                        Resend
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">Invited 2 days ago</p>
                </div>
                
                <div className="text-gray-600 text-center py-4">
                  <p className="text-sm">1 pending invitation</p>
                </div>
              </div>
            </div>
            
            {/* Version */}
            <div className="text-center mt-8">
              <span className="text-white/60 text-sm">v1.8.6</span>
            </div>
          </div>
        </div>
    </div>
  )
}