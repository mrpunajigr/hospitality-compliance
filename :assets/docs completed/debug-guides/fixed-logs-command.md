# Fixed Supabase Logs Command

## The Issue:
The previous command failed with "unknown flag: --project-ref"

## Try These Commands (in order):

### Command 1 (Simplest):
```bash
npx supabase functions logs process-delivery-docket
```

### Command 2 (If #1 doesn't work):
```bash
supabase functions logs process-delivery-docket
```

### Command 3 (With debug flag):
```bash
npx supabase functions logs process-delivery-docket --debug
```

### Command 4 (Different syntax):
```bash
npx supabase logs --type edge-function --function process-delivery-docket
```

## What We Need:
We need to see the **Edge Function execution logs** that will show us:
- Why AWS Textract API calls are failing
- AWS permission errors
- Authentication issues

## Expected Error Messages:
Look for these AWS-specific errors in the logs:
- `AccessDeniedException` - AWS permissions issue
- `InvalidRegionException` - Wrong region
- `CredentialsError` - AWS credentials problem
- `ServiceUnavailableException` - Textract not available

**Try Command 1 first, then work down the list until one works!**