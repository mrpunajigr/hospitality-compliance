// Hospitality Compliance SaaS - Process Delivery Docket Edge Function
// This function processes uploaded delivery docket images with Google Document AI

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleAuth } from 'https://esm.sh/google-auth-library@8'

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GOOGLE_CREDENTIALS = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS')!
const DOCUMENT_AI_PROCESSOR_ID = Deno.env.get('DOCUMENT_AI_PROCESSOR_ID')!

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
    const { bucketId, fileName, filePath, userId, clientId } = await req.json()

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

    // Validate user has access to client
    const hasAccess = await validateUserAccess(userId, clientId)
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to client' }),
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
    const result = await processDeliveryDocket({
      bucketId,
      fileName,
      filePath,
      userId,
      clientId
    })

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

  try {
    // Step 1: Create initial delivery record
    const deliveryRecord = await createDeliveryRecord({
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

    // Step 3: Process with Google Document AI
    console.log('Processing with Document AI...')
    const extractedText = await processWithDocumentAI(imageBuffer)

    // Step 4: Extract key data from text
    console.log('Extracting key data...')
    const extractedData = extractKeyData(extractedText)

    // Step 5: Update delivery record with extracted data
    await updateDeliveryRecord(deliveryRecord.id, {
      rawExtractedText: extractedText,
      supplierName: extractedData.supplierName,
      docketNumber: extractedData.docketNumber,
      deliveryDate: extractedData.deliveryDate,
      products: extractedData.products,
      processingStatus: 'completed',
      confidenceScore: extractedData.confidence
    })

    // Step 6: Process temperature readings
    if (extractedData.temperatures.length > 0) {
      await processTemperatureReadings(deliveryRecord.id, extractedData.temperatures)
    }

    // Step 7: Check for compliance violations
    const violations = await checkCompliance(deliveryRecord.id, clientId, extractedData.temperatures)

    // Step 8: Create alerts for violations
    if (violations.length > 0) {
      await createComplianceAlerts(deliveryRecord.id, clientId, violations, extractedData.supplierName)
    }

    // Step 9: Track usage for billing
    await trackDocumentUsage(clientId, deliveryRecord.id)

    // Step 10: Create audit log
    await createAuditLog({
      clientId,
      userId,
      action: 'document.processed',
      resourceType: 'delivery_record',
      resourceId: deliveryRecord.id,
      details: {
        fileName,
        processingTimeMs: Date.now() - startTime,
        confidenceScore: extractedData.confidence,
        temperaturesFound: extractedData.temperatures.length,
        violationsDetected: violations.length
      }
    })

    return {
      success: true,
      deliveryRecordId: deliveryRecord.id,
      extractedData,
      alertsGenerated: violations.length,
      processingTime: Date.now() - startTime
    }

  } catch (error) {
    console.error('Processing pipeline error:', error)
    
    // Update delivery record with error
    if (deliveryRecord) {
      await updateDeliveryRecord(deliveryRecord.id, {
        processingStatus: 'failed',
        errorMessage: error.message
      })
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
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf']
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
    // Initialize Google Auth
    const credentials = JSON.parse(GOOGLE_CREDENTIALS)
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    })

    const client = await auth.getClient()
    
    // Prepare request
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
    
    const requestBody = {
      rawDocument: {
        content: base64Image,
        mimeType: 'image/jpeg'
      }
    }

    // Call Document AI API
    const response = await client.request({
      url: `https://documentai.googleapis.com/v1/${DOCUMENT_AI_PROCESSOR_ID}:process`,
      method: 'POST',
      data: requestBody
    })

    if (!response.data || !response.data.document) {
      throw new Error('No document data returned from Document AI')
    }

    return response.data.document.text || ''
    
  } catch (error) {
    console.error('Document AI processing error:', error)
    throw new Error(`Document AI processing failed: ${error.message}`)
  }
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
    /company[:\s]*(.*?)[\n\r]/gi
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
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
  const { data, error } = await supabase
    .from('delivery_records')
    .insert({
      client_id: clientId,
      user_id: userId,
      image_path: filePath,
      processing_status: 'processing'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating delivery record:', error)
    return null
  }

  return data
}

async function updateDeliveryRecord(id: string, updates: any) {
  const { error } = await supabase
    .from('delivery_records')
    .update({
      raw_extracted_text: updates.rawExtractedText,
      supplier_name: updates.supplierName,
      docket_number: updates.docketNumber,
      delivery_date: updates.deliveryDate,
      products: updates.products,
      processing_status: updates.processingStatus,
      confidence_score: updates.confidenceScore,
      error_message: updates.errorMessage
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating delivery record:', error)
  }
}

async function processTemperatureReadings(deliveryRecordId: string, temperatures: any[]) {
  const readings = temperatures.map(temp => ({
    delivery_record_id: deliveryRecordId,
    temperature_value: temp.value,
    temperature_unit: temp.unit,
    context: temp.context
  }))

  const { error } = await supabase
    .from('temperature_readings')
    .insert(readings)

  if (error) {
    console.error('Error inserting temperature readings:', error)
  }
}

async function checkCompliance(deliveryRecordId: string, clientId: string, temperatures: any[]) {
  // Get client compliance rules
  const { data: settings } = await supabase
    .from('compliance_settings')
    .select('rules')
    .eq('client_id', clientId)
    .single()

  const rules = settings?.rules || {
    temperature_violations: {
      chilled_max: 4,
      frozen_min: -18,
      ambient_max: 25
    }
  }

  const violations = []

  for (const temp of temperatures) {
    let violation = null
    
    // Check chilled products
    if (temp.value > rules.temperature_violations.chilled_max && temp.value < 10) {
      violation = {
        type: 'temperature_violation',
        severity: temp.value > 7 ? 'critical' : 'warning',
        temperature: temp.value,
        threshold: rules.temperature_violations.chilled_max,
        message: `Temperature ${temp.value}°C exceeds safe limit for chilled products (${rules.temperature_violations.chilled_max}°C)`
      }
    }
    
    // Check frozen products
    else if (temp.value > rules.temperature_violations.frozen_min && temp.value < -5) {
      violation = {
        type: 'temperature_violation',
        severity: temp.value > -15 ? 'critical' : 'warning',
        temperature: temp.value,
        threshold: rules.temperature_violations.frozen_min,
        message: `Temperature ${temp.value}°C too high for frozen products (max: ${rules.temperature_violations.frozen_min}°C)`
      }
    }
    
    if (violation) {
      violations.push(violation)
    }
  }

  return violations
}

async function createComplianceAlerts(deliveryRecordId: string, clientId: string, violations: any[], supplierName: string | null) {
  const alerts = violations.map(violation => ({
    delivery_record_id: deliveryRecordId,
    client_id: clientId,
    alert_type: violation.type,
    severity: violation.severity,
    temperature_value: violation.temperature,
    supplier_name: supplierName,
    message: violation.message,
    requires_acknowledgment: violation.severity === 'critical'
  }))

  const { error } = await supabase
    .from('compliance_alerts')
    .insert(alerts)

  if (error) {
    console.error('Error creating compliance alerts:', error)
  }
}

async function trackDocumentUsage(clientId: string, deliveryRecordId: string) {
  const billingPeriod = new Date().toISOString().substring(0, 7) // YYYY-MM format

  const { error } = await supabase
    .from('document_usage')
    .insert({
      client_id: clientId,
      delivery_record_id: deliveryRecordId,
      billing_period: billingPeriod
    })

  if (error) {
    console.error('Error tracking document usage:', error)
  }
}

async function createAuditLog(log: any) {
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
  }
}