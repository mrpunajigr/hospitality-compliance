'use client'

// Minimal Authentication and Database Test Component
// Tests core auth→database chain without AWS/extraction complexity

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCardStyle, getTextStyle } from '@/lib/design-system'
import DeliveryDocketCard from '@/app/components/delivery/DeliveryDocketCard'

interface TestRecord {
  id: string
  user_id: string
  timestamp: string
  test_message: string
  created_at: string
  supplier_name?: string
  delivery_date?: string
  image_path?: string
  processing_status?: string
  raw_extracted_text?: string
}

export default function AuthDatabaseTest() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testRecord, setTestRecord] = useState<TestRecord | null>(null)
  const [writeStatus, setWriteStatus] = useState<'idle' | 'writing' | 'success' | 'error'>('idle')
  const [readStatus, setReadStatus] = useState<'idle' | 'reading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [signingIn, setSigningIn] = useState(false)
  const [creating, setCreating] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [tableSchema, setTableSchema] = useState<any[]>([])
  const [checkingSchema, setCheckingSchema] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // 1. AUTHENTICATION TEST
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if there's an active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setErrorMessage(`Session Error: ${sessionError.message}`)
          setLoading(false)
          return
        }
        
        if (!session) {
          console.warn('⚠️ No active session found')
          setErrorMessage('No active session - please sign in first')
          setLoading(false)
          return
        }
        
        // If session exists, get user details
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Auth error:', error)
          setErrorMessage(`Auth Error: ${error.message}`)
        } else if (user) {
          setUser(user)
          console.log('✅ AUTH TEST: User authenticated:', user.email, user.id)
          console.log('✅ AUTH TEST: Session active:', session.access_token ? 'Yes' : 'No')
        } else {
          console.warn('⚠️ Session exists but no user data')
          setErrorMessage('Session exists but user data unavailable')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setErrorMessage(`Authentication check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  // 2. SIMPLE DATABASE WRITE TEST (via Edge Function)
  const testDatabaseWrite = async () => {
    if (!user) {
      setErrorMessage('No user authenticated for write test')
      return
    }

    setWriteStatus('writing')
    setErrorMessage('')
    
    try {
      const testMessage = `Edge Function test write at ${new Date().toLocaleTimeString()}`
      
      console.log('🔄 Calling process-delivery-docket Edge Function with user:', user.id)
      
      let requestBody: any = {
        testMessage: testMessage,
        clientId: 'b13e93dd-e981-4d43-97e6-26b7713fb90c'
      }
      
      // Add file data if file is selected
      if (selectedFile) {
        console.log('🔄 Converting file to base64:', selectedFile.name)
        const fileReader = new FileReader()
        const fileData = await new Promise<string>((resolve, reject) => {
          fileReader.onload = () => {
            const result = fileReader.result as string
            // Remove data:image/jpeg;base64, prefix
            const base64Data = result.split(',')[1]
            resolve(base64Data)
          }
          fileReader.onerror = reject
          fileReader.readAsDataURL(selectedFile)
        })
        
        requestBody = {
          ...requestBody,
          fileData: fileData,
          fileName: selectedFile.name,
          fileType: selectedFile.type
        }
        
        console.log('🚨 AGGRESSIVE FILENAME DEBUG:')
        console.log('  🔴 selectedFile.name ORIGINAL:', selectedFile.name)
        console.log('  🔴 selectedFile.name TYPE:', typeof selectedFile.name)
        console.log('  🔴 selectedFile.name LENGTH:', selectedFile.name.length)
        console.log('  🔴 requestBody.fileName:', selectedFile.name)
        console.log('🔄 File added to request:', {
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size
        })
      }
      
      const { data, error } = await supabase.functions.invoke('process-delivery-docket', {
        body: requestBody
      })

      console.log('🚨 EDGE FUNCTION RESPONSE FILENAME CHECK:')
      console.log('  🔴 data.results.fileName:', data?.results?.fileName)
      console.log('  🔴 data.results.storedPath:', data?.results?.storedPath)
      console.log('🔄 Edge Function response - data:', data)
      console.log('🔄 Edge Function response - error:', error)

      if (error) {
        console.error('❌ EDGE FUNCTION ERROR:', error)
        console.error('❌ EDGE FUNCTION ERROR Details:', JSON.stringify(error, null, 2))
        
        // Try to get more detailed error information
        if (error.context) {
          console.error('❌ Error context:', error.context)
        }
        
        setErrorMessage(`Edge Function Error: ${error.message || error.name || 'Unknown edge function error'} - Status: ${error.status || 'unknown'}`)
        setWriteStatus('error')
      } else if (data?.success) {
        console.log('✅ EDGE FUNCTION SUCCESS:', data)
        setTestRecord(data.data)
        setWriteStatus('success')
      } else {
        console.error('❌ EDGE FUNCTION FAILED:', data)
        setErrorMessage(`Edge Function Failed: ${data?.error || data?.details || 'Unknown failure'}`)
        setWriteStatus('error')
      }
    } catch (error) {
      console.error('❌ EDGE FUNCTION EXCEPTION:', error)
      setErrorMessage(`Edge Function Exception: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setWriteStatus('error')
    }
  }

  // 3. SIMPLE DATABASE READ TEST
  const testDatabaseRead = async () => {
    if (!user) {
      setErrorMessage('No user authenticated for read test')
      return
    }

    setReadStatus('reading')
    setErrorMessage('')
    
    try {
      // Get LATEST record regardless of user_id for testing (fixes stale data issue)
      const { data, error } = await supabase
        .from('delivery_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('❌ DB READ ERROR:', error)
        setErrorMessage(`Read Error: ${error.message}`)
        setReadStatus('error')
        return
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No records found in database')
        setErrorMessage('No records found - try writing a test record first')
        setReadStatus('error')
        return
      }

      const latestRecord = data[0]
      console.log('✅ DB READ SUCCESS:', latestRecord)
      setTestRecord(latestRecord)
      setReadStatus('success')
    } catch (error) {
      console.error('❌ DB READ EXCEPTION:', error)
      setErrorMessage(`Read Exception: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setReadStatus('error')
    }
  }

  // Clear test data
  const clearTestData = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('delivery_records')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('❌ CLEANUP ERROR:', error)
      } else {
        console.log('✅ TEST DATA CLEARED')
        setTestRecord(null)
        setWriteStatus('idle')
        setReadStatus('idle')
      }
    } catch (error) {
      console.error('❌ CLEANUP EXCEPTION:', error)
    }
  }

  // Check what users exist
  const checkUsers = async () => {
    try {
      // Try to get current session first
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Current session:', session ? 'Active' : 'None')
      
      // Check if there are any existing users we can use
      const response = await fetch('/api/debug-user')
      const userData = await response.json()
      console.log('Available users:', userData)
      
    } catch (error) {
      console.error('Error checking users:', error)
    }
  }

  // Quick sign-in for testing with fallback emails
  const quickSignIn = async () => {
    setSigningIn(true)
    setErrorMessage('')
    
    // Try common test emails in order
    const testCredentials = [
      { email: 'dev@jigr.app', password: 'dev123' },
      { email: 'test@jigr.app', password: 'test123' },
      { email: 'admin@jigr.app', password: 'admin123' },
      { email: 'demo@jigr.app', password: 'demo123' }
    ]
    
    let signInSuccess = false
    
    for (const credentials of testCredentials) {
      try {
        console.log(`🔄 Trying to sign in with: ${credentials.email}`)
        
        const { data, error } = await supabase.auth.signInWithPassword(credentials)
        
        if (!error && data.user) {
          console.log('✅ SIGN-IN SUCCESS:', data.user.email)
          setUser(data.user)
          setErrorMessage('')
          signInSuccess = true
          break
        } else {
          console.log(`❌ Failed with ${credentials.email}:`, error?.message)
        }
      } catch (error) {
        console.log(`❌ Exception with ${credentials.email}:`, error)
      }
    }
    
    if (!signInSuccess) {
      setErrorMessage('All test credentials failed. Need to create a test user or check existing users.')
      // Show debug info
      await checkUsers()
    }
    
    setSigningIn(false)
  }

  // Create test user if none exist
  const createTestUser = async () => {
    setCreating(true)
    setErrorMessage('')
    
    try {
      console.log('🔄 Creating test user: dev@jigr.app')
      
      const { data, error } = await supabase.auth.signUp({
        email: 'dev@jigr.app',
        password: 'devpassword123',
        options: {
          data: {
            full_name: 'Development User'
          }
        }
      })
      
      if (error) {
        console.error('❌ USER CREATION ERROR:', error)
        setErrorMessage(`User Creation Error: ${error.message}`)
      } else {
        console.log('✅ USER CREATION SUCCESS:', data.user?.email)
        if (data.user) {
          setUser(data.user)
          setErrorMessage('✅ Test user created successfully! You can now run database tests.')
        }
      }
    } catch (error) {
      console.error('❌ USER CREATION EXCEPTION:', error)
      setErrorMessage(`User Creation Exception: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    setCreating(false)
  }

  // Reset password for test user
  const resetTestPassword = async () => {
    setResetting(true)
    setErrorMessage('')
    
    try {
      console.log('🔄 Resetting password for: dev@jigr.app')
      
      const { error } = await supabase.auth.resetPasswordForEmail('dev@jigr.app', {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        console.error('❌ PASSWORD RESET ERROR:', error)
        setErrorMessage(`Password Reset Error: ${error.message}`)
      } else {
        console.log('✅ PASSWORD RESET EMAIL SENT')
        setErrorMessage('✅ Password reset email sent to dev@jigr.app. Check your email and set a new password.')
      }
    } catch (error) {
      console.error('❌ PASSWORD RESET EXCEPTION:', error)
      setErrorMessage(`Password Reset Exception: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    setResetting(false)
  }

  // Check table schema
  const checkTableSchema = async () => {
    setCheckingSchema(true)
    
    try {
      // Simple query to get a sample record and see what columns exist
      const { data, error } = await supabase
        .from('delivery_records')
        .select('*')
        .limit(1)

      if (error) {
        console.error('❌ SCHEMA CHECK ERROR:', error)
        setErrorMessage(`Schema Check Error: ${error.message}`)
      } else {
        console.log('✅ SCHEMA CHECK - Sample record:', data)
        if (data && data.length > 0) {
          const columns = Object.keys(data[0])
          console.log('✅ Available columns:', columns)
          setTableSchema(columns)
        } else {
          // Table exists but no records, try to describe table structure
          console.log('✅ Table exists but empty')
          setTableSchema(['id', 'user_id', 'client_id', 'created_at']) // Basic assumption
        }
      }
    } catch (error) {
      console.error('❌ SCHEMA CHECK EXCEPTION:', error)
      setErrorMessage(`Schema Check Exception: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    setCheckingSchema(false)
  }

  if (loading) {
    return (
      <div className={getCardStyle('primary')}>
        <div className="p-6">
          <div className="animate-pulse text-white">Loading authentication test...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={getCardStyle('primary')}>
      <div className="p-6 space-y-6">
        
        {/* Header */}
        <div className="border-b border-white/20 pb-4">
          <h3 className={`${getTextStyle('sectionTitle')} text-white`}>
            🔐 Authentication & Database Test
          </h3>
          <p className="text-white/70 text-sm mt-1">
            Verify auth→database chain without AWS complexity
          </p>
        </div>

        {/* Authentication Status */}
        <div className="space-y-3">
          <h4 className="text-white font-medium">1. Authentication Status</h4>
          <div className="bg-white/10 rounded-lg p-4">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-300 text-sm font-medium">Authenticated</span>
                </div>
                <div className="text-white text-sm">
                  <strong>Email:</strong> {user.email}
                </div>
                <div className="text-white text-sm">
                  <strong>User ID:</strong> {user.id}
                </div>
                <div className="text-white text-sm">
                  <strong>Session:</strong> {user.aud || 'unknown'}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-300 text-sm">Not Authenticated</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={quickSignIn}
                    disabled={signingIn || creating || resetting}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      signingIn || creating || resetting
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {signingIn ? 'Signing in...' : 'Try Sign In'}
                  </button>
                  
                  <button
                    onClick={createTestUser}
                    disabled={signingIn || creating || resetting}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      signingIn || creating || resetting
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {creating ? 'Creating...' : 'Create User'}
                  </button>
                  
                  <button
                    onClick={resetTestPassword}
                    disabled={signingIn || creating || resetting}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      signingIn || creating || resetting
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    {resetting ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Schema Check */}
        <div className="space-y-3">
          <h4 className="text-white font-medium">2. Table Schema Check</h4>
          <div className="flex space-x-3">
            <button
              onClick={checkTableSchema}
              disabled={checkingSchema}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                checkingSchema
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {checkingSchema ? 'Checking...' : 'Check Schema'}
            </button>
            
            {tableSchema.length > 0 && (
              <div className="bg-purple-600/20 text-purple-300 px-3 py-2 rounded-lg text-xs">
                {tableSchema.length} columns found
              </div>
            )}
          </div>
          
          {tableSchema.length > 0 && (
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-white/70 text-xs mb-2">Available Columns:</div>
              <div className="flex flex-wrap gap-1">
                {tableSchema.map((column, index) => (
                  <span key={index} className="bg-purple-600/30 text-purple-200 px-2 py-1 rounded text-xs">
                    {column}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* File Upload Selection */}
        <div className="space-y-3">
          <h4 className="text-white font-medium">3. File Upload (Optional)</h4>
          <div className="bg-white/10 rounded-lg p-4">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                setSelectedFile(file || null)
                console.log('📁 File selected:', file?.name, file?.type, file?.size)
              }}
              className="block w-full text-sm text-white/70
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700
                file:cursor-pointer"
            />
            {selectedFile && (
              <div className="mt-2 text-xs text-white/60">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        </div>

        {/* Database Write Test */}
        <div className="space-y-3">
          <h4 className="text-white font-medium">4. Database Write Test (Edge Function)</h4>
          <div className="flex space-x-3">
            <button
              onClick={testDatabaseWrite}
              disabled={!user || writeStatus === 'writing'}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !user || writeStatus === 'writing'
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : writeStatus === 'success'
                  ? 'bg-green-600 text-green-100'
                  : writeStatus === 'error'
                  ? 'bg-red-600 text-red-100'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {writeStatus === 'writing' ? 'Writing...' : 
               writeStatus === 'success' ? '✅ Write Success' :
               writeStatus === 'error' ? '❌ Write Failed' :
               selectedFile ? 'Test File Upload' : 'Test Write'}
            </button>
            
            <div className={`px-3 py-2 rounded-lg text-xs ${
              writeStatus === 'success' ? 'bg-green-600/20 text-green-300' :
              writeStatus === 'error' ? 'bg-red-600/20 text-red-300' :
              'bg-gray-600/20 text-gray-300'
            }`}>
              Status: {writeStatus}
            </div>
          </div>
        </div>

        {/* Database Read Test */}
        <div className="space-y-3">
          <h4 className="text-white font-medium">4. Database Read Test</h4>
          <div className="flex space-x-3">
            <button
              onClick={testDatabaseRead}
              disabled={!user || readStatus === 'reading'}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !user || readStatus === 'reading'
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : readStatus === 'success'
                  ? 'bg-green-600 text-green-100'
                  : readStatus === 'error'
                  ? 'bg-red-600 text-red-100'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {readStatus === 'reading' ? 'Reading...' : 
               readStatus === 'success' ? '✅ Read Success' :
               readStatus === 'error' ? '❌ Read Failed' :
               'Test Read'}
            </button>
            
            <div className={`px-3 py-2 rounded-lg text-xs ${
              readStatus === 'success' ? 'bg-green-600/20 text-green-300' :
              readStatus === 'error' ? 'bg-red-600/20 text-red-300' :
              'bg-gray-600/20 text-gray-300'
            }`}>
              Status: {readStatus}
            </div>

            <button
              onClick={clearTestData}
              disabled={!testRecord}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:opacity-50 text-white text-xs rounded-lg"
            >
              Clear Test Data
            </button>
          </div>
        </div>

        {/* Test Record Display */}
        {testRecord && (
          <div className="space-y-6">
            <h4 className="text-white font-medium">🎯 Delivery Docket Card - Final Result</h4>
            
            {/* The actual card component with 5 required fields */}
            <DeliveryDocketCard record={testRecord} />
            
            <h4 className="text-white font-medium">🤖 Raw Data (Debug View)</h4>
            <div className="bg-white/10 rounded-lg p-4 space-y-4">
              
              {/* Key Extraction Data */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-300 font-medium">📋 Supplier Name:</span>
                  <div className="text-white font-semibold">{testRecord.supplier_name || 'Not extracted'}</div>
                </div>
                <div>
                  <span className="text-blue-300 font-medium">📅 Delivery Date:</span>
                  <div className="text-white font-semibold">{testRecord.delivery_date || 'Not extracted'}</div>
                </div>
                <div>
                  <span className="text-purple-300 font-medium">📄 Image Path:</span>
                  <div className="text-white font-mono text-xs">{testRecord.image_path || 'No image'}</div>
                </div>
                <div>
                  <span className="text-yellow-300 font-medium">⚡ Processing Status:</span>
                  <div className="text-white">{testRecord.processing_status || 'Unknown'}</div>
                </div>
              </div>

              {/* Full Extracted Text */}
              {testRecord.raw_extracted_text && (
                <div>
                  <span className="text-cyan-300 font-medium">🔍 AWS Textract Full Text:</span>
                  <div className="bg-black/30 rounded-lg p-3 mt-2 max-h-40 overflow-y-auto">
                    <pre className="text-green-200 text-xs whitespace-pre-wrap font-mono">
                      {testRecord.raw_extracted_text}
                    </pre>
                  </div>
                </div>
              )}

              {/* Record Metadata */}
              <div className="border-t border-white/20 pt-3 grid grid-cols-2 gap-4 text-xs text-white/60">
                <div>
                  <span>Record ID:</span>
                  <div className="font-mono">{testRecord.id}</div>
                </div>
                <div>
                  <span>Created:</span>
                  <div>{new Date(testRecord.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {errorMessage && (
          <div className="bg-red-600/20 border border-red-600/40 rounded-lg p-4">
            <div className="text-red-300 text-sm font-medium mb-1">Error Details:</div>
            <div className="text-red-200 text-xs font-mono">{errorMessage}</div>
          </div>
        )}

        {/* Test Instructions */}
        <div className="bg-white/5 rounded-lg p-4 border-t border-white/10">
          <h4 className="text-white/80 text-sm font-medium mb-2">Test Instructions:</h4>
          <ol className="text-white/60 text-xs space-y-1 list-decimal list-inside">
            <li>Verify authentication shows your user details</li>
            <li>Click &quot;Test Write&quot; to create a test record</li>
            <li>Click &quot;Test Read&quot; to retrieve the record</li>
            <li>Confirm data matches what was written</li>
            <li>Use &quot;Clear Test Data&quot; to cleanup</li>
          </ol>
        </div>
      </div>
    </div>
  )
}