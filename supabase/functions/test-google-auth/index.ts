// Google Cloud Authentication Test Function
// Tests Google Document AI authentication to diagnose the exact issue

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    console.log('🧪 Starting Google Cloud authentication test...')
    
    // Get environment variables
    const GOOGLE_CREDENTIALS = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS')
    const DOCUMENT_AI_PROCESSOR_ID = Deno.env.get('GOOGLE_DOCUMENT_AI_PROCESSOR_ID')
    
    console.log('📋 Environment check:')
    console.log('  GOOGLE_CREDENTIALS:', GOOGLE_CREDENTIALS ? `✅ Present (${GOOGLE_CREDENTIALS.length} chars)` : '❌ Missing')
    console.log('  DOCUMENT_AI_PROCESSOR_ID:', DOCUMENT_AI_PROCESSOR_ID ? `✅ Present (${DOCUMENT_AI_PROCESSOR_ID})` : '❌ Missing')
    
    if (!GOOGLE_CREDENTIALS || !DOCUMENT_AI_PROCESSOR_ID) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing environment variables',
        details: {
          hasCredentials: !!GOOGLE_CREDENTIALS,
          hasProcessorId: !!DOCUMENT_AI_PROCESSOR_ID
        }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Test 1: Parse credentials
    console.log('🔑 Test 1: Parsing Google credentials...')
    let credentials
    try {
      credentials = JSON.parse(GOOGLE_CREDENTIALS)
      console.log('✅ Credentials parsed successfully')
      console.log('  Client email:', credentials.client_email)
      console.log('  Project ID:', credentials.project_id)
      console.log('  Private key present:', !!credentials.private_key)
    } catch (error) {
      console.error('❌ Failed to parse credentials:', error)
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON in GOOGLE_CLOUD_CREDENTIALS',
        details: error.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Test 2: Create JWT
    console.log('🔐 Test 2: Creating JWT token...')
    let jwt
    try {
      jwt = await createJWT(credentials)
      console.log('✅ JWT created successfully, length:', jwt.length)
    } catch (error) {
      console.error('❌ JWT creation failed:', error)
      return new Response(JSON.stringify({
        success: false,
        error: 'JWT creation failed',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Test 3: Get access token
    console.log('🎟️ Test 3: Getting access token...')
    let accessToken
    try {
      accessToken = await getAccessToken(jwt)
      console.log('✅ Access token obtained, length:', accessToken.length)
    } catch (error) {
      console.error('❌ Access token failed:', error)
      return new Response(JSON.stringify({
        success: false,
        error: 'Access token failed',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Test 4: Test Document AI API
    console.log('📄 Test 4: Testing Document AI API...')
    try {
      // Create a simple test image (1x1 pixel white PNG in base64)
      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      
      const requestBody = {
        rawDocument: {
          content: testImageBase64,
          mimeType: 'image/png'
        }
      }

      const apiUrl = `https://documentai.googleapis.com/v1/${DOCUMENT_AI_PROCESSOR_ID}:process`
      console.log('Making request to:', apiUrl)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('Document AI API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Document AI API error:', errorText)
        return new Response(JSON.stringify({
          success: false,
          error: 'Document AI API error',
          details: {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          }
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const data = await response.json()
      console.log('✅ Document AI API responded successfully')
      
      return new Response(JSON.stringify({
        success: true,
        message: 'All Google Cloud authentication tests passed',
        details: {
          credentialsParsed: true,
          jwtCreated: true,
          accessTokenObtained: true,
          documentAiApiWorking: true,
          processorId: DOCUMENT_AI_PROCESSOR_ID,
          clientEmail: credentials.client_email
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
      
    } catch (error) {
      console.error('❌ Document AI API test failed:', error)
      return new Response(JSON.stringify({
        success: false,
        error: 'Document AI API test failed',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
  } catch (error) {
    console.error('🚨 Authentication test failed:', error)
    return new Response(JSON.stringify({
      success: false,
      error: 'Authentication test failed',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

async function createJWT(credentials: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 3600 // 1 hour expiration
  
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: exp
  }
  
  const header = { alg: 'RS256', typ: 'JWT' }
  
  // Encode header and payload
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const unsignedToken = `${encodedHeader}.${encodedPayload}`
  
  // Sign the token
  const keyData = await importPrivateKey(credentials.private_key)
  const signature = await signMessage(unsignedToken, keyData)
  const encodedSignature = base64UrlEncode(arrayBufferToBase64(signature))
  
  return `${unsignedToken}.${encodedSignature}`
}

async function getAccessToken(jwt: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Token exchange failed: ${response.status} - ${errorText}`)
  }
  
  const tokenData = await response.json()
  return tokenData.access_token
}

async function importPrivateKey(privateKey: string): Promise<CryptoKey> {
  const pemHeader = '-----BEGIN PRIVATE KEY-----'
  const pemFooter = '-----END PRIVATE KEY-----'
  
  let cleanKey = privateKey.trim()
  if (!cleanKey.startsWith(pemHeader)) {
    cleanKey = `${pemHeader}\n${cleanKey}\n${pemFooter}`
  }
  
  const pemContents = cleanKey
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\s/g, '')
  
  const binaryDer = atob(pemContents)
  const keyBuffer = new Uint8Array(binaryDer.length)
  for (let i = 0; i < binaryDer.length; i++) {
    keyBuffer[i] = binaryDer.charCodeAt(i)
  }
  
  return await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer.buffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  )
}

async function signMessage(message: string, key: CryptoKey): Promise<ArrayBuffer> {
  const messageBuffer = new TextEncoder().encode(message)
  return await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, messageBuffer)
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}