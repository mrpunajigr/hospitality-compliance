# AWS Textract Debug Test

## The Issue: AWS Textract processing is failing (not the credentials or Edge Function startup)

## Quick AWS Debug Test:
Copy and paste this into your browser console at jigr.app:

```javascript
console.clear()
console.log('🔍 AWS TEXTRACT DEBUG TEST...')

// Test the Edge Function directly with minimal data
fetch('/api/debug-upload', { 
    method: 'POST', 
    body: new FormData()
})
.then(response => {
    console.log('🔍 Response status:', response.status)
    return response.json()
})
.then(data => {
    console.log('🔍 DEBUG RESPONSE:', data)
    if (data.results && data.results.edgeFunction) {
        console.log('🔍 EDGE FUNCTION DETAILS:', data.results.edgeFunction)
    }
})
.catch(error => {
    console.error('🔍 DEBUG ERROR:', error)
})
```

## What We're Looking For:

### ✅ SUCCESS Signs:
- Edge Function returns successful response
- AWS Textract processes mock data
- No AWS permission errors

### ❌ FAILURE Signs:
- AWS region errors ("InvalidRegionException")  
- AWS permission errors ("AccessDeniedException")
- AWS service errors ("InvalidParameterException")
- Textract format errors ("UnsupportedDocumentException")

## Possible Quick Fixes:

### 1. AWS Region Issue:
Make sure your AWS_REGION in Supabase matches where your AWS account/Textract is available:
- `us-east-1` (most common)
- `us-west-2` 
- `eu-west-1`

### 2. AWS Textract Permissions:
Your AWS user might need these permissions:
- `textract:DetectDocumentText`
- `textract:AnalyzeDocument`

### 3. AWS Service Availability:
Textract might not be available in your region.

Run the debug test and we'll see the exact AWS error!