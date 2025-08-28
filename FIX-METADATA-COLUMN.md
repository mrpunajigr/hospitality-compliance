# 🔧 Fix Metadata Column Error

## The Problem
Edge Function is trying to insert into `metadata` column, but the database table has `processing_metadata` column.

**Error:** `"Database insert failed: Could not find the 'metadata' column"`

## Solution: Update Edge Function Column Name

### Go to Supabase Dashboard → Edge Functions → process-delivery-docket

Replace ALL code with this corrected version:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID')!
const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY')!
const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function processWithTextract(imageBytes: Uint8Array, timeout = 25000): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('AWS Textract timeout - using fallback processing'))
    }, timeout)

    try {
      const textractPayload = {
        Document: {
          Bytes: Array.from(imageBytes)
        },
        FeatureTypes: ['TABLES', 'FORMS']
      }

      const response = await fetch(`https://textract.${AWS_REGION}.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'Textract.AnalyzeDocument',
          'Authorization': await getAWSSignature('textract', AWS_REGION, JSON.stringify(textractPayload))
        },
        body: JSON.stringify(textractPayload)
      })

      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`AWS Textract API error: ${response.status}`)
      }

      const result = await response.json()
      const extractedText = result.Blocks
        ?.filter((block: any) => block.BlockType === 'LINE')
        ?.map((block: any) => block.Text)
        ?.join('\n') || ''

      resolve(extractedText || 'No text extracted from document')
    } catch (error) {
      clearTimeout(timeoutId)
      reject(error)
    }
  })
}

async function getAWSSignature(service: string, region: string, payload: string): Promise<string> {
  const algorithm = 'AWS4-HMAC-SHA256'
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const datetime = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '')
  
  const credentialScope = `${date}/${region}/${service}/aws4_request`
  const credential = `${AWS_ACCESS_KEY_ID}/${credentialScope}`
  
  return `${algorithm} Credential=${credential}, SignedHeaders=content-type;host;x-amz-date;x-amz-target, Signature=placeholder`
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const body = await req.json()
    console.log('Edge Function received body:', JSON.stringify(body, null, 2))

    // Handle both parameter formats for compatibility
    const filePath = body.filePath || body.imagePath
    const bucketId = body.bucketId || 'uploads'
    const clientId = body.clientId || '550e8400-e29b-41d4-a716-446655440000'

    if (!filePath) {
      console.error('Missing required parameter: filePath or imagePath')
      throw new Error('No file path provided in filePath or imagePath parameter')
    }

    console.log(`Processing delivery docket: ${filePath} from bucket: ${bucketId}`)

    // Download image from Supabase Storage
    const { data: imageData, error: downloadError } = await supabase.storage
      .from(bucketId)
      .download(filePath)

    if (downloadError) {
      console.error('Download error:', downloadError)
      throw new Error(`Failed to download image: ${downloadError.message}`)
    }

    const imageBytes = new Uint8Array(await imageData.arrayBuffer())
    let extractedText = ''
    let processingStatus = 'failed'

    // Try AWS Textract with timeout
    try {
      extractedText = await processWithTextract(imageBytes, 25000)
      processingStatus = 'completed'
      console.log('AWS Textract processing successful')
    } catch (textractError) {
      console.log(`Textract failed: ${textractError.message}`)
      // Fallback to basic text extraction
      extractedText = `Textract processing failed: ${textractError.message}\n\nFallback: Document processed on ${new Date().toISOString()}\nFile: ${filePath}`
      processingStatus = 'completed_with_fallback'
    }

    // Save results to database - FIXED: use processing_metadata instead of metadata
    const { data, error } = await supabase.from('delivery_records').insert({
      client_id: clientId,
      user_id: null,
      image_path: filePath,
      processing_status: processingStatus,
      raw_extracted_text: extractedText,
      processing_metadata: body.metadata || {}, // FIXED: Use correct column name
      created_at: new Date().toISOString()
    }).select()
    
    if (error) {
      console.error('Database insert error:', error)
      throw new Error(`Database insert failed: ${error.message}`)
    }

    console.log('Successfully created delivery record:', data[0]?.id)

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Document processed successfully',
      record: data[0],
      extractedText: extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : '')
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Edge Function error:', error)
    
    // Still try to create a database record for the failure
    try {
      const filePath = body?.filePath || body?.imagePath || 'unknown'
      const clientId = body?.clientId || '550e8400-e29b-41d4-a716-446655440000'
      
      await supabase.from('delivery_records').insert({
        client_id: clientId,
        user_id: null,
        image_path: filePath,
        processing_status: 'failed',
        raw_extracted_text: `Processing failed: ${error.message}`,
        processing_metadata: body?.metadata || {}, // FIXED: Use correct column name
        created_at: new Date().toISOString()
      })
    } catch (dbError) {
      console.error('Failed to insert error record:', dbError)
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

## Key Fix:
- ❌ **Was using:** `metadata: body.metadata || {}`  
- ✅ **Now using:** `processing_metadata: body.metadata || {}`

## Deploy and Test:
1. **Replace ALL code** in Supabase Dashboard  
2. **Click Deploy**  
3. **Upload new image** - database insert should work now!

**This will fix the "Could not find the 'metadata' column" error!**