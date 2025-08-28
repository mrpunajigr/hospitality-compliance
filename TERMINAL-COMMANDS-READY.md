# 🎯 TERMINAL IS READY - Run These Commands

You're now in Terminal with the `bash-3.2$` prompt. Copy and paste these commands one at a time:

## Command 1: Navigate to Project
```bash
cd /Users/mrpuna/Claude_Projects/hospitality-compliance
```

## Command 2: Create Clean Edge Function
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

## Command 3: Deploy to Supabase
```bash
npx supabase functions deploy process-delivery-docket --project-ref jyxypcyrtdpqgapnkhec
```

## What You Should See:
- After Command 1: Directory changes (no error message = success)
- After Command 2: File created (cursor returns to `bash-3.2$` prompt)  
- After Command 3: "Deployment complete" or similar success message

## Run Commands One at a Time:
1. Copy Command 1, paste in Terminal, press Enter
2. Copy Command 2, paste in Terminal, press Enter  
3. Copy Command 3, paste in Terminal, press Enter

**This will bypass the dashboard completely and deploy via CLI!**