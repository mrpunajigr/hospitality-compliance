import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('🚀 AUTH-TEST v33 [GOOGLE CLOUD ONLY]: Foundation Test - ', new Date().toISOString())
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const body = await req.json()
    const { testMessage, fileData, fileName, fileType } = body

    console.log('📋 REQUEST RECEIVED:')
    console.log('  Test message:', testMessage || 'None')
    console.log('  File provided:', !!fileData)
    console.log('🔍 FILENAME DEBUGGING:')
    console.log('  🔵 ORIGINAL fileName from request:', fileName || 'None')
    console.log('  🔵 fileName type:', typeof fileName)
    console.log('  🔵 fileName length:', fileName ? fileName.length : 0)
    console.log('  File type:', fileType || 'None')

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Store file in Supabase Storage if provided
    let storedPath = null
    if (fileData && fileName) {
      try {
        console.log('💾 STORING FILE IN SUPABASE STORAGE...')
        console.log('🟡 PROCESSING fileName for storage:', fileName)
        const timestamp = Date.now()
        const storageFileName = `${timestamp}_${fileName}` // Add timestamp prefix to prevent conflicts
        const storagePath = `test-uploads/${storageFileName}`
        console.log('🟡 GENERATED storageFileName:', storageFileName)
        console.log('🟡 STORAGE PATH CREATED:', storagePath)
        
        const imageBuffer = Uint8Array.from(atob(fileData), c => c.charCodeAt(0))
        console.log('🟡 IMAGE BUFFER SIZE:', imageBuffer.length)
        
        console.log('🔥 BEFORE SUPABASE STORAGE CALL:')
        console.log('  🔥 storagePath input:', storagePath)
        console.log('  🔥 fileName input:', fileName)
        console.log('  🔥 storageFileName:', storageFileName)
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('delivery-dockets')
          .upload(storagePath, imageBuffer, {
            contentType: fileType || 'image/jpeg',
            upsert: true
          })
          
        console.log('🔥 AFTER SUPABASE STORAGE CALL:')
        console.log('  🔥 uploadData:', JSON.stringify(uploadData, null, 2))

        if (uploadError) {
          console.error('❌ Storage upload failed:', uploadError)
          storedPath = `storage-error: ${uploadError.message}`
        } else {
          console.log('✅ STORAGE SUCCESS!')
          console.log('🟢 STORED uploadData.path:', uploadData.path)
          console.log('🟢 STORED uploadData.id:', uploadData.id)
          console.log('🟢 STORED uploadData full:', JSON.stringify(uploadData))
          storedPath = uploadData.path
          console.log('🟢 FINAL storedPath value:', storedPath)
        }
      } catch (fileError) {
        console.error('❌ File processing failed:', fileError)
        storedPath = `processing-failed: ${fileError instanceof Error ? fileError.message : 'Unknown'}`
      }
    }

    // Google Cloud Document AI processing
    let extractedText = testMessage || 'No file provided'
    let supplierName = 'TEST_DEFAULT'
    
    if (fileData && fileName) {
      try {
        console.log('🤖 Starting Google Cloud Document AI processing...')
        
        // Get Google Cloud credentials
        const GOOGLE_CREDENTIALS = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS')
        const PROCESSOR_ID = Deno.env.get('GOOGLE_DOCUMENT_AI_PROCESSOR_ID')
        
        console.log('📋 Google Cloud Configuration:')
        console.log('  Credentials:', GOOGLE_CREDENTIALS ? 'Present' : 'Missing')
        console.log('  Processor ID:', PROCESSOR_ID || 'Missing')
        
        if (!GOOGLE_CREDENTIALS || !PROCESSOR_ID) {
          throw new Error('Missing Google Cloud credentials or processor ID')
        }
        
        // Parse credentials and create access token
        const credentials = JSON.parse(GOOGLE_CREDENTIALS)
        console.log('📋 Credentials parsed for:', credentials.client_email)
        
        const jwt = await createJWT(credentials)
        const accessToken = await getAccessToken(jwt)
        console.log('✅ Access token obtained')
        
        // Prepare Document AI request
        const requestBody = {
          rawDocument: {
            content: fileData,
            mimeType: fileType || 'image/jpeg'
          }
        }
        
        console.log('📋 DOCUMENT AI REQUEST DETAILS:')
        console.log('  Content length:', fileData.length)
        console.log('  MIME type:', fileType || 'image/jpeg')
        console.log('  Processor ID:', PROCESSOR_ID)
        console.log('  Request body size:', JSON.stringify(requestBody).length)
        
        const apiUrl = `https://documentai.googleapis.com/v1/${PROCESSOR_ID}:process`
        console.log('📄 Making Document AI request to:', apiUrl)
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Document AI API error: ${response.status} - ${errorText}`)
        }
        
        const data = await response.json()
        console.log('✅ Google Cloud Document AI API Response Status:', response.status)
        
        // DETAILED GOOGLE CLOUD RESPONSE LOGGING
        console.log('🔍 FULL GOOGLE CLOUD RESPONSE:')
        console.log(JSON.stringify(data, null, 2))
        
        // Check document structure
        console.log('🔍 RESPONSE STRUCTURE ANALYSIS:')
        console.log('  data.document exists:', !!data.document)
        console.log('  data.document.text exists:', !!(data.document && data.document.text))
        console.log('  data.document.pages exists:', !!(data.document && data.document.pages))
        console.log('  data.document.entities exists:', !!(data.document && data.document.entities))
        
        // Extract text from response
        if (data.document && data.document.text) {
          extractedText = data.document.text
          console.log('📄 ✅ TEXT EXTRACTION SUCCESS!')
          console.log('📄 TOTAL EXTRACTED TEXT LENGTH:', extractedText.length)
          console.log('📄 COMPLETE EXTRACTED TEXT:')
          console.log('=' + '='.repeat(50))
          console.log(extractedText)
          console.log('=' + '='.repeat(50))
          
          // Parse lines for analysis
          const lines = extractedText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
          console.log('📄 PARSED LINES COUNT:', lines.length)
          console.log('📄 ALL EXTRACTED LINES:')
          lines.forEach((line, index) => {
            console.log(`  Line ${index + 1}: "${line}"`)
          })
          
          // Enhanced supplier name extraction with detailed logging
          console.log('🔍 SUPPLIER NAME DETECTION:')
          for (const line of lines.slice(0, 15)) {
            console.log(`  Checking line: "${line}"`)
            if (line.toLowerCase().includes('gilmour')) {
              supplierName = 'Gilmours Food Service'
              console.log('✅ FOUND GILMOURS MATCH in line:', line)
              break
            } else if (line.toLowerCase().includes('foodstuffs')) {
              supplierName = 'Foodstuffs'
              console.log('✅ FOUND FOODSTUFFS MATCH in line:', line)
              break
            } else if (line.toLowerCase().includes('sysco')) {
              supplierName = 'Sysco'
              console.log('✅ FOUND SYSCO MATCH in line:', line)
              break
            } else if (line.length > 5 && line.length < 50 && /^[A-Z]/.test(line)) {
              supplierName = line
              console.log('✅ POTENTIAL SUPPLIER NAME from format:', line)
              break
            }
          }
        } else {
          extractedText = 'No text extracted from document'
          supplierName = 'Extraction Failed'
          console.log('❌ TEXT EXTRACTION FAILED!')
          console.log('❌ GOOGLE CLOUD FULL RESPONSE STRUCTURE:')
          console.log(JSON.stringify(data, null, 2))
          
          // Check if there are alternative text fields
          if (data.document) {
            console.log('🔍 CHECKING ALTERNATIVE TEXT FIELDS:')
            console.log('  document.pages:', data.document.pages ? `${data.document.pages.length} pages` : 'none')
            if (data.document.pages && data.document.pages[0]) {
              console.log('  page[0].blocks:', data.document.pages[0].blocks ? `${data.document.pages[0].blocks.length} blocks` : 'none')
              console.log('  page[0].paragraphs:', data.document.pages[0].paragraphs ? `${data.document.pages[0].paragraphs.length} paragraphs` : 'none')
            }
          }
        }
        
      } catch (googleError) {
        console.log('⚠️ Google Cloud Document AI failed:', googleError)
        extractedText = `Google Cloud processing failed: ${googleError}\n\nFallback: Document uploaded ${new Date().toISOString()}\nFilename: ${fileName}`
        supplierName = fileName.toLowerCase().includes('gilmour') ? 'Gilmours Food Service' : 'Unknown Supplier'
      }
    }

    // Create database record
    console.log('💾 Creating database record...')
    let dbError = null
    let recordId = null

    try {
      // Get user info from request headers or use test user
      const authHeader = req.headers.get('authorization')
      const jwt = authHeader?.replace('Bearer ', '')
      
      // For testing, we'll create records that can be found by the component
      const { data: insertData, error: insertError } = await supabase
        .from('delivery_records')
        .insert({
          client_id: 'b13e93dd-e981-4d43-97e6-26b7713fb90c', // JiGR apps client ID  
          user_id: '2815053e-c7bc-407f-9bf8-fbab2e744f25', // Test user ID from screenshot
          supplier_name: supplierName,
          delivery_date: new Date().toISOString(),
          image_path: storedPath,
          raw_extracted_text: extractedText,
          processing_status: 'completed'
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('❌ Database insert failed:', insertError)
        dbError = insertError
      } else {
        console.log('✅ Database record created with ID:', insertData.id)
        recordId = insertData.id
      }
    } catch (error) {
      console.error('❌ Database operation failed:', error)
      dbError = error
    }

    // Return comprehensive response
    const response = {
      success: true,
      message: 'Foundation test completed with Google Cloud processing',
      results: {
        fileProcessed: !!fileData,
        fileName: fileName || null,
        storedPath: storedPath,
        supplier: supplierName,
        extractedText: extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : ''),
        fullTextLength: extractedText.length,
        processingMethod: extractedText.includes('Google Cloud processing failed') ? 'fallback' : 'google-cloud'
      },
      databaseRecord: recordId ? {
        id: recordId,
        supplier: supplierName,
        extractedText: extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : ''),
        fullTextLength: extractedText.length,
        processingMethod: extractedText.includes('Google Cloud processing failed') ? 'fallback' : 'google-cloud'
      } : null,
      databaseError: dbError ? dbError.message : null,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (criticalError) {
    console.error('❌ CRITICAL ERROR:', criticalError)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Critical error in foundation test',
        details: criticalError instanceof Error ? criticalError.message : String(criticalError),
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Google Cloud helper functions
async function createJWT(credentials: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 3600
  
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: exp
  }
  
  const header = { alg: 'RS256', typ: 'JWT' }
  
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const unsignedToken = `${encodedHeader}.${encodedPayload}`
  
  const keyData = await importPrivateKey(credentials.private_key)
  const signature = await signMessage(unsignedToken, keyData)
  const encodedSignature = base64UrlEncode(arrayBufferToBase64(signature))
  
  return `${unsignedToken}.${encodedSignature}`
}

async function getAccessToken(jwt: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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