# Edge Function Debug Logging Instructions

## ✅ **Environment Variable Fix Confirmed**
The Edge Function is using the correct environment variable:
```typescript
const DOCUMENT_AI_PROCESSOR_ID = Deno.env.get('GOOGLE_DOCUMENT_AI_PROCESSOR_ID');
```

## 🔍 **Next Step: Add Debug Logging**

**Add this debug code after line 9 in the Supabase Edge Function:**

```typescript
// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const GOOGLE_CREDENTIALS = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS');
const DOCUMENT_AI_PROCESSOR_ID = Deno.env.get('GOOGLE_DOCUMENT_AI_PROCESSOR_ID');

// 🔍 DEBUG LOGGING - Add these lines:
console.log('🔍 Environment Variables Check:');
console.log('  GOOGLE_CREDENTIALS available:', !!GOOGLE_CREDENTIALS);
console.log('  DOCUMENT_AI_PROCESSOR_ID available:', !!DOCUMENT_AI_PROCESSOR_ID);
console.log('  Processor ID value:', DOCUMENT_AI_PROCESSOR_ID ? DOCUMENT_AI_PROCESSOR_ID.substring(0, 20) + '...' : 'MISSING');

// Initialize Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
```

## 🎯 **Expected Debug Output**

After adding the debug logging and uploading a document, you should see in the Edge Function logs:

**✅ Success case:**
```
🔍 Environment Variables Check:
  GOOGLE_CREDENTIALS available: true
  DOCUMENT_AI_PROCESSOR_ID available: true
  Processor ID value: 3640443ed736a53de12c...
```

**❌ Problem case:**
```
🔍 Environment Variables Check:
  GOOGLE_CREDENTIALS available: true
  DOCUMENT_AI_PROCESSOR_ID available: false
  Processor ID value: MISSING
```

## 📋 **Steps:**

1. **Add Debug Code**: Copy the debug logging lines above after line 9
2. **Deploy Function**: Click Deploy in Supabase Dashboard  
3. **Upload Test Document**: Upload a delivery docket
4. **Check Logs**: Go to Edge Functions → Logs to see the debug output
5. **Report Results**: Share what the debug output shows

This will tell us exactly which environment variable is missing or malformed.