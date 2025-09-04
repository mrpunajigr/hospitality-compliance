# Debug Google Cloud Secrets

## Check Current Secret Values

```bash
# Check what PROJECT_ID is actually set to
npx supabase secrets list | grep GOOGLE

# Test if we can get a token (this will fail with 404 if PROJECT_ID is wrong)
# The logs will show the exact URL being called
```

## Common Issues for 404 Not Found

### 1. Wrong PROJECT_ID
Your `GOOGLE_CLOUD_PROJECT_ID` might not match your actual Google Cloud project.

**Check in Google Cloud Console:**
- Go to Google Cloud Console → Project Info
- Copy the exact Project ID (not Project Name)

### 2. Wrong PROCESSOR_ID  
Your `GOOGLE_DOCUMENT_AI_PROCESSOR_ID` might be incorrect.

**Check in Google Cloud Console:**
- Go to Document AI → Processors
- Click your processor → Copy the Processor ID from the URL
- URL format: `projects/PROJECT_ID/locations/LOCATION/processors/PROCESSOR_ID`

### 3. Wrong LOCATION
Currently hardcoded to `'us'` but might need to be:
- `us-central1`
- `us-east1` 
- `europe-west1`
- etc.

**Check in Google Cloud Console:**
- Document AI → Processors → Your processor
- Look at the location in the processor details

## Test Commands

```bash
# 1. Redeploy with enhanced logging
npx supabase functions deploy process-delivery-docket

# 2. Test upload - check console logs for:
#    📡 Full API URL: https://documentai.googleapis.com/v1/projects/[PROJECT]/locations/[LOCATION]/processors/[PROCESSOR]:process
#    
# 3. Verify the URL components match your Google Cloud setup
```

## Expected Fix
Once you verify the correct PROJECT_ID, PROCESSOR_ID, and LOCATION in Google Cloud Console, update the secrets:

```bash
# Update with correct values
npx supabase secrets set GOOGLE_CLOUD_PROJECT_ID='your-actual-project-id'
npx supabase secrets set GOOGLE_DOCUMENT_AI_PROCESSOR_ID='your-actual-processor-id'

# If location is wrong, we'll need to update the hardcoded LOCATION in the Edge Function
```