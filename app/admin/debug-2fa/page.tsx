'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Debug2FAPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        // Get current user and session
        const { data: { user, session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !user) {
          setDebugInfo({ error: 'Not authenticated', sessionError })
          setLoading(false)
          return
        }

        // Get MFA factors
        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
        
        // Get user info
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()

        setDebugInfo({
          user: {
            id: user.id,
            email: user.email,
            aal: (user as any).aal,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at
          },
          session: {
            access_token: session?.access_token ? '***EXISTS***' : 'MISSING',
            refresh_token: session?.refresh_token ? '***EXISTS***' : 'MISSING',
            expires_at: session?.expires_at,
            expires_in: session?.expires_in
          },
          currentUser: {
            id: currentUser?.id,
            aal: (currentUser as any)?.aal
          },
          factors: {
            data: factors,
            error: factorsError?.message || null,
            count: factors?.totp?.length || 0
          },
          timestamp: new Date().toISOString()
        })
        
        console.log('🔍 DEBUG 2FA FULL INFO:', {
          user,
          session,
          currentUser,
          factors,
          factorsError
        })
        
      } catch (error) {
        console.error('Debug error:', error)
        setDebugInfo({ 
          error: 'Debug failed', 
          details: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
      setLoading(false)
    }

    fetchDebugInfo()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 2FA Debug Information</h1>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Output</h2>
          
          <pre className="bg-gray-100 rounded-lg p-4 overflow-auto text-sm">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          
          {debugInfo?.factors?.data && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">2FA Status Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-blue-900">TOTP Factors</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {debugInfo.factors.count || 0}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-green-900">AAL Level</div>
                  <div className="text-2xl font-bold text-green-600">
                    {debugInfo.user?.aal || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-600">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Enable 2FA from the profile page</li>
              <li>Refresh this page to see updated factors</li>
              <li>Log out and back in to test detection</li>
              <li>Check console for detailed logs</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}