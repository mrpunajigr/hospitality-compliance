'use client'

import { useState } from 'react'

export default function EmailDebugDashboard() {
  const [testEmail, setTestEmail] = useState('')
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTest, setActiveTest] = useState<string>('')

  const testDirectEmail = async () => {
    setIsLoading(true)
    setActiveTest('direct')
    try {
      console.log('🧪 Testing direct email to:', testEmail)
      const response = await fetch('/api/test-direct-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail })
      })
      
      const result = await response.json()
      setTestResult({ type: 'direct', result })
      console.log('🧪 Direct email test result:', result)
    } catch (error) {
      setTestResult({ 
        type: 'direct', 
        result: { success: false, error: error instanceof Error ? error.message : 'Unknown error' } 
      })
    } finally {
      setIsLoading(false)
      setActiveTest('')
    }
  }

  const testSignupEmail = async () => {
    setIsLoading(true)
    setActiveTest('signup')
    try {
      console.log('🧪 Testing signup flow email to:', testEmail)
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          subject: 'Signup Flow Test Email',
          template: 'welcome',
          data: {
            companyName: 'Test Company',
            userFullName: 'Test User',
            tempCode: 'TEST123',
            loginUrl: 'https://jigr.app/signin'
          }
        })
      })
      
      const result = await response.json()
      setTestResult({ type: 'signup', result })
      console.log('🧪 Signup email test result:', result)
    } catch (error) {
      setTestResult({ 
        type: 'signup', 
        result: { success: false, error: error instanceof Error ? error.message : 'Unknown error' } 
      })
    } finally {
      setIsLoading(false)
      setActiveTest('')
    }
  }

  const checkEmailConfig = async () => {
    setIsLoading(true)
    setActiveTest('config')
    try {
      console.log('🧪 Checking email configuration...')
      const response = await fetch('/api/test-direct-email')
      const result = await response.json()
      setTestResult({ type: 'config', result })
      console.log('🧪 Email config result:', result)
    } catch (error) {
      setTestResult({ 
        type: 'config', 
        result: { success: false, error: error instanceof Error ? error.message : 'Unknown error' } 
      })
    } finally {
      setIsLoading(false)
      setActiveTest('')
    }
  }

  // Only show in development
  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-h-96 overflow-auto bg-red-50 border-2 border-red-300 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-red-800 font-bold">🐛 Email Debug Dashboard</h3>
        <span className="text-xs text-red-600">(Dev Only)</span>
      </div>
      
      <div className="space-y-3">
        <div>
          <input
            type="email"
            placeholder="Test email address"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded text-sm"
          />
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <button 
            onClick={checkEmailConfig}
            disabled={isLoading}
            className={`text-xs px-3 py-2 rounded font-medium ${
              isLoading && activeTest === 'config'
                ? 'bg-gray-300 text-gray-600' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isLoading && activeTest === 'config' ? 'Checking...' : 'Check Config'}
          </button>
          
          <button 
            onClick={testDirectEmail}
            disabled={!testEmail || isLoading}
            className={`text-xs px-3 py-2 rounded font-medium ${
              !testEmail || isLoading
                ? 'bg-gray-300 text-gray-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isLoading && activeTest === 'direct' ? 'Testing...' : 'Test Direct'}
          </button>
          
          <button 
            onClick={testSignupEmail}
            disabled={!testEmail || isLoading}
            className={`text-xs px-3 py-2 rounded font-medium ${
              !testEmail || isLoading
                ? 'bg-gray-300 text-gray-600' 
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isLoading && activeTest === 'signup' ? 'Testing...' : 'Test Signup Flow'}
          </button>
        </div>

        {testResult && (
          <div className="mt-4">
            <div className="text-xs font-medium text-gray-700 mb-2">
              {testResult.type === 'direct' && '🧪 Direct Email Test Result:'}
              {testResult.type === 'signup' && '📧 Signup Flow Test Result:'}
              {testResult.type === 'config' && '⚙️ Configuration Check:'}
            </div>
            <div className="bg-white p-3 rounded border text-xs overflow-auto max-h-32">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(testResult.result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}