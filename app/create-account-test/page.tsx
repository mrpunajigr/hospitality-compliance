'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { createCompanyAction } from '@/app/actions/CreateCompanyAction'

export default function CreateAccountTestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleTestCreation = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setIsLoading(true)

    console.log('🚀 TEST: Starting account creation test')

    try {
      // Create test user
      const { data, error: authError } = await supabase.auth.signUp({
        email: `test${Date.now()}@jigr.app`,
        password: 'testpassword123',
        options: {
          data: {
            full_name: 'Test User',
            business_name: 'Test Business',
            phone: '123456789',
            business_type: 'restaurant'
          }
        }
      })

      if (authError || !data.user) {
        setMessage(`Auth Error: ${authError?.message}`)
        setIsLoading(false)
        return
      }

      console.log('✅ TEST: User created, now testing server action')

      // Test server action directly
      const formData = new FormData()
      formData.append('businessName', 'Test Business')
      formData.append('businessType', 'restaurant')
      formData.append('phone', '123456789')
      formData.append('userId', data.user.id)
      formData.append('email', data.user.email!)
      formData.append('fullName', 'Test User')

      console.log('🚀 TEST: Calling server action with data:', Object.fromEntries(formData))
      
      const result = await createCompanyAction(formData)
      
      console.log('📋 TEST: Server action result:', result)

      if (result && !result.success) {
        setMessage(`Server Action Error: ${result.error}`)
      } else {
        setMessage('✅ SUCCESS! Account and company created via server action!')
      }

    } catch (error) {
      console.error('🚨 TEST: Detailed error:', error)
      setMessage(`Test Error: ${error instanceof Error ? error.message : String(error)}`)
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Server Action Test</h1>
        
        <form onSubmit={handleTestCreation}>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg"
          >
            {isLoading ? 'Testing...' : 'Test Server Action'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-4 rounded-lg ${message.includes('SUCCESS') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p className="text-sm whitespace-pre-wrap">{message}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            This page tests the server action directly, bypassing all form/deployment issues.
            Open browser console to see detailed logs.
          </p>
        </div>
      </div>
    </div>
  )
}