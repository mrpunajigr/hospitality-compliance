// Google Cloud Authentication Test Script
// Tests the exact same authentication flow as the Edge Function

import { config } from 'dotenv'
import fs from 'fs'
import crypto from 'crypto'
import fetch from 'node-fetch'

// Load environment variables
config()

async function testGoogleAuth() {
  console.log('🧪 Starting Google Cloud authentication test...')
  
  // Get environment variables
  const GOOGLE_CREDENTIALS = process.env.GOOGLE_CLOUD_CREDENTIALS
  const DOCUMENT_AI_PROCESSOR_ID = process.env.DOCUMENT_AI_PROCESSOR_ID
  
  console.log('📋 Environment check:')
  console.log('  GOOGLE_CREDENTIALS:', GOOGLE_CREDENTIALS ? `✅ Present (${GOOGLE_CREDENTIALS.length} chars)` : '❌ Missing')
  console.log('  DOCUMENT_AI_PROCESSOR_ID:', DOCUMENT_AI_PROCESSOR_ID ? `✅ Present (${DOCUMENT_AI_PROCESSOR_ID})` : '❌ Missing')
  
  if (!GOOGLE_CREDENTIALS || !DOCUMENT_AI_PROCESSOR_ID) {
    console.error('❌ Missing environment variables')
    return false
  }
  
  try {
    // Test 1: Parse credentials
    console.log('🔑 Test 1: Parsing Google credentials...')
    const credentials = JSON.parse(GOOGLE_CREDENTIALS)
    console.log('✅ Credentials parsed successfully')
    console.log('  Client email:', credentials.client_email)
    console.log('  Project ID:', credentials.project_id)
    console.log('  Private key present:', !!credentials.private_key)
    
    // Test 2: Create JWT
    console.log('🔐 Test 2: Creating JWT token...')
    const jwt = await createJWT(credentials)
    console.log('✅ JWT created successfully, length:', jwt.length)
    
    // Test 3: Get access token
    console.log('🎟️ Test 3: Getting access token...')
    const accessToken = await getAccessToken(jwt)
    console.log('✅ Access token obtained, length:', accessToken.length)
    
    // Test 4: Test Document AI API
    console.log('📄 Test 4: Testing Document AI API...')
    
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
      console.error('❌ Document AI API error:', response.status, errorText)
      return false
    }

    const data = await response.json()
    console.log('✅ Document AI API responded successfully')
    console.log('  Document present:', !!data.document)
    console.log('  Text extracted:', data.document?.text ? data.document.text.substring(0, 100) + '...' : 'None')
    
    console.log('🎉 All Google Cloud authentication tests passed!')
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

async function createJWT(credentials) {
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
  
  // Sign with Node.js crypto
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(unsignedToken)
  const signature = sign.sign(credentials.private_key, 'base64')
  const encodedSignature = signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  
  return `${unsignedToken}.${encodedSignature}`
}

async function getAccessToken(jwt) {
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

function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Run the test
testGoogleAuth().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('🚨 Unexpected error:', error)
  process.exit(1)
})