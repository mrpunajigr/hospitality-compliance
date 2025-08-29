# Final AWS Textract Debug Commands

## Current Status:
Your upload system is 99% working! Files upload, database records are created, but AWS Textract processing is failing with "Function failed to start" errors.

## What We Need to Do:
Get the specific AWS error message so I can tell you exactly what permission to add to your AWS account.

## Step 1: Upload a Test Image
1. Go to: `jigr.app/console/upload`
2. Upload any delivery docket image
3. Wait for it to fail with "AI processing failed"

## Step 2: Get Fresh Error Logs
**Copy and paste this command in terminal:**

```bash
npx supabase functions logs process-delivery-docket --follow=false | tail -20
```

## Step 3: Look for AWS Errors
In the output, look for lines containing:
- **AccessDeniedException** 
- **UnauthorizedOperation**
- **InvalidRegionException** 
- **ServiceUnavailableException**
- **CredentialsError**

## Most Likely Fix:
Based on typical AWS Textract issues, you probably need to:

### Add Textract Permissions to Your AWS User
1. Go to **AWS Console** → **IAM** → **Users** → **Your User**
2. Click **"Add permissions"** → **"Attach policies directly"**  
3. Search for and add: **"AmazonTextractFullAccess"**
4. Click **"Next"** → **"Add permissions"**

## Alternative Quick Test:
If logs don't show clear errors, try this simpler command:
```bash
npx supabase functions logs process-delivery-docket --follow=false | grep -i "error\|failed\|exception"
```

## Expected Outcome:
Once we see the specific AWS error message, I can give you the exact permission/configuration fix needed.

**Run Step 1 and Step 2, then send me a screenshot of the terminal output!**