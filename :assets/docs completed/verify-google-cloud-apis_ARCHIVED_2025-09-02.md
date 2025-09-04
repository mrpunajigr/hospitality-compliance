# Verify Google Cloud APIs

## Commands to Run in Google Cloud Shell

```bash
# Enable required APIs
gcloud services enable documentai.googleapis.com
gcloud services enable aiplatform.googleapis.com  
gcloud services enable cloudresourcemanager.googleapis.com

# List enabled APIs to confirm
gcloud services list --enabled | grep documentai
```

## How to Access Google Cloud Shell

1. **Go to Google Cloud Console** (console.cloud.google.com)
2. **Click the Cloud Shell icon** (>_) in the top-right toolbar
3. **Wait for terminal to load**
4. **Copy and paste the commands above**

## Expected Output

After running the enable commands, you should see:
```
Operation "operations/..." finished successfully.
```

After running the list command, you should see:
```
documentai.googleapis.com                    Cloud Document AI API
```

## What This Fixes

The 403 CONSUMER_INVALID error might be because:
- Document AI API isn't properly enabled at the project level
- Required dependent APIs aren't enabled
- API enablement needs to be done via gcloud CLI vs Console UI

## After Running These Commands

1. **Test the upload again** in our application
2. **Look for "📡 Google Cloud API Response Status: 200 OK"**
3. **Should see real extracted text** instead of demo data

This should resolve the persistent 403 authentication issues we've been experiencing.