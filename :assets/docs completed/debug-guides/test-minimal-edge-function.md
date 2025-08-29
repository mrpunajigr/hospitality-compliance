# 🧪 Minimal Edge Function Test

## Purpose
Deploy a minimal version of the Edge Function to test if the basic structure is working.

## Minimal Test Code
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  try {
    console.log('🧪 MINIMAL TEST: Function is running')
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Parse request body
    const body = await req.json()
    console.log('📋 Request received:', body)

    // Simple database test
    try {
      const { data, error } = await supabase.from('delivery_records').insert({
        client_id: 'test-client-id',
        user_id: null,
        image_path: 'test/path.jpg',
        processing_status: 'minimal_test',
        raw_extracted_text: `MINIMAL TEST - ${new Date().toISOString()}`,
        error_message: null
      }).select()
      
      if (error) {
        console.error('❌ Database test failed:', error)
        return new Response(JSON.stringify({
          success: false,
          error: 'Database test failed',
          details: error
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      console.log('✅ Database test successful:', data)
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Minimal test passed',
        data: data
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
      
    } catch (dbError) {
      console.error('❌ Database exception:', dbError)
      return new Response(JSON.stringify({
        success: false,
        error: 'Database exception',
        details: dbError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('❌ Function error:', error)
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

## Test Steps
1. **Deploy this minimal code** to the Edge Function
2. **Test with simple request** - should create a test record
3. **Check logs** - should see green success messages
4. **If this works** - gradually add back original functionality
5. **If this fails** - environment variable or basic setup issue

## Expected Result
- ✅ Function boots without errors
- ✅ Database insert succeeds
- ✅ Returns success response
- ✅ Green logs instead of red errors

This will help us isolate whether the issue is:
- Basic function deployment
- Environment variables
- Database connection  
- Specific code in the full function