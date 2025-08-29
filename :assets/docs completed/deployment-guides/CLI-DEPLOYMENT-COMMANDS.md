# 🚀 CLI Deployment Commands - Full Instructions

## Step 1: Navigate to Project Directory
```bash
cd /Users/mrpuna/Claude_Projects/hospitality-compliance
```

## Step 2: Create Clean Edge Function File
```bash
cat > supabase/functions/process-delivery-docket/index.ts << 'EOF'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const body = await req.json()
    console.log('🧪 CLI DEPLOYMENT TEST: Function running successfully')

    const { data, error } = await supabase.from('delivery_records').insert({
      client_id: 'cli-test-client',
      user_id: null,
      image_path: 'test/cli-deployment.jpg',
      processing_status: 'cli_test_success',
      raw_extracted_text: 'CLI Deployment Test - ' + new Date().toISOString(),
      error_message: null
    }).select()
    
    if (error) {
      console.error('❌ Database error:', error)
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message,
        source: 'cli_deployment_test'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('✅ CLI deployment test successful - database record created')
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'CLI deployment working perfectly!',
      record: data,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Function error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
EOF
```

## Step 3: Deploy via CLI
```bash
npx supabase functions deploy process-delivery-docket --project-ref jyxypcyrtdpqgapnkhec
```

## Step 4: Alternative CLI Deploy (if step 3 fails)
```bash
npx supabase functions deploy process-delivery-docket
```

## Step 5: Verify Deployment
```bash
npx supabase functions list --project-ref jyxypcyrtdpqgapnkhec
```

## What This Will Do
1. ✅ **Bypass Dashboard**: Avoids the corrupted web editor completely
2. ✅ **Clean Syntax**: Creates file with perfect syntax directly
3. ✅ **Test Database**: Verifies user_id: null fix works
4. ✅ **Show Success**: Should create green logs instead of red errors

## If CLI Deploy Succeeds
- Test upload at https://jigr.app/capture
- Should see "CLI deployment working perfectly!" in logs
- Database record should be created successfully
- No more syntax errors!

## If CLI Deploy Fails
- Try the alternative command (Step 4)
- Check if Supabase CLI is authenticated
- May need to run: `npx supabase login`

**Run these commands in order - this should completely bypass the dashboard syntax error issue!**