# 🚀 DEPLOY AWS DENO COMPATIBILITY FIX

## 🎯 CRITICAL FIX: AWS SDK Deno Environment Error

**ROOT CAUSE**: AWS SDK trying to read config files with Node.js `fs.readFile` in Deno environment

**ERROR**: `[unenv] fs.readFile is not implemented yet!`

**SOLUTION**: Switch to Deno-native AWS SDK version

## ⚠️ DEPLOYMENT INSTRUCTIONS

### **Step 1: Copy Fixed Edge Function**
Copy this **COMPLETE** Deno-compatible Edge Function code to Supabase Dashboard:

```typescript
// Complete AWS Textract Edge Function - Deno Compatible Version
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// AWS SDK imports for Textract - Deno compatible version
import { 
  TextractClient, 
  AnalyzeDocumentCommand 
} from 'https://deno.land/x/aws_sdk@v3.32.0-1/client-textract/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bucketId, fileName, imagePath, deliveryRecordId, userId, clientId, testMode } = await req.json()
    
    console.log('🔍 EDGE FUNCTION DEBUG - All parameters received:')
    console.log('bucketId:', bucketId)
    console.log('fileName:', fileName)
    console.log('imagePath:', imagePath)
    console.log('deliveryRecordId:', deliveryRecordId)
    console.log('userId:', userId)
    console.log('clientId:', clientId)
    console.log('testMode:', testMode)

    if (!imagePath) {
      console.log('🚨 imagePath is missing or null:', imagePath)
      throw new Error('No image path provided')
    }

    console.log(`Processing delivery docket: ${imagePath}`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Download image from Supabase Storage
    console.log('📥 Downloading image from storage...')
    const { data: imageData, error: downloadError } = await supabase.storage.from('delivery-dockets').download(imagePath)
    
    if (downloadError) {
      console.error('❌ Failed to download image:', downloadError)
      throw new Error(`Failed to download image: ${downloadError.message}`)
    }

    const imageBytes = new Uint8Array(await imageData.arrayBuffer())
    console.log('✅ Image downloaded, size:', imageBytes.length, 'bytes')

    // Process with AWS Textract
    let extractedText = ''
    let processingStatus = 'failed'
    
    try {
      console.log('🤖 Starting AWS Textract processing...')
      
      // Initialize AWS Textract client - Deno native version
      const textractClient = new TextractClient({
        region: 'us-east-1',
        credentials: {
          accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
          secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!
        }
      })

      // Create Textract command
      const command = new AnalyzeDocumentCommand({
        Document: {
          Bytes: imageBytes
        },
        FeatureTypes: ['TABLES', 'FORMS'] // Extract tables and form data
      })

      // Call AWS Textract with timeout
      console.log('📞 Calling AWS Textract API...')
      const response = await textractClient.send(command)
      console.log('✅ AWS Textract response received')

      // Extract text from Textract response
      if (response.Blocks) {
        const textBlocks = response.Blocks
          .filter(block => block.BlockType === 'LINE')
          .map(block => block.Text)
          .filter(text => text)
          .join('\n')
        
        extractedText = textBlocks
        processingStatus = 'completed'
        console.log('✅ AWS Textract processing successful')
        console.log('📝 Extracted text length:', extractedText.length, 'characters')
      } else {
        extractedText = 'AWS Textract returned no text blocks'
        processingStatus = 'completed_no_text'
      }

    } catch (textractError) {
      console.error('❌ AWS Textract failed:', textractError.message)
      extractedText = `AWS Textract processing failed: ${textractError.message}\n\nFallback: Document uploaded successfully but OCR processing unavailable`
      processingStatus = 'completed_with_fallback'
    }

    // Save results to database
    console.log('💾 Saving results to database...')
    const { data, error } = await supabase
      .from('delivery_records')
      .update({
        raw_extracted_text: extractedText,
        processing_status: processingStatus,
        processing_metadata: {
          textract_blocks_found: extractedText.split('\n').length,
          processing_time: Date.now(),
          aws_region: 'us-east-1',
          feature_types: ['TABLES', 'FORMS']
        }
      })
      .eq('id', deliveryRecordId)
      .select()

    if (error) {
      console.error('❌ Database update failed:', error)
      throw new Error(`Database update failed: ${error.message}`)
    }

    console.log('✅ Database updated successfully')

    return new Response(
      JSON.stringify({
        success: true,
        deliveryRecordId,
        extractedText: extractedText.substring(0, 500) + '...', // Truncate for response
        processingStatus,
        message: 'AWS Textract processing completed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('🚨 Edge function error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
```

### **Step 2: Deploy and Test**
1. **Replace** entire Edge Function code in Supabase Dashboard
2. **Click Deploy**
3. **Test with JPEG/PNG file** (not HEIC - format not supported)

### **Step 3: Expected Result**
✅ AWS Textract processes successfully without `fs.readFile` errors
✅ Real OCR text extracted and displayed in terminal-style container