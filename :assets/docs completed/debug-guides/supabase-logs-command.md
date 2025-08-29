# Supabase Edge Function Logs Command

## Get Edge Function Logs to Debug AWS Textract Issues

Copy and paste this exact command into your terminal:

```bash
npx supabase functions logs process-delivery-docket
```

## Alternative Commands (if the first one doesn't work):

### Option 2:
```bash
npx supabase functions logs --function-name=process-delivery-docket
```

### Option 3 (with project reference):
```bash
npx supabase functions logs process-delivery-docket --project-ref rggdywqnvpuwssluzfud
```

### Option 4 (recent logs only):
```bash
npx supabase functions logs process-delivery-docket --follow=false
```

## What We're Looking For:

The logs will show us the exact AWS error causing "Function failed to start":

### ✅ Success Signs:
- AWS credentials loaded successfully
- AWS Textract API call completed
- Text extraction working

### ❌ Error Signs:
- "AccessDeniedException" - AWS permissions issue
- "InvalidRegionException" - Wrong AWS region
- "CredentialsError" - AWS credentials problem
- "ServiceUnavailable" - AWS Textract not available in region

## After Running the Command:
1. Look for recent error messages in red
2. Copy the exact error text
3. Send a screenshot of the error output
4. We'll fix the specific AWS configuration issue

Run the first command and let's see what AWS error is preventing your real OCR processing!