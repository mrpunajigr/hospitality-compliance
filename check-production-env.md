# Check Production Environment Variables

## The Issue
Upload is working but Edge Function fails to start with "Function failed to start (please check logs)".

## Root Cause Analysis
The problem is likely missing AWS credentials in the Supabase Edge Function environment.

## Steps to Fix

### 1. Check Supabase Edge Function Environment Variables
Go to your Supabase Dashboard:
1. Navigate to Edge Functions
2. Click on `process-delivery-docket`
3. Check if these environment variables are set:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` (should be something like `us-east-1`)

### 2. If Missing, Add AWS Credentials
You'll need to add the same AWS credentials you set up earlier:
- Go to Supabase Dashboard → Project Settings → Edge Functions
- Add environment variables for AWS Textract access
- Use the same credentials from your AWS account

### 3. Alternative Quick Test
To verify this is the issue, you can temporarily check the Edge Function logs:
1. Go to Supabase Dashboard
2. Navigate to Edge Functions → process-delivery-docket
3. Click on "Invocations" or "Logs" tab
4. Look for recent errors showing AWS credential issues

## Expected Error Messages
If AWS credentials are missing, you should see errors like:
- "AWS credentials not found"
- "Missing region in config" 
- "Unable to locate credentials"
- "Function failed to start"

## Once Fixed
After adding the AWS credentials, the upload should work completely:
✅ File upload to storage
✅ AWS Textract OCR processing  
✅ Database record creation
✅ Results displayed in dashboard