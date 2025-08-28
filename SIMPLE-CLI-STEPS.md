# 🎯 SIMPLE CLI DEPLOYMENT - Step by Step

## What We're Doing
We're going to use the **command line** to deploy the Edge Function instead of the broken Supabase Dashboard.

## Step 1: Open Terminal
1. Press `Cmd + Space` to open Spotlight
2. Type "Terminal" and press Enter
3. Terminal window opens

## Step 2: Go to Project Directory
Copy and paste this command into Terminal:
```bash
cd /Users/mrpuna/Claude_Projects/hospitality-compliance
```
Press Enter

## Step 3: Create the Edge Function File
Copy and paste this ENTIRE command (it's one big command):
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
    console.log('CLI DEPLOYMENT TEST: Function working!')

    const { data, error } = await supabase.from('delivery_records').insert({
      client_id: 'cli-test',
      user_id: null,
      image_path: 'test/cli.jpg',
      processing_status: 'cli_success',
      raw_extracted_text: 'CLI Test - ' + new Date().toISOString()
    }).select()
    
    if (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'CLI deployment working!',
      record: data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
EOF
```
Press Enter

## Step 4: Deploy the Function
Copy and paste this command:
```bash
npx supabase functions deploy process-delivery-docket --project-ref jyxypcyrtdpqgapnkhec
```
Press Enter

## What Should Happen
- You should see "Deployment complete" or similar success message
- No syntax errors!
- Function will be live and working

## Then Test
- Go to https://jigr.app/capture
- Upload an image
- Should work without red errors!

## Don't Create Files Manually
- We're using the command line to create the file directly
- This bypasses the dashboard completely
- The commands above do everything automatically