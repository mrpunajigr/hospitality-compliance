# Get Recent Edge Function Error Logs

## Now that the command is working, let's get the actual error logs:

### Command to get recent error logs:
```bash
npx supabase functions logs process-delivery-docket --follow=false --level=error
```

### Alternative - Get all recent logs:
```bash
npx supabase functions logs process-delivery-docket --follow=false
```

### If those don't work, try:
```bash
supabase functions logs process-delivery-docket
```

## What We're Looking For:

When you run this, look for recent log entries that show:

### ✅ Success Signs:
- "AWS Textract processing completed"
- "Text extraction successful"
- No error messages

### ❌ Error Signs (what we expect to see):
- **AccessDeniedException** - Your AWS user needs Textract permissions
- **InvalidRegionException** - Region mismatch
- **CredentialsError** - AWS credentials issue
- **ServiceUnavailableException** - Textract not available in your region
- **Function failed to start** errors

## Important:
Try uploading an image first, then immediately run the logs command to see the fresh error messages from your latest upload attempt.

**Run the command and look for red error text or recent timestamps matching your upload attempts!**