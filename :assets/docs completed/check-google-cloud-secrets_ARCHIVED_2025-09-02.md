# Check Google Cloud Secrets in Supabase

## Commands to Run

```bash
# 1. List all secrets to see if Google Cloud credentials are set
npx supabase secrets list

# 2. Deploy the updated Edge Function with enhanced logging
npx supabase functions deploy process-delivery-docket

# 3. Test with a real image file through the interface
# Go to: http://localhost:3000/capture
# Upload a real delivery docket image
# Check the console logs and Supabase Edge Function logs
```

## Expected Secrets
The following environment variables should be set in Supabase:

1. **GOOGLE_CREDENTIALS** - Full JSON service account key
2. **GOOGLE_PROJECT_ID** - Google Cloud Project ID  
3. **GOOGLE_PROCESSOR_ID** - Document AI Processor ID

## Validation Steps

### Step 1: Check if secrets exist
```bash
npx supabase secrets list
```

Should show:
```
GOOGLE_CREDENTIALS (exists)
GOOGLE_PROJECT_ID (exists) 
GOOGLE_PROCESSOR_ID (exists)
```

### Step 2: Deploy updated function
```bash
npx supabase functions deploy process-delivery-docket
```

### Step 3: Test with real file
1. Go to `/capture` page
2. Upload a delivery docket image
3. Check browser console for detailed logs
4. Check Supabase Dashboard > Edge Functions > process-delivery-docket > Logs

## Expected Log Output (Success)
```
🔐 Checking Google Cloud credentials...
  📋 PROJECT_ID: Set
  📋 PROCESSOR_ID: Set  
  📋 GOOGLE_CREDENTIALS: Set (2847 chars)
✅ Google Cloud credentials JSON parsed successfully
  📋 client_email: Set
  📋 private_key: Set
  📋 private_key_id: Set
🔑 Creating JWT for Google Cloud authentication...
🔑 JWT created successfully, getting access token...
✅ Access token obtained successfully
🌐 Calling Google Cloud Document AI API...
📡 Google Cloud API Response Status: 200 OK
✅ Google Cloud extraction successful!
```

## Expected Log Output (Failure)
```
❌ GOOGLE CLOUD EXTRACTION FAILED:
  🚨 Error Type: Error
  🚨 Error Message: [specific error message]
🔄 FALLING BACK TO DEMO DATA GENERATION
⚠️ NOTE: Real Google Cloud extraction failed - returning simulated data
```

## Troubleshooting Guide

### If GOOGLE_CREDENTIALS is missing:
```bash
# Set the credentials (replace with actual service account JSON)
npx supabase secrets set GOOGLE_CREDENTIALS='{"type":"service_account",...}'
```

### If GOOGLE_PROJECT_ID is missing:
```bash
# Set your Google Cloud Project ID
npx supabase secrets set GOOGLE_PROJECT_ID='your-project-id'
```

### If GOOGLE_PROCESSOR_ID is missing:
```bash
# Set your Document AI Processor ID
npx supabase secrets set GOOGLE_PROCESSOR_ID='your-processor-id'
```

### If credentials are malformed:
The enhanced error logging will now show exactly what's wrong with the JSON format.

## Testing Results

After running these commands, you should be able to determine:

1. ✅ **Secrets are properly set** - All three environment variables exist
2. ✅ **Credentials are valid JSON** - The JSON parses successfully  
3. ✅ **JWT creation works** - Authentication with Google Cloud succeeds
4. ✅ **API call succeeds** - Google Cloud Document AI processes the file
5. ✅ **Real extraction works** - Actual text is extracted, not demo data

If any step fails, the enhanced logging will show exactly where the issue is occurring.