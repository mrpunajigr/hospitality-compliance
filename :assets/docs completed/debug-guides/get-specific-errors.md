# Get Specific AWS Textract Errors

## I can see the logs are flowing, but I need to see the exact error messages!

### Method 1: Filter for AWS-related errors
```bash
npx supabase functions logs process-delivery-docket --follow=false | grep -A 5 -B 5 -i "AWS\|textract\|error\|failed"
```

### Method 2: Get only the last 50 log entries
```bash
npx supabase functions logs process-delivery-docket --follow=false | tail -50
```

### Method 3: Search for specific error patterns
```bash
npx supabase functions logs process-delivery-docket --follow=false | grep -i "exception\|denied\|invalid\|unauthorized"
```

### Method 4: Get raw logs and search
```bash
npx supabase functions logs process-delivery-docket --follow=false > logs_output.txt
```
Then open `logs_output.txt` and search for error messages.

## What We're Hunting For:

Based on the browser console, I can see processing is happening but there are likely AWS-specific errors like:

### Most Likely AWS Errors:
- **`AccessDeniedException`** - Your AWS user doesn't have Textract permissions
- **`UnauthorizedOperation`** - AWS credentials don't have the right policies
- **`InvalidRegionException`** - Wrong AWS region configured
- **`ServiceUnavailableException`** - AWS Textract not available in your region

## Quick Test:
1. **Try Method 2 first** (get last 50 entries)
2. Look for any lines with **red text** or **error keywords**
3. Screenshot the results

**The error message will tell us exactly what AWS permission or configuration needs to be fixed!**