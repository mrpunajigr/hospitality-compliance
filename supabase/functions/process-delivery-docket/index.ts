// Hospitality Compliance SaaS - Enhanced Process Delivery Docket Edge Function
// This function processes uploaded delivery docket images with advanced Google Document AI
// Features: Multi-stage processing, product classification, confidence scoring

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { processDocumentWithEnhancedAI, type DocumentAIExtraction } from './EnhancedDocumentProcessor.ts'

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GOOGLE_CREDENTIALS = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS')!
const DOCUMENT_AI_PROCESSOR_ID = Deno.env.get('GOOGLE_DOCUMENT_AI_PROCESSOR_ID')!

// Initialize Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// =====================================================
// MAIN HANDLER
// =====================================================

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Parse request body
    const { bucketId, fileName, filePath, userId, clientId, test_auth_only } = await req.json()

    // TEST MODE: If test_auth_only is true, run authentication test
    if (test_auth_only === true) {
      console.log('🧪 RUNNING AUTHENTICATION TEST MODE')
      
      try {
        // Test environment variables
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
        
        // Test credentials parsing
        console.log('🔑 Test 1: Parsing Google credentials...')
        const credentials = JSON.parse(GOOGLE_CREDENTIALS)
        console.log('✅ Credentials parsed successfully')
        console.log('  Client email:', credentials.client_email)
        console.log('  Project ID:', credentials.project_id)
        console.log('  Private key present:', !!credentials.private_key)
        
        // Test JWT creation and token exchange
        console.log('🔐 Test 2: Creating JWT and getting access token...')
        const accessToken = await getAccessToken(credentials)
        console.log('✅ Access token obtained, length:', accessToken.length)
        
        // Test Document AI API with minimal request
        console.log('📄 Test 3: Testing Document AI API...')
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
            test: 'authentication_test',
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
          test: 'authentication_test',
          message: 'All Google Cloud authentication tests passed',
          details: {
            credentialsParsed: true,
            jwtCreated: true,
            accessTokenObtained: true,
            documentAiApiWorking: true,
            processorId: DOCUMENT_AI_PROCESSOR_ID,
            clientEmail: credentials.client_email,
            responsePreview: data ? 'Document AI returned valid response' : 'No response data'
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
        
      } catch (error) {
        console.error('🚨 Authentication test failed:', error)
        return new Response(JSON.stringify({
          success: false,
          test: 'authentication_test',
          error: 'Authentication test failed',
          details: {
            message: error.message,
            stack: error.stack
          }
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    // Validate required parameters
    if (!bucketId || !fileName || !filePath || !userId || !clientId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Processing docket: ${fileName} for client: ${clientId}`)

    // Validate user access (now enabled for all modes)
    const hasAccess = await validateUserAccess(userId, clientId)
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'User does not have access to this client' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate file type and size
    const fileValidation = validateFile(fileName)
    if (!fileValidation.valid) {
      return new Response(
        JSON.stringify({ error: fileValidation.error }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Process the document
    console.log('Starting document processing pipeline...')
    const result = await processDeliveryDocket({
      bucketId,
      fileName,
      filePath,
      userId,
      clientId
    })
    
    console.log('Document processing completed successfully')

    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Document processing failed:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

// =====================================================
// PROCESSING PIPELINE
// =====================================================

async function processDeliveryDocket({
  bucketId,
  fileName,
  filePath,
  userId,
  clientId
}: {
  bucketId: string
  fileName: string
  filePath: string
  userId: string
  clientId: string
}) {
  const startTime = Date.now()
  let deliveryRecord: any = null

  try {
    // Step 1: Create initial delivery record
    deliveryRecord = await createDeliveryRecord({
      clientId,
      userId,
      filePath,
      fileName
    })

    if (!deliveryRecord) {
      throw new Error('Failed to create delivery record')
    }

    // Step 2: Download image from Supabase storage
    console.log('Downloading image from storage...')
    const imageBuffer = await downloadImage(bucketId, filePath)

    // Step 3: Process with Enhanced Google Document AI
    console.log('Processing with Enhanced Document AI...')
    let enhancedExtraction: DocumentAIExtraction
    
    try {
      // Get access token for API calls
      const credentials = JSON.parse(GOOGLE_CREDENTIALS)
      const accessToken = await getAccessToken(credentials)
      
      // Process with enhanced multi-stage pipeline
      enhancedExtraction = await processDocumentWithEnhancedAI(
        imageBuffer, 
        DOCUMENT_AI_PROCESSOR_ID, 
        accessToken
      )
      
      console.log('Enhanced OCR processing successful')
      console.log(`Extracted ${enhancedExtraction.lineItems.length} line items`)
      console.log(`Product classification confidence: ${enhancedExtraction.analysis.productClassification.summary.confidence}`)
      console.log(`Line item analysis: ${enhancedExtraction.analysis.lineItemAnalysis.distinctProductCount} distinct products from ${enhancedExtraction.analysis.lineItemAnalysis.totalLineItems} total items`)
      console.log(`Product categories found: ${enhancedExtraction.analysis.productClassification.summary.frozenCount} frozen, ${enhancedExtraction.analysis.productClassification.summary.chilledCount} chilled, ${enhancedExtraction.analysis.productClassification.summary.ambientCount} ambient`)
      
    } catch (ocrError) {
      console.error('Enhanced Google Document AI failed:', ocrError)
      
      // No fallback - let the error propagate
      // This ensures real issues are surfaced and fixed
      throw new Error(`Enhanced OCR processing failed: ${ocrError.message}`)
    }

    // Step 4: Update delivery record with enhanced extraction data
    await updateDeliveryRecord(deliveryRecord.id, {
      rawExtractedText: enhancedExtraction.rawText,
      supplierName: enhancedExtraction.supplier.value,
      docketNumber: enhancedExtraction.invoiceNumber?.value || null,
      deliveryDate: enhancedExtraction.deliveryDate.value,
      temperatures: enhancedExtraction.temperatureData.readings,
      products: enhancedExtraction.lineItems.map(item => item.description),
      processingStatus: 'completed',
      confidenceScore: enhancedExtraction.analysis.overallConfidence,
      // Enhanced fields
      extractedLineItems: enhancedExtraction.lineItems,
      productClassification: enhancedExtraction.analysis.productClassification,
      lineItemAnalysis: enhancedExtraction.analysis.lineItemAnalysis,
      distinctProductCount: enhancedExtraction.analysis.lineItemAnalysis.distinctProductCount,
      confidenceScores: {
        supplier: enhancedExtraction.supplier.confidence,
        deliveryDate: enhancedExtraction.deliveryDate.confidence,
        temperatureData: enhancedExtraction.temperatureData.readings.map(t => t.confidence),
        lineItemAnalysis: enhancedExtraction.analysis.lineItemAnalysis.confidence,
        overall: enhancedExtraction.analysis.overallConfidence
      },
      complianceAnalysis: enhancedExtraction.temperatureData.analysis,
      estimatedValue: enhancedExtraction.analysis.estimatedValue,
      itemCount: enhancedExtraction.analysis.itemCount,
      processingMetadata: enhancedExtraction.processingMetadata
    })

    // Step 6: Track usage for billing
    await trackDocumentUsage(clientId, deliveryRecord.id)

    // Step 5: Create audit log
    await createAuditLog({
      clientId,
      userId,
      action: 'document.processed.enhanced',
      resourceType: 'delivery_record',
      resourceId: deliveryRecord.id,
      details: {
        fileName,
        processingTimeMs: Date.now() - startTime,
        confidenceScore: enhancedExtraction.analysis.overallConfidence,
        temperaturesFound: enhancedExtraction.temperatureData.readings.length,
        lineItemsFound: enhancedExtraction.lineItems.length,
        classificationConfidence: enhancedExtraction.analysis.productClassification.summary.confidence,
        complianceStatus: enhancedExtraction.temperatureData.overallCompliance
      }
    })

    return {
      success: true,
      deliveryRecordId: deliveryRecord.id,
      enhancedExtraction: {
        supplier: enhancedExtraction.supplier,
        deliveryDate: enhancedExtraction.deliveryDate,
        temperatureData: enhancedExtraction.temperatureData,
        lineItems: enhancedExtraction.lineItems,
        productClassification: enhancedExtraction.analysis.productClassification,
        analysis: enhancedExtraction.analysis
      },
      processingTime: Date.now() - startTime
    }

  } catch (error) {
    console.error('Processing pipeline error:', error)
    
    // Update delivery record with error (only if it was created)
    try {
      if (typeof deliveryRecord !== 'undefined' && deliveryRecord?.id) {
        await updateDeliveryRecord(deliveryRecord.id, {
          processingStatus: 'failed',
          errorMessage: error.message
        })
      }
    } catch (updateError) {
      console.error('Failed to update delivery record with error:', updateError)
    }
    
    throw error
  }
}

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

async function validateUserAccess(userId: string, clientId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('client_users')
      .select('id')
      .eq('user_id', userId)
      .eq('client_id', clientId)
      .eq('status', 'active')
      .single()

    return !error && !!data
  } catch (error) {
    console.error('Error validating user access:', error)
    return false
  }
}

function validateFile(fileName: string): { valid: boolean; error?: string } {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.heic', '.heif']
  const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
  
  if (!allowedTypes.includes(fileExtension)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
    }
  }
  
  return { valid: true }
}

// =====================================================
// DOCUMENT AI PROCESSING
// =====================================================

async function downloadImage(bucketId: string, filePath: string): Promise<ArrayBuffer> {
  const { data, error } = await supabase.storage
    .from(bucketId)
    .download(filePath)

  if (error) {
    throw new Error(`Failed to download image: ${error.message}`)
  }

  return await data.arrayBuffer()
}

async function processWithDocumentAI(imageBuffer: ArrayBuffer): Promise<string> {
  try {
    console.log('Starting Google Document AI processing...')
    console.log('Image buffer size:', imageBuffer.byteLength)
    
    // Parse credentials and get access token
    console.log('Parsing Google credentials...')
    const credentials = JSON.parse(GOOGLE_CREDENTIALS)
    console.log('Credentials parsed successfully, client_email:', credentials.client_email)
    
    console.log('Getting access token...')
    const accessToken = await getAccessToken(credentials)
    console.log('Access token obtained, length:', accessToken.length)
    
    // Prepare request
    console.log('Converting image to base64...')
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
    console.log('Base64 conversion complete, length:', base64Image.length)
    
    const requestBody = {
      rawDocument: {
        content: base64Image,
        mimeType: 'image/jpeg'  // Document AI accepts various formats as JPEG
      }
    }

    const apiUrl = `https://documentai.googleapis.com/v1/${DOCUMENT_AI_PROCESSOR_ID}:process`
    console.log('Making Document AI API call to:', apiUrl)

    // Call Document AI API directly with fetch
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
      console.error('Document AI API error response:', errorText)
      throw new Error(`Document AI API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Document AI response received successfully')

    if (!data.document) {
      console.error('No document data in response:', JSON.stringify(data, null, 2))
      throw new Error('No document data returned from Document AI')
    }

    const extractedText = data.document.text || ''
    console.log('Text extracted successfully, length:', extractedText.length)
    console.log('First 200 characters:', extractedText.substring(0, 200))

    return extractedText
    
  } catch (error) {
    console.error('Document AI processing error details:', error)
    console.error('Error stack:', error.stack)
    throw error
  }
}

// Google Cloud authentication using official client approach
async function getAccessToken(credentials: any): Promise<string> {
  try {
    console.log('🔐 Using Google Cloud service account authentication...')
    console.log('📧 Service account:', credentials.client_email)
    
    // Create the JWT assertion using Google's standard format
    const now = Math.floor(Date.now() / 1000)
    const exp = now + 3600 // 1 hour expiration
    
    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: credentials.private_key_id
    }
    
    const payload = {
      iss: credentials.client_email,
      sub: credentials.client_email, // Add subject claim
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: exp,
      scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/documentai'
    }
    
    console.log('🎯 Creating JWT with enhanced payload:', JSON.stringify(payload, null, 2))
    
    // Create JWT with proper Google Cloud format
    const jwt = await createGoogleCloudJWT(header, payload, credentials.private_key)
    console.log('✅ Google Cloud JWT created, length:', jwt.length)
    
    // Exchange for access token
    console.log('🔄 Exchanging JWT for Google Cloud access token...')
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    })
    
    console.log('📊 Token response status:', tokenResponse.status)
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ Token exchange failed:', errorText)
      
      try {
        const errorData = JSON.parse(errorText)
        console.error('📋 Error details:', JSON.stringify(errorData, null, 2))
        
        if (errorData.error === 'invalid_grant') {
          console.error('🔍 JWT header used:', JSON.stringify(header, null, 2))
          console.error('🔍 JWT payload used:', JSON.stringify(payload, null, 2))
          throw new Error(`Google Cloud authentication failed - invalid JWT format or credentials`)
        }
      } catch (parseError) {
        // Not JSON
      }
      
      throw new Error(`Google Cloud token exchange failed: ${tokenResponse.status} - ${errorText}`)
    }
    
    const tokenData = await tokenResponse.json()
    console.log('🎉 Google Cloud access token obtained! Length:', tokenData.access_token.length)
    return tokenData.access_token
    
  } catch (error) {
    console.error('❌ Google Cloud authentication error:', error)
    throw error
  }
}

// Google Cloud compatible JWT creation with proper headers and key handling
async function createGoogleCloudJWT(header: any, payload: any, privateKey: string): Promise<string> {
  try {
    console.log('🔨 Creating Google Cloud JWT with enhanced format...')
    console.log('📋 Using header:', JSON.stringify(header))
    
    // Encode header and payload using the provided header (not duplicate)
    const encodedHeader = base64UrlEncode(JSON.stringify(header))
    const encodedPayload = base64UrlEncode(JSON.stringify(payload))
    const unsignedToken = `${encodedHeader}.${encodedPayload}`
    
    console.log('📦 Payload summary:', JSON.stringify(payload))
    console.log('📝 Unsigned token (first 150 chars):', unsignedToken.substring(0, 150) + '...')
    
    // Import private key with enhanced Google Cloud compatibility
    console.log('🔑 Importing private key for Google Cloud...')
    const keyData = await importPrivateKeyForGoogleCloud(privateKey)
    
    // Sign with Google Cloud optimized algorithm
    console.log('✍️ Signing JWT for Google Cloud...')
    const signature = await signJWTForGoogleCloud(unsignedToken, keyData)
    const encodedSignature = base64UrlEncode(arrayBufferToBase64(signature))
    
    const jwt = `${unsignedToken}.${encodedSignature}`
    console.log('🎉 Google Cloud JWT completed, length:', jwt.length)
    
    return jwt
    
  } catch (error) {
    console.error('JWT creation error:', error)
    throw new Error(`JWT creation failed: ${error.message}`)
  }
}

async function importPrivateKeyForGoogleCloud(privateKey: string): Promise<CryptoKey> {
  try {
    console.log('🔑 Importing Google Cloud private key...')
    
    // Clean the private key more thoroughly
    const pemHeader = '-----BEGIN PRIVATE KEY-----'
    const pemFooter = '-----END PRIVATE KEY-----'
    
    let cleanKey = privateKey.trim()
    
    // Handle escaped newlines (common in environment variables)
    cleanKey = cleanKey.replace(/\\n/g, '\n')
    
    // Ensure proper PEM format
    if (!cleanKey.startsWith(pemHeader)) {
      cleanKey = `${pemHeader}\n${cleanKey}\n${pemFooter}`
    }
    
    // Extract the base64 content
    const pemContents = cleanKey
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s/g, '') // Remove all whitespace including newlines
    
    console.log('🔍 Private key base64 length:', pemContents.length)
    
    // Validate base64 format
    if (!pemContents.match(/^[A-Za-z0-9+/]+=*$/)) {
      throw new Error('Private key contains invalid base64 characters')
    }
    
    // Convert to binary with better error handling
    let binaryDer
    try {
      binaryDer = atob(pemContents)
    } catch (decodeError) {
      console.error('❌ Base64 decode failed:', decodeError)
      throw new Error(`Base64 decode failed: ${decodeError.message}`)
    }
    
    const keyBuffer = new Uint8Array(binaryDer.length)
    for (let i = 0; i < binaryDer.length; i++) {
      keyBuffer[i] = binaryDer.charCodeAt(i)
    }
    
    console.log('🔧 Key buffer created, size:', keyBuffer.length)
    
    // Import the key with RSASSA-PKCS1-v1_5 (standard for JWT RS256)
    const importedKey = await crypto.subtle.importKey(
      'pkcs8',
      keyBuffer.buffer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      },
      false,
      ['sign']
    )
    
    console.log('✅ Private key imported successfully')
    return importedKey
    
  } catch (error) {
    console.error('❌ Private key import failed:', error)
    console.error('🔍 Key preview (first 100 chars):', privateKey.substring(0, 100))
    throw new Error(`Private key import failed: ${error.message}`)
  }
}

async function signJWTForGoogleCloud(message: string, key: CryptoKey): Promise<ArrayBuffer> {
  const messageBuffer = new TextEncoder().encode(message)
  console.log('Signing message of length:', messageBuffer.length)
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    messageBuffer
  )
  
  console.log('Signature created, length:', signature.byteLength)
  return signature
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

// =====================================================
// DATA EXTRACTION
// =====================================================

function extractKeyData(text: string) {
  return {
    supplierName: extractSupplierName(text),
    docketNumber: extractDocketNumber(text),
    deliveryDate: extractDeliveryDate(text),
    temperatures: extractTemperatures(text),
    products: extractProducts(text),
    confidence: calculateConfidence(text)
  }
}

function extractSupplierName(text: string): string | null {
  const patterns = [
    /supplier[:\s]*(.*?)[\n\r]/gi,
    /from[:\s]*(.*?)[\n\r]/gi,
    /delivered by[:\s]*(.*?)[\n\r]/gi,
    /company[:\s]*(.*?)[\n\r]/gi,
    // Pattern to match "Fresh Produce Co." style names (company name followed by Co., Ltd., Inc., etc.)
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Co\.|Ltd\.|Inc\.|Corporation|Company))/gi,
    // Pattern to match company names in second line after "DELIVERY DOCKET"
    /DELIVERY DOCKET\s*[\n\r]\s*(.*?)[\n\r]/gi
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const supplier = match[1].trim()
      if (supplier && supplier.length > 2) {
        return supplier
      }
    }
  }
  
  return null
}

function extractDocketNumber(text: string): string | null {
  const patterns = [
    /docket[:\s#]*([A-Z0-9\-]+)/gi,
    /invoice[:\s#]*([A-Z0-9\-]+)/gi,
    /ref[:\s#]*([A-Z0-9\-]+)/gi
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  return null
}

function extractDeliveryDate(text: string): string | null {
  const patterns = [
    /(\d{1,2}\/\d{1,2}\/\d{4})/g,
    /(\d{4}-\d{2}-\d{2})/g,
    /(\d{1,2}-\d{1,2}-\d{4})/g
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      // Convert to ISO date string
      try {
        const date = new Date(match[1])
        return date.toISOString()
      } catch (error) {
        continue
      }
    }
  }
  
  return null
}

function extractTemperatures(text: string) {
  const tempPatterns = [
    /temp[eratur]*[:\s]*(-?\d+\.?\d*)[°]?[cf]/gi,
    /(-?\d+\.?\d*)[°][cf]/gi,
    /temperature[:\s]*(-?\d+\.?\d*)/gi
  ]
  
  const temperatures = []
  
  for (const pattern of tempPatterns) {
    const matches = Array.from(text.matchAll(pattern))
    
    for (const match of matches) {
      const tempValue = parseFloat(match[1] || match[0])
      if (!isNaN(tempValue)) {
        temperatures.push({
          value: tempValue,
          unit: detectUnit(match[0]),
          context: getContext(text, match.index || 0)
        })
      }
    }
  }
  
  // Remove duplicates
  return temperatures.filter((temp, index, self) => 
    index === self.findIndex(t => Math.abs(t.value - temp.value) < 0.1)
  )
}

function extractProducts(text: string): string[] {
  const productKeywords = [
    'milk', 'dairy', 'cheese', 'butter', 'cream',
    'meat', 'beef', 'chicken', 'pork', 'lamb',
    'fish', 'seafood', 'salmon', 'tuna',
    'vegetables', 'lettuce', 'tomato', 'onion',
    'bread', 'flour', 'pasta',
    'frozen', 'ice cream'
  ]
  
  const foundProducts = []
  const lowerText = text.toLowerCase()
  
  for (const product of productKeywords) {
    if (lowerText.includes(product)) {
      foundProducts.push(product)
    }
  }
  
  return foundProducts
}

function detectUnit(tempText: string): 'C' | 'F' {
  if (tempText.toLowerCase().includes('f')) {
    return 'F'
  }
  return 'C' // Default to Celsius for NZ
}

function getContext(text: string, position: number): string {
  const start = Math.max(0, position - 50)
  const end = Math.min(text.length, position + 50)
  return text.substring(start, end).trim()
}

function calculateConfidence(text: string): number {
  // Simple confidence scoring based on text quality
  let score = 0.5 // Base score
  
  if (text.length > 100) score += 0.2
  if (text.includes('temperature') || text.includes('temp')) score += 0.1
  if (text.match(/\d+[°][cf]/gi)) score += 0.2
  
  return Math.min(1.0, score)
}

// =====================================================
// DATABASE OPERATIONS
// =====================================================

async function createDeliveryRecord({ clientId, userId, filePath, fileName }) {
  const deliveryRecordId = crypto.randomUUID()
  
  try {
    const { data, error } = await supabase
      .from('delivery_records')
      .insert({
        id: deliveryRecordId,
        client_id: clientId,
        user_id: userId, // Now properly including user_id
        image_path: filePath,
        processing_status: 'processing',
        // Initial values - will be updated with real OCR data
        supplier_name: null,
        docket_number: null,
        delivery_date: null,
        confidence_score: null,
        raw_extracted_text: null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating delivery record:', error)
      throw new Error(`Database insert failed: ${error.message}`)
    }

    console.log(`Delivery record created successfully: ${data.id}`)
    return data
    
  } catch (dbError) {
    console.error('Database operation failed:', dbError)
    throw dbError // No more mock fallbacks - surface real issues
  }
}

async function updateDeliveryRecord(id: string, updates: any) {
  try {
    const { error } = await supabase
      .from('delivery_records')
      .update({
        raw_extracted_text: updates.rawExtractedText,
        supplier_name: updates.supplierName,
        docket_number: updates.docketNumber,
        delivery_date: updates.deliveryDate,
        extracted_temperatures: updates.temperatures,
        products: updates.products,
        processing_status: updates.processingStatus,
        confidence_score: updates.confidenceScore,
        error_message: updates.errorMessage,
        // Enhanced fields (will be added to database schema)
        extracted_line_items: updates.extractedLineItems,
        product_classification: updates.productClassification,
        confidence_scores: updates.confidenceScores,
        compliance_analysis: updates.complianceAnalysis,
        estimated_value: updates.estimatedValue,
        item_count: updates.itemCount,
        processing_metadata: updates.processingMetadata
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating delivery record:', error)
      // Don't throw error for new fields that might not exist yet
      if (!error.message.includes('column') && !error.message.includes('does not exist')) {
        throw error
      }
    } else {
      console.log('Delivery record updated successfully:', id)
    }
  } catch (error) {
    console.error('Update delivery record failed:', error)
  }
}

// Compliance logic moved to Phase 2 - keeping OCR focused on data extraction only

async function trackDocumentUsage(clientId: string, deliveryRecordId: string) {
  try {
    const billingPeriod = new Date().toISOString().substring(0, 7) // YYYY-MM format

    const { error } = await supabase
      .from('document_usage')
      .insert({
        id: crypto.randomUUID(),
        client_id: clientId,
        delivery_record_id: deliveryRecordId,
        billing_period: billingPeriod
      })

    if (error) {
      console.error('Error tracking document usage:', error)
    } else {
      console.log('Document usage tracked successfully')
    }
  } catch (error) {
    console.error('Document usage tracking failed:', error)
  }
}

async function createAuditLog(log: any) {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        client_id: log.clientId,
        user_id: log.userId,
        action: log.action,
        resource_type: log.resourceType,
        resource_id: log.resourceId,
        details: log.details
      })

    if (error) {
      console.error('Error creating audit log:', error)
      // Don't throw - audit logs are non-critical
    } else {
      console.log('Audit log created successfully:', log.action)
    }
  } catch (error) {
    console.error('Audit log creation failed:', error)
    // Don't throw - audit logs are non-critical
  }
}