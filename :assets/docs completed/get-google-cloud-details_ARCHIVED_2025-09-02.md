# Get Exact Google Cloud Details

## Steps to Get Correct Values

### 1. Get Project ID
In Google Cloud Console:
- Click the project dropdown at the top
- Copy the exact **Project ID** (not Project Name)

### 2. Get Processor Details  
In Document AI Console:
- Click on your processor name
- Copy the full processor ID from the URL or details page
- Note the exact location (us-central1, us-east1, etc.)

### 3. Test API URL Format
The processor detail page should show something like:
```
projects/YOUR-PROJECT-ID/locations/us-central1/processors/YOUR-PROCESSOR-ID
```

### 4. Update Secrets with Exact Values
```bash
# Update with exact values from Google Cloud Console
npx supabase secrets set GOOGLE_CLOUD_PROJECT_ID='exact-project-id-from-console'
npx supabase secrets set GOOGLE_DOCUMENT_AI_PROCESSOR_ID='exact-processor-id-from-console'
```

### 5. Test Again
After updating secrets:
```bash
npx supabase functions deploy process-delivery-docket
```

## Current Values (from logs)
- PROJECT_ID: `hospitality-compliance-apps`
- PROCESSOR_ID: `2a6c7e6c9f5bbf39`
- LOCATION: `us-central1`

**One of these doesn't match your Google Cloud setup - check each one against the console.**